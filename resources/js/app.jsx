import './bootstrap';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ClientManagement from './pages/ClientManagement';
import CertificateManagement from './pages/CertificateManagement';
import UserManagement from './pages/UserManagement';
import ClientDashboard from './pages/ClientDashboard';
import Profile from './pages/Profile';
import AuditLogs from './pages/AuditLogs';
import SystemSettings from './pages/SystemSettings';
import Layout from './components/Layout';
import './index.css';

function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route 
                path="/login" 
                element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
            />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Layout>
                            {user?.role === 'client' ? <ClientDashboard /> : <Dashboard />}
                        </Layout>
                    </ProtectedRoute>
                }
            />
            
            <Route
                path="/clients"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'user']}>
                        <Layout>
                            <ClientManagement />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            
            <Route
                path="/certificates"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'user']}>
                        <Layout>
                            <CertificateManagement />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            
            <Route
                path="/users"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Layout>
                            <UserManagement />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Profile />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/audit-logs"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Layout>
                            <AuditLogs />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/reports"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'user']}>
                        <Layout>
                            <div className="min-h-screen bg-gray-50 p-6">
                                <div className="max-w-7xl mx-auto">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
                                    <p className="text-gray-600">Funcionalidade de relatórios será implementada aqui.</p>
                                </div>
                            </div>
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/statistics"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'user']}>
                        <Layout>
                            <div className="min-h-screen bg-gray-50 p-6">
                                <div className="max-w-7xl mx-auto">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Estatísticas</h1>
                                    <p className="text-gray-600">Funcionalidade de estatísticas será implementada aqui.</p>
                                </div>
                            </div>
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/system-settings"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Layout>
                            <SystemSettings />
                        </Layout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen bg-gray-50">
                    <AppRoutes />
                    <Toaster 
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                        }}
                    />
                </div>
            </Router>
        </AuthProvider>
    );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
); 