import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Trash2, Search, Calendar } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { api } from '../services/api';

export default function Events() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [error, setError]     = useState('');

  // FIX 13: Use env variable for API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data.events);
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.deleteEvent(id);
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.approveEvent(id);
      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.rejectEvent(id);
      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = events.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (status) => {
    if (status === 'approved') return 'bg-green-500/10 text-green-400';
    if (status === 'rejected') return 'bg-red-500/10 text-red-400';
    return 'bg-yellow-500/10 text-yellow-400';
  };

  return (
    <div>
      <TopBar subtitle="Event Management" title="Events" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm">
          Total: <span className="text-white font-semibold">{events.length}</span> events
        </p>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#141414] border border-[#333] text-gray-400 text-sm pl-9 pr-4 py-2 rounded-md w-56 focus:outline-none focus:border-[#FFE500] transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#FFE500]/30 border-t-[#FFE500] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">No events found</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((event) => (
            <div
              key={event._id}
              className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden hover:border-[#333] transition-colors"
            >
              {/* Image */}
              <div className="h-36 bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
                {event.image ? (
                  <img
                    src={`${API_URL}/${event.image}`}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Calendar size={32} className="text-gray-700" />
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">
                    {event.title}
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColor(event.status)}`}>
                    {event.status || 'pending'}
                  </span>
                </div>

                {event.location && (
                  <p className="text-gray-500 text-xs mb-1">📍 {event.location}</p>
                )}
                {event.date && (
                  <p className="text-gray-500 text-xs mb-1">
                    📅 {new Date(event.date).toLocaleDateString()}
                    {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                  </p>
                )}
                {(event.autoDeleteDate || event.autoHideDate) && (
                  <p className="text-red-400 text-[10px] mb-3">
                    🗑️ Auto-delete: {new Date(event.autoDeleteDate || event.autoHideDate).toLocaleDateString()}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#222]">
                  {event.status !== 'approved' && (
                    <button
                      onClick={() => handleApprove(event._id)}
                      className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                  )}
                  {event.status !== 'rejected' && (
                    <button
                      onClick={() => handleReject(event._id)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="ml-auto text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}