import { useState } from "react";
import { Link } from "react-router-dom";

const sizeData = {
  mens_tops: {
    title: "Men's Shirts, T-Shirts & Jackets",
    inches: [
      { size: "XS", chest: "34 - 36", waist: "28 - 30", shoulder: "16.5", length: "27" },
      { size: "S", chest: "36 - 38", waist: "30 - 32", shoulder: "17.2", length: "28" },
      { size: "M", chest: "38 - 40", waist: "32 - 34", shoulder: "18.0", length: "29" },
      { size: "L", chest: "40 - 42", waist: "34 - 36", shoulder: "18.8", length: "30" },
      { size: "XL", chest: "42 - 44", waist: "36 - 38", shoulder: "19.5", length: "31" },
      { size: "XXL", chest: "44 - 46", waist: "38 - 40", shoulder: "20.2", length: "32" },
    ],
    cm: [
      { size: "XS", chest: "86 - 91", waist: "71 - 76", shoulder: "42", length: "68" },
      { size: "S", chest: "91 - 96", waist: "76 - 81", shoulder: "44", length: "71" },
      { size: "M", chest: "96 - 101", waist: "81 - 86", shoulder: "46", length: "74" },
      { size: "L", chest: "101 - 106", waist: "86 - 91", shoulder: "48", length: "76" },
      { size: "XL", chest: "106 - 111", waist: "91 - 96", shoulder: "50", length: "79" },
      { size: "XXL", chest: "111 - 116", waist: "96 - 101", shoulder: "51", length: "81" },
    ],
  },
  womens_tops: {
    title: "Women's Tops, Blouses & Dresses",
    inches: [
      { size: "XS", bust: "31 - 33", waist: "24 - 26", hip: "34 - 36", length: "34" },
      { size: "S", bust: "33 - 35", waist: "26 - 28", hip: "36 - 38", length: "35" },
      { size: "M", bust: "35 - 37", waist: "28 - 30", hip: "38 - 40", length: "36" },
      { size: "L", bust: "37 - 40", waist: "30 - 33", hip: "40 - 43", length: "37" },
      { size: "XL", bust: "40 - 43", waist: "33 - 36", hip: "43 - 46", length: "38" },
      { size: "XXL", bust: "43 - 46", waist: "36 - 39", hip: "46 - 49", length: "39" },
    ],
    cm: [
      { size: "XS", bust: "79 - 84", waist: "61 - 66", hip: "86 - 91", length: "86" },
      { size: "S", bust: "84 - 89", waist: "66 - 71", hip: "91 - 96", length: "89" },
      { size: "M", bust: "89 - 94", waist: "71 - 76", hip: "96 - 101", length: "91" },
      { size: "L", bust: "94 - 101", waist: "76 - 84", hip: "101 - 109", length: "94" },
      { size: "XL", bust: "101 - 109", waist: "84 - 91", hip: "109 - 117", length: "96" },
      { size: "XXL", bust: "109 - 117", waist: "91 - 99", hip: "117 - 124", length: "99" },
    ],
  },
  bottoms: {
    title: "Trousers, Jeans & Pants",
    inches: [
      { size: "28", waist: "28 - 29", hip: "35 - 36", thigh: "21", length: "30" },
      { size: "30", waist: "30 - 31", hip: "37 - 38", thigh: "22", length: "30" },
      { size: "32", waist: "32 - 33", hip: "39 - 40", thigh: "23", length: "32" },
      { size: "34", waist: "34 - 35", hip: "41 - 42", thigh: "24", length: "32" },
      { size: "36", waist: "36 - 37", hip: "43 - 44", thigh: "25", length: "32" },
      { size: "38", waist: "38 - 39", hip: "45 - 46", thigh: "26", length: "34" },
    ],
    cm: [
      { size: "28", waist: "71 - 74", hip: "89 - 91", thigh: "53", length: "76" },
      { size: "30", waist: "76 - 79", hip: "94 - 96", thigh: "56", length: "76" },
      { size: "32", waist: "81 - 84", hip: "99 - 101", thigh: "58", length: "81" },
      { size: "34", waist: "86 - 89", hip: "104 - 106", thigh: "61", length: "81" },
      { size: "36", waist: "91 - 94", hip: "109 - 112", thigh: "63", length: "81" },
      { size: "38", waist: "96 - 99", hip: "114 - 117", thigh: "66", length: "86" },
    ],
  },
};

export default function SizeGuide() {
  const [activeTab, setActiveTab] = useState("mens_tops");
  const [unit, setUnit] = useState("inches"); // 'inches' | 'cm'

  const currentCategory = sizeData[activeTab];
  const rows = currentCategory[unit];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Size Guide</span>
      </div>

      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-pink-600 bg-pink-50 px-3 py-1 rounded-full mb-3">
          Perfect Fit Guaranteed
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Comprehensive Size Guide
        </h1>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          Find your ideal size across all Vintage Fashion garments. All measurements are tailored for standard and vintage tailored fits.
        </p>
      </div>

      {/* Tab Selectors & Unit Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("mens_tops")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "mens_tops"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Men's Tops
          </button>
          <button
            onClick={() => setActiveTab("womens_tops")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "womens_tops"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Women's Apparel
          </button>
          <button
            onClick={() => setActiveTab("bottoms")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "bottoms"
                ? "bg-white text-gray-900 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Bottoms & Jeans
          </button>
        </div>

        {/* Inches / CM Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button
            onClick={() => setUnit("inches")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              unit === "inches"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Inches (in)
          </button>
          <button
            onClick={() => setUnit("cm")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              unit === "cm"
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Centimeters (cm)
          </button>
        </div>
      </div>

      {/* Measurement Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden mb-12">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900">{currentCategory.title}</h3>
          <p className="text-xs text-gray-500">Measurements in {unit === "inches" ? "inches" : "centimeters"}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/50 text-gray-600 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Size</th>
                {activeTab === "womens_tops" ? (
                  <>
                    <th className="py-3 px-4">Bust</th>
                    <th className="py-3 px-4">Waist</th>
                    <th className="py-3 px-4">Hips</th>
                    <th className="py-3 px-4">Length</th>
                  </>
                ) : activeTab === "bottoms" ? (
                  <>
                    <th className="py-3 px-4">Waist</th>
                    <th className="py-3 px-4">Hip</th>
                    <th className="py-3 px-4">Thigh</th>
                    <th className="py-3 px-4">Inseam Length</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-4">Chest</th>
                    <th className="py-3 px-4">Waist</th>
                    <th className="py-3 px-4">Shoulder</th>
                    <th className="py-3 px-4">Length</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.size} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">{r.size}</td>
                  {activeTab === "womens_tops" ? (
                    <>
                      <td className="py-3.5 px-4 text-gray-600">{r.bust} {unit === "inches" ? '"' : "cm"}</td>
                      <td className="py-3.5 px-4 text-gray-600">{r.waist} {unit === "inches" ? '"' : "cm"}</td>
                      <td className="py-3.5 px-4 text-gray-600">{r.hip} {unit === "inches" ? '"' : "cm"}</td>
                      <td className="py-3.5 px-4 text-gray-600">{r.length} {unit === "inches" ? '"' : "cm"}</td>
                    </>
                  ) : activeTab === "bottoms" ? (
                    <>
                      <td className="py-3.5 px-4 text-gray-600">{r.waist} {unit === "inches" ? '"' : "cm"}</td>
                      <td className="py-3.5 px-4 text-gray-600">{r.hip} {unit === "inches" ? '"' : "cm"}</td>
                      <td className="py-3.5 px-4 text-gray-600">{r.thigh} {unit === "inches" ? '"' : "cm"}</td>
                      <td className="py-3.5 px-4 text-gray-600">{r.length} {unit === "inches" ? '"' : "cm"}</td>
                    </>
                  ) : (
                    <>
                      <td className="py-3.5 px-4 text-gray-600">{r.chest} {unit === "inches" ? '"' : "cm"}</td>
                      <td className="py-3.5 px-4 text-gray-600">{r.waist} {unit === "inches" ? '"' : "cm"}</td>
                      <td className="py-3.5 px-4 text-gray-600">{r.shoulder} {unit === "inches" ? '"' : "cm"}</td>
                      <td className="py-3.5 px-4 text-gray-600">{r.length} {unit === "inches" ? '"' : "cm"}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* How to Measure Card */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8">
        <h3 className="text-base font-bold text-gray-900 mb-4">How to Measure for the Best Fit</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-gray-600">
          <div>
            <h4 className="font-bold text-gray-900 mb-1">1. Chest / Bust</h4>
            <p className="leading-relaxed">Measure around the fullest part of your chest or bust, keeping the tape horizontal under the arms.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">2. Natural Waist</h4>
            <p className="leading-relaxed">Measure around your natural waistline, located just above your belly button where your body bends.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">3. Hips</h4>
            <p className="leading-relaxed">Stand with feet together and measure around the fullest part of your hips and rear.</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-1">4. Inseam / Length</h4>
            <p className="leading-relaxed">Measure from the top of your inner leg at the crotch down to the bottom of the ankle.</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-gray-500">
            Between two sizes? We recommend choosing the larger size for a relaxed vintage aesthetic.
          </p>
          <Link to="/shop" className="text-xs font-bold text-pink-600 hover:text-pink-700">
            Explore Collection →
          </Link>
        </div>
      </div>
    </div>
  );
}
