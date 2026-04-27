export default function ActivityItem({ icon: Icon, iconBg, title, subtitle, time }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={14} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{title}</p>
        <p className="text-xs text-gray-500 truncate">{subtitle}</p>
      </div>
      <span className="text-[10px] text-gray-600 flex-shrink-0">{time}</span>
    </div>
  );
}