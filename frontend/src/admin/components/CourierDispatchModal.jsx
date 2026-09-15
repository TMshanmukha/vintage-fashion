import { useState, useEffect, useMemo } from "react";

// Standard packaging presets for fashion apparel & e-commerce shipments
const PACKAGING_PRESETS = [
  {
    id: "poly_s",
    name: "Small Polybag",
    tag: "1 T-Shirt / Top",
    length: 25,
    width: 20,
    height: 4,
    weight: 0.35,
    icon: "👕",
  },
  {
    id: "poly_m",
    name: "Medium Polybag",
    tag: "Jeans / Dress / 2 items",
    length: 30,
    width: 25,
    height: 6,
    weight: 0.7,
    icon: "👖",
  },
  {
    id: "box_std",
    name: "Standard Box",
    tag: "2-3 Items / Shoes",
    length: 32,
    width: 24,
    height: 12,
    weight: 1.2,
    icon: "📦",
  },
  {
    id: "box_lrg",
    name: "Large Carton",
    tag: "4+ Items / Winterwear",
    length: 40,
    width: 30,
    height: 20,
    weight: 2.5,
    icon: "📫",
  },
];

export default function CourierDispatchModal({
  open,
  order,
  onConfirm,
  onCancel,
  loading = false,
}) {
  const [length, setLength] = useState(25);
  const [width, setWidth] = useState(20);
  const [height, setHeight] = useState(5);
  const [weight, setWeight] = useState(0.5);
  const [activePreset, setActivePreset] = useState(null);

  // Initialize or reset defaults when modal opens with an order
  useEffect(() => {
    if (order && open) {
      const itemCount = Number(order.item_count || order.items?.length || 1);
      
      let initialLength = 25;
      let initialWidth = 20;
      let initialHeight = Math.max(4, Math.min(40, itemCount * 4));
      let initialWeight = Math.max(0.35, Number((itemCount * 0.35).toFixed(2)));

      if (itemCount === 1) {
        initialLength = 25;
        initialWidth = 20;
        initialHeight = 4;
        initialWeight = 0.35;
        setActivePreset("poly_s");
      } else if (itemCount === 2) {
        initialLength = 30;
        initialWidth = 25;
        initialHeight = 6;
        initialWeight = 0.7;
        setActivePreset("poly_m");
      } else if (itemCount <= 4) {
        initialLength = 32;
        initialWidth = 24;
        initialHeight = 12;
        initialWeight = 1.2;
        setActivePreset("box_std");
      } else {
        initialLength = 40;
        initialWidth = 30;
        initialHeight = 20;
        initialWeight = 2.5;
        setActivePreset("box_lrg");
      }

      setLength(initialLength);
      setWidth(initialWidth);
      setHeight(initialHeight);
      setWeight(initialWeight);
    }
  }, [order, open]);

  // Handle Preset selection
  const applyPreset = (preset) => {
    setActivePreset(preset.id);
    setLength(preset.length);
    setWidth(preset.width);
    setHeight(preset.height);
    setWeight(preset.weight);
  };

  // Live Metric Computations
  const metrics = useMemo(() => {
    const l = Math.max(1, Number(length) || 1);
    const w = Math.max(1, Number(width) || 1);
    const h = Math.max(1, Number(height) || 1);
    const actualWt = Math.max(0.05, Number(weight) || 0.05);

    // Shiprocket & Courier Standard: Volumetric Weight = (L * W * H) / 5000
    const volWeight = (l * w * h) / 5000;
    const billedWeight = Math.max(actualWt, volWeight);
    
    // Courier billing slabs (multiples of 0.5 kg)
    const chargedSlab = Math.max(0.5, Math.ceil(billedWeight * 2) / 2);
    const isVolumetricGoverning = volWeight > actualWt + 0.02;

    return {
      volWeight: Number(volWeight.toFixed(2)),
      actualWt: Number(actualWt.toFixed(2)),
      billedWeight: Number(billedWeight.toFixed(2)),
      chargedSlab: chargedSlab.toFixed(1),
      isVolumetricGoverning,
      volumeCm3: Math.round(l * w * h),
    };
  }, [length, width, height, weight]);

  if (!open || !order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      length: Math.max(1, Math.round(Number(length))),
      width: Math.max(1, Math.round(Number(width))),
      height: Math.max(1, Math.round(Number(height))),
      weight: Math.max(0.05, Number(Number(weight).toFixed(3))),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-gray-100 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white p-5 sm:p-6 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl shrink-0 shadow-inner">
                📦
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Package Dimensions & Dispatch
                </h3>
                <p className="text-xs text-purple-100/90 font-medium">
                  Review & set precise package weight & volume before creating Shiprocket order
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick Order Info Pill */}
          <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-white text-[11px]">
                #{order.order_number}
              </span>
              <span className="text-purple-100 truncate max-w-[150px] sm:max-w-[200px]">
                {order.customer_name || "Customer"}
              </span>
            </div>
            <div className="text-purple-100 flex items-center gap-1.5 font-medium">
              <span>📍 {order.city || "India"} ({order.pincode})</span>
              <span>•</span>
              <span>{order.item_count || order.items?.length || 1} Item(s)</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Quick Packaging Presets
              </label>
              <span className="text-[11px] text-gray-400">Click to apply standard sizing</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PACKAGING_PRESETS.map((p) => {
                const isSelected = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? "border-purple-600 bg-purple-50/80 text-purple-900 shadow-xs ring-1 ring-purple-500"
                        : "border-gray-200 bg-gray-50/50 hover:bg-gray-100/80 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base">{p.icon}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                      )}
                    </div>
                    <p className="text-xs font-bold leading-tight truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">{p.tag}</p>
                    <p className="text-[9px] font-mono text-purple-700 font-semibold mt-1">
                      {p.length}×{p.width}×{p.height} cm • {p.weight}kg
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Measurements Form Grid */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                Custom Parcel Measurements
              </span>
              <span className="text-[11px] text-purple-700 font-medium bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                Live Volumetric Calculation
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Length */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Length (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  step="1"
                  required
                  value={length}
                  onChange={(e) => {
                    setLength(e.target.value);
                    setActivePreset(null);
                  }}
                  className="w-full text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>

              {/* Width / Breadth */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Width (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  step="1"
                  required
                  value={width}
                  onChange={(e) => {
                    setWidth(e.target.value);
                    setActivePreset(null);
                  }}
                  className="w-full text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Height (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  step="1"
                  required
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    setActivePreset(null);
                  }}
                  className="w-full text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>

              {/* Dead Weight */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Dead Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.05"
                  max="50"
                  step="0.01"
                  required
                  value={weight}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    setActivePreset(null);
                  }}
                  className="w-full text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Live Billing & Volumetric Analysis Card */}
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-sky-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-900 flex items-center gap-1.5">
                <span>⚡</span> Shiprocket Billable Weight Analysis
              </span>
              <span className="text-[10px] font-mono text-gray-500">
                Formula: (L × W × H) / 5000
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-lg border border-gray-200/70 shadow-2xs">
                <span className="text-[10px] font-medium text-gray-500 block">Dead Weight</span>
                <span className="text-sm font-bold text-gray-900 font-mono">{metrics.actualWt} kg</span>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-lg border border-gray-200/70 shadow-2xs">
                <span className="text-[10px] font-medium text-gray-500 block">Volumetric Wt</span>
                <span className="text-sm font-bold text-purple-800 font-mono">{metrics.volWeight} kg</span>
              </div>
              <div className="bg-purple-700 text-white p-2.5 rounded-lg shadow-2xs">
                <span className="text-[10px] font-medium text-purple-200 block">Courier Slab</span>
                <span className="text-sm font-bold font-mono">{metrics.chargedSlab} kg Slab</span>
              </div>
            </div>

            {/* Smart Advice Banner */}
            <div
              className={`p-2.5 rounded-lg text-xs flex items-start gap-2 border ${
                metrics.isVolumetricGoverning
                  ? "bg-amber-50 text-amber-900 border-amber-200"
                  : "bg-emerald-50 text-emerald-900 border-emerald-200"
              }`}
            >
              <span className="text-sm shrink-0">
                {metrics.isVolumetricGoverning ? "💡" : "✅"}
              </span>
              <div className="text-[11px] leading-relaxed">
                {metrics.isVolumetricGoverning ? (
                  <>
                    <strong className="font-semibold">Volumetric Weight is higher than dead weight ({metrics.volWeight}kg vs {metrics.actualWt}kg).</strong>{" "}
                    Courier will bill based on packaging size ({metrics.chargedSlab} kg slab). Consider packing tightly in a smaller bag to minimize charges.
                  </>
                ) : (
                  <>
                    <strong className="font-semibold">Optimal Packaging!</strong>{" "}
                    The package volume is compact ({metrics.volWeight}kg). Courier will bill by actual dead weight ({metrics.chargedSlab} kg slab).
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Dispatching to Shiprocket...</span>
                </>
              ) : (
                <>
                  <span>🚚 Confirm & Dispatch Shipment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
