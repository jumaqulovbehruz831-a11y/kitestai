import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Users, TrendingUp, Calendar, ChevronRight } from 'lucide-react';

interface UzbekistanRegionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RegionData {
  id: string;
  name: string;
  total: number;
  newCount: number;
  activeCount: number;
  coordinates: { cx: number; cy: number };
}

const REGION_STATS: RegionData[] = [
  { id: 'andijan', name: 'Andijon viloyati', total: 23796, newCount: 553, activeCount: 350, coordinates: { cx: 480, cy: 195 } },
  { id: 'tashkent_city', name: 'Toshkent shahar', total: 18402, newCount: 682, activeCount: 738, coordinates: { cx: 395, cy: 165 } },
  { id: 'fergana', name: 'Farg\'ona viloyati', total: 17793, newCount: 441, activeCount: 514, coordinates: { cx: 450, cy: 225 } },
  { id: 'samarkand', name: 'Samarqand viloyati', total: 17756, newCount: 293, activeCount: 366, coordinates: { cx: 290, cy: 235 } },
  { id: 'bukhara', name: 'Buxoro viloyati', total: 17753, newCount: 632, activeCount: 777, coordinates: { cx: 220, cy: 220 } },
  { id: 'namangan', name: 'Namangan viloyati', total: 14810, newCount: 248, activeCount: 389, coordinates: { cx: 435, cy: 175 } },
  { id: 'kashkadarya', name: 'Qashqadaryo viloyati', total: 14767, newCount: 414, activeCount: 510, coordinates: { cx: 270, cy: 285 } },
  { id: 'jizzakh', name: 'Jizzax viloyati', total: 14717, newCount: 422, activeCount: 593, coordinates: { cx: 335, cy: 200 } },
  { id: 'karakalpakstan', name: 'Qoraqalpog\'iston Resp.', total: 14540, newCount: 406, activeCount: 496, coordinates: { cx: 80, cy: 110 } },
  { id: 'khorezm', name: 'Xorazm viloyati', total: 13912, newCount: 388, activeCount: 472, coordinates: { cx: 130, cy: 180 } },
  { id: 'surkhandarya', name: 'Surxondaryo viloyati', total: 13420, newCount: 310, activeCount: 412, coordinates: { cx: 315, cy: 335 } },
  { id: 'sirdarya', name: 'Sirdaryo viloyati', total: 11850, newCount: 290, activeCount: 350, coordinates: { cx: 370, cy: 195 } },
  { id: 'navoiy', name: 'Navoiy viloyati', total: 7995, newCount: 210, activeCount: 280, coordinates: { cx: 210, cy: 155 } },
];

export const UzbekistanRegionsModal: React.FC<UzbekistanRegionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [timeRange, setTimeRange] = useState<'7' | '90' | '365'>('7');
  const [metricType, setMetricType] = useState<'yangi' | 'faol'>('yangi');
  const [hoveredRegion, setHoveredRegion] = useState<RegionData>(REGION_STATS[12]); // Default Navoiy as in Screenshot 10

  if (!isOpen) return null;

  const maxTotal = Math.max(...REGION_STATS.map((r) => r.total));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-5xl bg-[#0b101e] border border-cyan-500/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] text-slate-100"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-[#0e1628]/95 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-4 shrink-0">
            <div>
              <div className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider">
                KITEST GEOGRAFIYASI
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Hududlar bo'yicha foydalanuvchilar statistikasi
              </h2>
            </div>

            {/* Time Filter Pills matching Screenshot 10 */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
              {(
                [
                  { id: '7', label: '7 kun' },
                  { id: '90', label: '90 kun' },
                  { id: '365', label: '365 kun' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTimeRange(t.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timeRange === t.id
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 ml-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-5 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Map (Screenshot 10) */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white">
                    Hududlar bo'yicha foydalanuvchilar
                  </div>
                  <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setMetricType('yangi')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        metricType === 'yangi' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Yangi
                    </button>
                    <button
                      type="button"
                      onClick={() => setMetricType('faol')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        metricType === 'faol' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Faol
                    </button>
                  </div>
                </div>

                {/* SVG Map of Uzbekistan */}
                <div className="relative rounded-2xl bg-black/60 border border-slate-800/80 p-4 h-72 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 520 360" className="w-full h-full">
                    {/* Stylized Silhouette of Uzbekistan */}
                    <path
                      d="M 20 120 L 90 70 L 170 80 L 220 120 L 320 130 L 370 110 L 410 140 L 490 180 L 490 220 L 440 240 L 380 230 L 330 260 L 320 340 L 270 340 L 250 280 L 200 240 L 150 210 L 100 190 L 30 150 Z"
                      fill="#020617"
                      stroke="#0d9488"
                      strokeWidth="2.5"
                    />
                    {/* Internal Region Boundaries */}
                    <path d="M 170 80 L 150 210" stroke="#0f766e" strokeWidth="1.5" strokeDasharray="3 3" />
                    <path d="M 220 120 L 200 240" stroke="#0f766e" strokeWidth="1.5" strokeDasharray="3 3" />
                    <path d="M 320 130 L 250 280" stroke="#0f766e" strokeWidth="1.5" strokeDasharray="3 3" />
                    <path d="M 370 110 L 330 260" stroke="#0f766e" strokeWidth="1.5" strokeDasharray="3 3" />
                    <path d="M 410 140 L 380 230" stroke="#0f766e" strokeWidth="1.5" strokeDasharray="3 3" />

                    {/* Regional Interactive Nodes */}
                    {REGION_STATS.map((reg) => {
                      const isHovered = hoveredRegion.id === reg.id;
                      return (
                        <g
                          key={reg.id}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredRegion(reg)}
                        >
                          <circle
                            cx={reg.coordinates.cx}
                            cy={reg.coordinates.cy}
                            r={isHovered ? 8 : 4.5}
                            fill={isHovered ? '#2dd4bf' : '#0d9488'}
                            stroke="#ffffff"
                            strokeWidth={isHovered ? 2 : 1}
                            className="transition-all duration-200"
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Active Region Tooltip Popover (Matching Screenshot 10 Navoiy) */}
                  <div className="absolute top-4 left-4 p-3 rounded-xl bg-slate-900/95 border border-teal-500/40 shadow-xl backdrop-blur-md min-w-[140px]">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" />
                      <span>{hoveredRegion.name}</span>
                    </div>
                    <div className="text-xs text-slate-300 font-mono mt-1">
                      Jami: <strong className="text-teal-300 font-bold">{hoveredRegion.total.toLocaleString()}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Yangi: +{hoveredRegion.newCount} · Faol: {hoveredRegion.activeCount}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span>Kam</span>
                  <div className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-700" />
                    <span className="w-3.5 h-3.5 rounded bg-teal-950" />
                    <span className="w-3.5 h-3.5 rounded bg-teal-800" />
                    <span className="w-3.5 h-3.5 rounded bg-teal-600" />
                    <span className="w-3.5 h-3.5 rounded bg-teal-400" />
                  </div>
                  <span>Ko'p</span>
                </div>
              </div>

              {/* Right Column: Ranked Table with Cyan Activity Bars (Screenshot 10) */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 space-y-3">
                <div className="grid grid-cols-12 text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                  <div className="col-span-7">Hudud</div>
                  <div className="col-span-2 text-right">Jami</div>
                  <div className="col-span-1.5 text-right">Yangi</div>
                  <div className="col-span-1.5 text-right">Faol</div>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {REGION_STATS.map((reg) => {
                    const isHovered = hoveredRegion.id === reg.id;
                    const pct = (reg.total / maxTotal) * 100;
                    return (
                      <div
                        key={reg.id}
                        onMouseEnter={() => setHoveredRegion(reg)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          isHovered
                            ? 'bg-teal-950/40 border-teal-500/50'
                            : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-white">
                          <span className="truncate">{reg.name}</span>
                          <div className="flex items-center gap-4 text-xs font-mono">
                            <span className="text-teal-300 font-extrabold">{reg.total.toLocaleString()}</span>
                            <span className="text-slate-400 text-[11px] w-8 text-right">{reg.newCount}</span>
                            <span className="text-slate-400 text-[11px] w-8 text-right">{reg.activeCount}</span>
                          </div>
                        </div>

                        {/* Cyan Progress Bar (Screenshot 10) */}
                        <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden">
                          <div
                            className="bg-teal-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Citation & Unassigned Footer (Screenshot 10) */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-500">
              <span>Chegaralar: geoBoundaries.org (CC BY 3.0 IGO)</span>
              <span>Hududi ko'rsatilmagan: 4,844 ta foydalanuvchi</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
