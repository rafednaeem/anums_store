import crypto from "crypto";

export function verifySafepaySignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.SAFEPAY_SECRET;
  if (!secret || !signatureHeader) return false;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  try {
    const received = Buffer.from(signatureHeader);
    const expected = Buffer.from(expectedSig);
    if (received.length !== expected.length) return false;
    return crypto.timingSafeEqual(received, expected);
  } catch {
    return false;
  }
}

export function verifyCashmaalSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.CASHMAAL_SECRET;
  if (!secret || !signatureHeader) return false;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  try {
    const received = Buffer.from(signatureHeader);
    const expected = Buffer.from(expectedSig);
    if (received.length !== expected.length) return false;
    return crypto.timingSafeEqual(received, expected);
  } catch {
    return false;
  }
}

export function detectPaymentGateway(
  body: Record<string, unknown>
): "safepay" | "cashmaal" | null {
  if ("event" in body && "data" in body) return "safepay";
  if ("reference" in body) return "cashmaal";
  return null;
}

export const SAFEPAY_WEBHOOK_HEADER = "x-sfpy-signature";
export const CASHMAAL_WEBHOOK_HEADER = "x-cashmaal-signature";

export const CASHMAAL_SUCCESS_STATUSES = new Set(["success", "paid", "completed"]);
export const SAFEPAY_SUCCESS_STATUSES = new Set(["success", "paid", "completed"]);
