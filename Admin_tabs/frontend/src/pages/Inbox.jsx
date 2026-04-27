import { useState, useEffect } from 'react';
import { Trash2, Mail } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import Badge from '../components/ui/Badge';
import { api } from '../services/api';

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState(null);
  const [tab, setTab]           = useState('new');
  const [error, setError]       = useState('');

  const fetchMessages = async () => {
    try {
      const data = await api.getMessages();
      setMessages(data.messages || []);
    } catch (err) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleDelete = async (id) => {
    try {
      await api.deleteMessage(id);
      setMessages(prev => prev.filter(m => m._id !== id));
      if (active === id) setActive(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markMessageRead(id);
      setMessages(prev => prev.map(m => 
        m._id === id ? { ...m, isRead: true } : m
      ));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMessageClick = (msg) => {
    setActive(msg._id);
    if (!msg.isRead) {
      handleMarkRead(msg._id);
    }
  };

  // FIX 14: Filter messages based on tab
  const filtered = messages.filter(m => 
    tab === 'new' ? !m.isRead : m.isRead
  );

  const unreadCount = messages.filter(m => !m.isRead).length;
  const readCount = messages.filter(m => m.isRead).length;

  const activeMessage = messages.find(m => m._id === active);

  const getInitials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const avatarColors = [
    'bg-blue-700', 'bg-purple-700', 'bg-green-700',
    'bg-red-700',  'bg-pink-700',   'bg-indigo-700',
  ];

  return (
    <div>
      <TopBar subtitle="Messages" title="Inbox" unreadCount={unreadCount} />

      {/* Tabs - FIX 14: Show counts */}
      <div className="flex gap-6 border-b border-[#222] mb-6">
        <button
          onClick={() => setTab('new')}
          className={`pb-3 text-sm font-medium uppercase tracking-wider transition-colors flex items-center gap-2 ${
            tab === 'new'
              ? 'text-white border-b-2 border-[#FFE500]'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          New
          {unreadCount > 0 && (
            <span className="bg-[#FFE500] text-black text-xs px-2 py-0.5 rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('watched')}
          className={`pb-3 text-sm font-medium uppercase tracking-wider transition-colors flex items-center gap-2 ${
            tab === 'watched'
              ? 'text-white border-b-2 border-[#FFE500]'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Watched
          {readCount > 0 && (
            <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {readCount}
            </span>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Table Header */}
      <div className="grid grid-cols-12 text-xs text-gray-600 uppercase tracking-wider px-4 mb-3">
        <span className="col-span-4">Full Name</span>
        <span className="col-span-4">Email</span>
        <span className="col-span-3">Message</span>
        <span className="col-span-1"></span>
      </div>

      {/* Messages */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#FFE500]/30 border-t-[#FFE500] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          {tab === 'new' ? 'No unread messages' : 'No read messages'}
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-6">
            {filtered.map((msg, i) => (
              <div
                key={msg._id}
                onClick={() => handleMessageClick(msg)}
                className={`grid grid-cols-12 items-center px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                  active === msg._id
                    ? 'bg-[#1E1E00] border border-[#FFE500]/30'
                    : 'bg-[#141414] border border-[#222] hover:border-[#333]'
                }`}
              >
                {/* Name */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white ${avatarColors[i % avatarColors.length]}`}>
                    {getInitials(msg.fullName || msg.name)}
                  </div>
                  <span className="text-sm text-gray-300 font-medium truncate">
                    {msg.fullName || msg.name || 'Unknown'}
                  </span>
                </div>

                {/* Email */}
                <div className="col-span-4">
                  <span className="text-sm text-gray-500 truncate block">
                    {msg.email || '—'}
                  </span>
                </div>

                {/* Preview */}
                <div className="col-span-3">
                  <span className="text-sm text-gray-500 truncate block">
                    {msg.message || msg.content || '—'}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-end items-center gap-2">
                  {!msg.isRead && <Badge text="New" color="yellow" />}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(msg._id); }}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FIX 14: Message Detail Panel */}
          {activeMessage && (
            <div className="bg-[#141414] border border-[#222] rounded-xl p-6 mt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${avatarColors[0]}`}>
                    {getInitials(activeMessage.fullName || activeMessage.name)}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      {activeMessage.fullName || activeMessage.name || 'Unknown'}
                    </h3>
                    <p className="text-gray-500 text-sm">{activeMessage.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(activeMessage._id)}
                  className="text-gray-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              {activeMessage.subject && (
                <div className="mb-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Subject</p>
                  <p className="text-white font-medium">{activeMessage.subject}</p>
                </div>
              )}
              
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Message</p>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {activeMessage.message || activeMessage.content || 'No message content'}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}