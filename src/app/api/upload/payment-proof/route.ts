import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPG, PNG, WEBP" },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size: 5MB" },
        { status: 400 }
      )
    }

    const serviceRole = createServiceRoleClient()

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const safeExt = ["jpg", "jpeg", "png", "webp"].includes(fileExt)
      ? fileExt
      : "jpg"
    const fileName = `proof-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${safeExt}`
    const filePath = `payment-proofs/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    const { error: uploadError } = await serviceRole.storage
      .from("payment-proofs")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      )
    }

    const { data: urlData } = await serviceRole.storage
      .from("payment-proofs")
      .createSignedUrl(filePath, 90 * 24 * 60 * 60) // 90 days

    return NextResponse.json({
      url: urlData?.signedUrl ?? filePath,
      path: filePath,
      filename: file.name,
    })
  } catch (error: unknown) {
    console.error("Payment proof upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
