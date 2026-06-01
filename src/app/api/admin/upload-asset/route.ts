import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { uploadProductAsset } from "@/lib/supabase-products";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      },
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session || session.user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = formData.get("folder");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (folder !== "images" && folder !== "pdfs") {
      return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
    }

    if (folder === "pdfs" && file.type !== "application/pdf") {
      return NextResponse.json({ error: "Catalog must be a PDF" }, { status: 400 });
    }

    if (folder === "pdfs" && file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Catalog PDF must be 10 MB or smaller" }, { status: 400 });
    }

    if (folder === "images" && !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Image upload must be an image file" }, { status: 400 });
    }

    const url = await uploadProductAsset(file, folder);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Product asset upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload asset" },
      { status: 500 },
    );
  }
}
