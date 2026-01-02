import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Essay from './pages/Essay';
import Reading from './pages/Reading';
import Review from './pages/Review';
import Settings from './pages/Settings';
import UserManagement from './pages/admin/UserManagement';
import UserEdit from './pages/admin/UserEdit';
import UsageLimitEdit from './pages/admin/UsageLimitEdit';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return <Layout>{children}</Layout>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/essay" element={
              <ProtectedRoute>
                <Essay />
              </ProtectedRoute>
            } />

            <Route path="/reading" element={
              <ProtectedRoute>
                <Reading />
              </ProtectedRoute>
            } />

            <Route path="/review" element={
              <ProtectedRoute>
                <Review />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <AdminRoute><UserManagement /></AdminRoute>
              </ProtectedRoute>
            } />

            <Route path="/admin/users/:id" element={
              <ProtectedRoute>
                <AdminRoute><UserEdit /></AdminRoute>
              </ProtectedRoute>
            } />

            <Route path="/admin/users/:id/limits" element={
              <ProtectedRoute>
                <AdminRoute><UsageLimitEdit /></AdminRoute>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
