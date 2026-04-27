import { useEffect, useState } from 'react';
import { Users, CalendarDays, Clock, MessageSquare } from 'lucide-react';
import { CheckCircle, UserPlus, Shield, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import TopBar from '../components/layout/TopBar';
import StatCard from '../components/ui/StatCard';
import ActivityItem from '../components/ui/ActivityItem';
import { api } from '../services/api';

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [eventStats, setEventStats] = useState(null);
  const [monthlyUsers, setMonthlyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, activityData, eventStatsData, monthlyData] = await Promise.all([
          api.getDashboardSummary(),
          api.getRecentActivity(),
          api.getEventStatusStats(),
          api.getMonthlyUserStats(),
        ]);

        setSummary(summaryData.summary);
        setActivities(activityData.activities || []);
        setEventStats(eventStatsData.stats);
        setMonthlyUsers(monthlyData.stats || []);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <TopBar subtitle="Internal Dashboard" title="System Analytics & Reports" />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#FFE500]/30 border-t-[#FFE500] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <TopBar subtitle="Internal Dashboard" title="System Analytics & Reports" />
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  // Map backend data to stat cards (only real data)
  const stats = summary ? [
    { 
      icon: Users, 
      value: summary.totalUsers?.toString() || '0', 
      label: 'Total Users', 
      trend: summary.totalAdmins ? `${summary.totalAdmins} admins` : '', 
      trendUp: true 
    },
    { 
      icon: CalendarDays, 
      value: summary.totalEvents?.toString() || '0', 
      label: 'Total Events', 
      trend: summary.approvedEvents ? `${summary.approvedEvents} approved` : '', 
      trendUp: true 
    },
    { 
      icon: Clock, 
      value: summary.pendingEvents?.toString() || '0', 
      label: 'Pending Approvals', 
      trend: summary.rejectedEvents ? `${summary.rejectedEvents} rejected` : '', 
      trendUp: false 
    },
    { 
      icon: MessageSquare, 
      value: summary.totalMessages?.toString() || '0', 
      label: 'Total Messages', 
      trend: summary.unreadMessages ? `${summary.unreadMessages} unread` : '', 
      trendUp: false 
    },
  ] : [];

  // Prepare event status pie chart data
  const eventStatusData = eventStats ? [
    { name: 'Approved', value: eventStats.approved || 0, color: '#FFE500' },
    { name: 'Pending', value: eventStats.pending || 0, color: '#FFA500' },
    { name: 'Rejected', value: eventStats.rejected || 0, color: '#666' },
  ].filter(item => item.value > 0) : [];

  // Prepare monthly users line chart data (last 6 months)
  const monthlyChartData = monthlyUsers.slice(-6).map(stat => ({
    month: stat.month.substring(0, 3).toUpperCase(),
    users: stat.count,
  }));

  // Map backend activities to UI format
  const activityItems = activities.slice(0, 5).map(activity => {
    let icon = CalendarDays;
    let iconBg = 'bg-blue-600';

    if (activity.type === 'user') {
      icon = UserPlus;
      iconBg = 'bg-green-600';
    } else if (activity.type === 'event') {
      icon = CheckCircle;
      iconBg = 'bg-[#FFE500]';
    } else if (activity.type === 'message') {
      icon = Shield;
      iconBg = 'bg-purple-600';
    }

    const timeAgo = getTimeAgo(activity.createdAt);

    return {
      icon,
      iconBg,
      title: activity.title,
      subtitle: activity.description,
      time: timeAgo,
    };
  });

  function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} MIN${diffMins !== 1 ? 'S' : ''} AGO`;
    if (diffHours < 24) return `${diffHours} HOUR${diffHours !== 1 ? 'S' : ''} AGO`;
    return `${diffDays} DAY${diffDays !== 1 ? 'S' : ''} AGO`;
  }

  return (
    <div>
      <TopBar subtitle="Internal Dashboard" title="System Analytics & Reports" />

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">

        {/* Monthly Users Line Chart */}
        <div className="col-span-2 bg-[#141414] border border-[#222] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Monthly User Registrations</h3>
            <div className="text-xs text-gray-500">Last 6 Months</div>
          </div>
          {monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyChartData}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#666', fontSize: 11 }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fill: '#666', fontSize: 11 }} 
                  axisLine={false} 
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: '#1A1A1A', border: '1px solid #333', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#FFE500' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  name="New Users"
                  stroke="#FFE500" 
                  strokeWidth={2}
                  dot={{ fill: '#FFE500', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-600 text-sm">
              No user registration data available
            </div>
          )}
        </div>

        {/* Event Status Pie Chart */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Event Status Distribution</h3>
          {eventStatusData.length > 0 ? (
            <>
              <div className="flex items-center justify-center mb-4">
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie
                      data={eventStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {eventStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1A1A1A', border: '1px solid #333', borderRadius: 8 }}
                      itemStyle={{ color: '#FFE500' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {eventStatusData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-400 text-xs">{item.name}</span>
                    </div>
                    <span className="text-white text-xs font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-600 text-sm">
              No event data available
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">

        {/* Event Status Bar Chart */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Event Status Overview</h3>
          {eventStats && (eventStats.approved > 0 || eventStats.pending > 0 || eventStats.rejected > 0) ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Approved</span>
                  <span className="text-[#FFE500] font-medium">{eventStats.approved}</span>
                </div>
                <div className="w-full bg-[#222] rounded-full h-2">
                  <div
                    className="bg-[#FFE500] h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(eventStats.approved / (eventStats.approved + eventStats.pending + eventStats.rejected)) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Pending</span>
                  <span className="text-orange-400 font-medium">{eventStats.pending}</span>
                </div>
                <div className="w-full bg-[#222] rounded-full h-2">
                  <div
                    className="bg-orange-400 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(eventStats.pending / (eventStats.approved + eventStats.pending + eventStats.rejected)) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Rejected</span>
                  <span className="text-gray-500 font-medium">{eventStats.rejected}</span>
                </div>
                <div className="w-full bg-[#222] rounded-full h-2">
                  <div
                    className="bg-gray-600 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(eventStats.rejected / (eventStats.approved + eventStats.pending + eventStats.rejected)) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[150px] flex items-center justify-center text-gray-600 text-sm">
              No event statistics available
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">Recent Activity Log</h3>
            <span className="text-gray-500 text-xs">{activities.length} activities</span>
          </div>
          <div className="space-y-4">
            {activityItems.length > 0 ? (
              activityItems.map((a, i) => <ActivityItem key={i} {...a} />)
            ) : (
              <div className="h-[150px] flex items-center justify-center text-gray-600 text-sm">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
