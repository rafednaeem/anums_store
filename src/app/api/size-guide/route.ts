import { NextResponse } from "next/server";
import { sanityClient, isSanityConfigured } from "@/lib/sanityClient";

export async function GET(req: Request) {
  if (!isSanityConfigured) {
    return NextResponse.json(null);
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  if (!category) {
    return NextResponse.json(null);
  }

  const guide = await sanityClient.fetch(
    `*[_type == "sizeGuide" && category == $category][0]{
      title,
      category,
      measurements,
      notes,
    }`,
    { category },
  );

  return NextResponse.json(guide ?? null);
}
