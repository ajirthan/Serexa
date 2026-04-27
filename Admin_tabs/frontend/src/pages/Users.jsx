import { useEffect, useState } from 'react';
import { UserX, UserCheck, Trash2, Search } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { api } from '../services/api';

export default function Users() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [error, setError]     = useState('');

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data.users);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBlock = async (id, isBlocked) => {
    try {
      isBlocked ? await api.unblockUser(id) : await api.blockUser(id);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <TopBar subtitle="User Management" title="Users" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-500 text-sm">
          Total: <span className="text-white font-semibold">{users.length}</span> users
        </p>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
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

      <div className="bg-[#141414] border border-[#222] rounded-xl overflow-hidden">

        {/* Header */}
        <div className="grid grid-cols-12 text-xs text-gray-600 uppercase tracking-wider px-6 py-4 border-b border-[#222]">
          <span className="col-span-3">Name</span>
          <span className="col-span-4">Email</span>
          <span className="col-span-2">Role</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-1 text-right">Actions</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#FFE500]/30 border-t-[#FFE500] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">No users found</div>
        ) : (
          filtered.map((user) => (
            <div
              key={user._id}
              className="grid grid-cols-12 items-center px-6 py-4 border-b border-[#1A1A1A] hover:bg-[#1A1A1A] transition-colors"
            >
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFE500] flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="text-white text-sm font-medium truncate">{user.name}</span>
              </div>

              <div className="col-span-4">
                <span className="text-gray-400 text-sm truncate block">{user.email}</span>
              </div>

              <div className="col-span-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  user.role === 'admin'
                    ? 'bg-[#FFE500]/10 text-[#FFE500]'
                    : 'bg-[#222] text-gray-400'
                }`}>
                  {user.role}
                </span>
              </div>

              <div className="col-span-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  user.status === 'active'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {user.status}
                </span>
              </div>

              <div className="col-span-1 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleBlock(user._id, user.status === 'blocked')}
                  className={`transition-colors ${
                    user.status === 'blocked'
                      ? 'text-green-500 hover:text-green-400'
                      : 'text-gray-500 hover:text-yellow-400'
                  }`}
                >
                  {user.status === 'blocked' ? <UserCheck size={15} /> : <UserX size={15} />}
                </button>
                <button
                  onClick={() => handleDelete(user._id)}
                  className="text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}