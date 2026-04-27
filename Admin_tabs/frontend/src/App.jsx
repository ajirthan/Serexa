import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar   from './components/layout/Sidebar';
import Login     from './pages/Login';
import Reports   from './pages/Reports';
import Users     from './pages/Users';
import Events    from './pages/Events';
import Inbox     from './pages/Inbox';
import PostEvent from './pages/PostEvent';
import Settings  from './pages/Settings';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#FFE500]/30 border-t-[#FFE500] rounded-full animate-spin" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      <Sidebar />
      <main className="ml-44 flex-1 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected */}
          {/* FIX 10: Root route redirect without DashboardLayout */}
          <Route path="/" element={
            <PrivateRoute>
              <Navigate to="/reports" replace />
            </PrivateRoute>
          }/>

          <Route path="/reports" element={
            <PrivateRoute>
              <DashboardLayout><Reports /></DashboardLayout>
            </PrivateRoute>
          }/>

          <Route path="/users" element={
            <PrivateRoute>
              <DashboardLayout><Users /></DashboardLayout>
            </PrivateRoute>
          }/>

          <Route path="/events" element={
            <PrivateRoute>
              <DashboardLayout><Events /></DashboardLayout>
            </PrivateRoute>
          }/>

          <Route path="/inbox" element={
            <PrivateRoute>
              <DashboardLayout><Inbox /></DashboardLayout>
            </PrivateRoute>
          }/>

          <Route path="/post-event" element={
            <PrivateRoute>
              <DashboardLayout><PostEvent /></DashboardLayout>
            </PrivateRoute>
          }/>

          <Route path="/settings" element={
            <PrivateRoute>
              <DashboardLayout><Settings /></DashboardLayout>
            </PrivateRoute>
          }/>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/reports" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}