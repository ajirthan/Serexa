import { Bell, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function TopBar({ title, subtitle, unreadCount }) {
  // FIX 12: Show real logged-in user, remove dummy search
  const { user } = useAuth();
  const initial = user?.name?.[0]?.toUpperCase() || 'A';
  const displayName = user?.name || 'Admin';

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        {subtitle && (
          <p className="text-[#FFE500] text-xs uppercase tracking-widest mb-1">
            {subtitle}
          </p>
        )}
        <h1 className="text-3xl font-bold text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* FIX 12: Real user avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FFE500] flex items-center justify-center text-black text-xs font-bold">
            {initial}
          </div>
          <span className="text-gray-400 text-sm">{displayName}</span>
        </div>
        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFE500] rounded-full"></span>
          )}
        </button>
        <button className="text-gray-400 hover:text-white transition-colors">
          <HelpCircle size={18} />
        </button>
      </div>
    </div>
  );
}