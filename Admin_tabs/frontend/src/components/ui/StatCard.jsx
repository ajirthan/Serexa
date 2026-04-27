import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon: Icon, value, label, trend, trendUp }) {
  return (
    <div className="bg-[#141414] border border-[#222] rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
          <Icon size={18} className="text-[#FFE500]" />
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-gray-500 text-xs mt-1">{label}</p>
      </div>
    </div>
  );
}