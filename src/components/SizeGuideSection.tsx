"use client";

import { useEffect, useState } from "react";
import { Ruler } from "lucide-react";

interface Measurement {
  size?: string;
  bust?: string;
  waist?: string;
  hips?: string;
  length?: string;
}

interface SizeGuideData {
  title: string;
  category: string;
  measurements: Measurement[];
  notes?: string;
}

export default function SizeGuideSection({ category }: { category?: string }) {
  const [guide, setGuide] = useState<SizeGuideData | null>(null);

  useEffect(() => {
    if (!category) return;

    fetch(`/api/size-guide?category=${encodeURIComponent(category)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) setGuide(data);
      })
      .catch(() => {});
  }, [category]);

  if (!guide) return null;

  const hasMeasurements = guide.measurements && guide.measurements.length > 0;

  return (
    <div className="border-t border-gray-200 pt-10">
      <h2 className="mb-4 flex items-center gap-2 text-2xl font-heading text-ethereal-lavender">
        <Ruler className="h-6 w-6 text-ethereal-blush" />
        {guide.title || "Size Guide"}
      </h2>

      {hasMeasurements ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-ethereal-lavender text-ethereal-silver">
                <th className="border border-ethereal-lavender p-2 text-left">Size</th>
                {guide.measurements[0]?.bust !== undefined && (
                  <th className="border border-ethereal-lavender p-2">Bust</th>
                )}
                {guide.measurements[0]?.waist !== undefined && (
                  <th className="border border-ethereal-lavender p-2">Waist</th>
                )}
                {guide.measurements[0]?.hips !== undefined && (
                  <th className="border border-ethereal-lavender p-2">Hips</th>
                )}
                {guide.measurements[0]?.length !== undefined && (
                  <th className="border border-ethereal-lavender p-2">Length</th>
                )}
              </tr>
            </thead>
            <tbody>
              {guide.measurements.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-200 p-2 font-bold">{row.size || `Size ${i + 1}`}</td>
                  {row.bust !== undefined && (
                    <td className="border border-gray-200 p-2 text-center">{row.bust || "—"}</td>
                  )}
                  {row.waist !== undefined && (
                    <td className="border border-gray-200 p-2 text-center">{row.waist || "—"}</td>
                  )}
                  {row.hips !== undefined && (
                    <td className="border border-gray-200 p-2 text-center">{row.hips || "—"}</td>
                  )}
                  {row.length !== undefined && (
                    <td className="border border-gray-200 p-2 text-center">{row.length || "—"}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-foreground/50">
            Size guide measurements are not yet available.
          </p>
          <p className="mt-1 text-xs text-foreground/40">
            Add measurements in Sanity Studio under Size Guide &rarr; {guide.title}
          </p>
        </div>
      )}

      {guide.notes && (
        <p className="mt-4 text-sm leading-relaxed text-foreground/60">{guide.notes}</p>
      )}
    </div>
  );
}
