import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { isAdminConfigured, supabaseAdmin } from "@/lib/supabase-admin";
import {
  verifySafepaySignature,
  verifyCashmaalSignature,
  detectPaymentGateway,
  SAFEPAY_WEBHOOK_HEADER,
  CASHMAAL_WEBHOOK_HEADER,
  SAFEPAY_SUCCESS_STATUSES,
  CASHMAAL_SUCCESS_STATUSES,
} from "@/lib/payments";

const CASHMAAL_IPN_OK_RESPONSE = "**OK**";

function getString(value: FormDataEntryValue | unknown) {
  return typeof value === "string" ? value : "";
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const ipnKey = getString(formData.get("ipn_key"));
      const webId = getString(formData.get("web_id"));
      const status = getString(formData.get("status"));
      const orderId = getString(formData.get("order_id"));
      const amount = Number(getString(formData.get("Amount")));
      const currency = getString(formData.get("currency")).toUpperCase();

      if (!process.env.CASHMAAL_IPN_KEY || !process.env.CASHMAAL_WEB_ID) {
        return NextResponse.json({ error: "Cashmaal IPN is not configured" }, { status: 503 });
      }

      if (ipnKey !== process.env.CASHMAAL_IPN_KEY || webId !== process.env.CASHMAAL_WEB_ID) {
        return NextResponse.json({ error: "Invalid Cashmaal IPN" }, { status: 401 });
      }

      if (!orderId) {
        return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
      }

      if (status !== "1") {
        return new NextResponse(CASHMAAL_IPN_OK_RESPONSE, {
          headers: { "Content-Type": "text/plain" },
        });
      }

      const db = isAdminConfigured ? supabaseAdmin : supabase;
      const { data: order, error: orderError } = await db
        .from("orders")
        .select("id,total,payment_status")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (currency !== "PKR" || !Number.isFinite(amount) || amount < Number(order.total)) {
        return NextResponse.json({ error: "Cashmaal amount mismatch" }, { status: 400 });
      }

      if (order.payment_status !== "paid") {
        const { error: updateError } = await db
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
          })
          .eq("id", orderId);

        if (updateError) throw updateError;
      }

      return new NextResponse(CASHMAAL_IPN_OK_RESPONSE, {
        headers: { "Content-Type": "text/plain" },
      });
    }

    const rawBody = await req.text();

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const gateway = detectPaymentGateway(body);
    if (!gateway) {
      return NextResponse.json(
        { error: "Unknown or missing payment gateway fields" },
        { status: 400 }
      );
    }

    let orderId: string | null = null;
    let status: string | null = null;

    if (gateway === "safepay") {
      const signature = req.headers.get(SAFEPAY_WEBHOOK_HEADER);
      if (!verifySafepaySignature(rawBody, signature)) {
        return NextResponse.json(
          { error: "Invalid Safepay webhook signature" },
          { status: 401 }
        );
      }

      const data = body.data as Record<string, unknown> | undefined;
      orderId = (data?.order_id as string) || null;
      status = (body.status as string) || (data?.status as string) || null;

      if (!orderId || !SAFEPAY_SUCCESS_STATUSES.has(status ?? "")) {
        return NextResponse.json({ success: true, ignored: true });
      }
    }

    if (gateway === "cashmaal") {
      const signature = req.headers.get(CASHMAAL_WEBHOOK_HEADER);
      if (!verifyCashmaalSignature(rawBody, signature)) {
        return NextResponse.json(
          { error: "Invalid Cashmaal webhook signature" },
          { status: 401 }
        );
      }

      orderId = (body.reference as string) || null;
      status = (body.status as string) || null;

      if (!orderId || !CASHMAAL_SUCCESS_STATUSES.has(status ?? "")) {
        return NextResponse.json({ success: true, ignored: true });
      }
    }

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing order identifier" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("orders")
      .select("payment_status")
      .eq("id", orderId)
      .single();

    if (existing?.payment_status === "paid") {
      return NextResponse.json({ success: true, already_processed: true });
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
      })
      .eq("id", orderId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Payment confirmation error:", error);
    return NextResponse.json(
      { error: "Unable to confirm payment right now." },
      { status: 500 }
    );
  }
}
