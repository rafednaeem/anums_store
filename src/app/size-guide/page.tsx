import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Size Guide - Anums Store",
  description: "Find your perfect fit with our Pakistani standard size chart.",
};

export default function SizeGuidePage() {
  const sizes = [
    { label: "XS", bust: "34 / 86", waist: "26 / 66", hip: "36 / 91" },
    { label: "S", bust: "36 / 91", waist: "28 / 71", hip: "38 / 96" },
    { label: "M", bust: "38 / 96", waist: "30 / 76", hip: "40 / 101" },
    { label: "L", bust: "41 / 104", waist: "33 / 84", hip: "43 / 109" },
    { label: "XL", bust: "44 / 112", waist: "36 / 91", hip: "46 / 117" },
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-5xl font-heading text-ethereal-lavender mb-8">Size Guide</h1>
      <div className="w-24 h-1 bg-ethereal-blush mb-12"></div>

      <div className="bg-white border-t-8 border-ethereal-silver shadow-lg overflow-hidden">
        <div className="p-8 bg-ethereal-silver/5 border-b border-ethereal-silver/20">
          <p className="text-ethereal-lavender font-bold">Measurements are shown as: Inches / Centimetres</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ethereal-lavender text-ethereal-silver uppercase text-sm tracking-widest font-heading">
                <th className="p-6 border-r border-ethereal-lavender/20">Size</th>
                <th className="p-6 border-r border-ethereal-lavender/20">Bust</th>
                <th className="p-6 border-r border-ethereal-lavender/20">Waist</th>
                <th className="p-6">Hip</th>
              </tr>
            </thead>
            <tbody className="text-foreground/80">
              {sizes.map((size, idx) => (
                <tr key={size.label} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="p-6 border-r border-gray-200 font-bold text-ethereal-lavender">{size.label}</td>
                  <td className="p-6 border-r border-gray-200">{size.bust}</td>
                  <td className="p-6 border-r border-gray-200">{size.waist}</td>
                  <td className="p-6">{size.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 p-8 bg-ethereal-blush/5 border-l-4 border-ethereal-blush">
        <h3 className="text-xl font-heading text-ethereal-lavender mb-4">Measuring Tips</h3>
        <p className="text-foreground/70 mb-4">
          All our garments follow <strong>Pakistani Standard Sizing</strong>. For the best fit, we recommend 
          measuring a similar item you already own that fits you perfectly.
        </p>
        <ul className="list-disc list-inside text-sm text-foreground/60 space-y-2">
          <li><strong>Bust:</strong> Measure around the fullest part of your chest.</li>
          <li><strong>Waist:</strong> Measure around your natural waistline.</li>
          <li><strong>Hip:</strong> Measure around the fullest part of your hips.</li>
        </ul>
      </div>
    </div>
  );
}
