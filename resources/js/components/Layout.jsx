import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    LogOut, 
    Users, 
    FileText, 
    Building2, 
    Settings,
    Menu,
    X,
    User,
    Activity,
    ClipboardList,
    GraduationCap,
    Wrench,
    AlertTriangle,
    ShieldCheck
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: FileText, roles: ['admin', 'user', 'client'] },
        { name: 'Clientes', href: '/clients', icon: Building2, roles: ['admin', 'user'] },
        { name: 'Certificados', href: '/certificates', icon: FileText, roles: ['admin', 'user'] },
        { name: 'Documentos', href: '/documents', icon: FileText, roles: ['admin', 'user'] },
        { name: 'Registros Técnicos', href: '/records', icon: ClipboardList, roles: ['admin', 'user'] },
        { name: 'Pessoal & Treinamentos', href: '/trainings', icon: GraduationCap, roles: ['admin', 'user'] },
        { name: 'Equipamentos', href: '/equipment', icon: Wrench, roles: ['admin', 'user'] },
        { name: 'Não Conformidades', href: '/non-conformities', icon: AlertTriangle, roles: ['admin', 'user'] },
        { name: 'Auditorias Internas', href: '/internal-audits', icon: ShieldCheck, roles: ['admin', 'user'] },
        { name: 'Usuários', href: '/users', icon: Users, roles: ['admin'] },
        { name: 'Logs de Auditoria', href: '/audit-logs', icon: Activity, roles: ['admin'] },
        { name: 'Configurações', href: '/system-settings', icon: Settings, roles: ['admin'] },
        { name: 'Perfil', href: '/profile', icon: User, roles: ['admin', 'user', 'client'] },
    ];

    const filteredNavigation = navigation.filter(item => 
        item.roles.includes(user?.role)
    );

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
                    <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-blue-600">Metrologia</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-2">
                        {filteredNavigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
                    <div className="flex h-16 items-center px-4 border-b border-gray-200">
                        <h1 className="text-xl font-bold text-blue-600">Metrologia</h1>
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-2">
                        {filteredNavigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-gray-500 hover:text-gray-600 lg:hidden"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        
                        <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-700">
                                <span className="font-medium">
                                    {user?.role === 'client' ? user.company_name || user.name : user.name}
                                </span>
                                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    {user?.role === 'admin' ? 'Administrador' : 
                                     user?.role === 'user' ? 'Usuário' : 'Cliente'}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sair
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="p-6">
                    {children}
                </main>
                <footer className="w-full text-center py-4 bg-gray-100 border-t border-gray-200 text-sm text-gray-600">
                    © {new Date().getFullYear()} Desenvolvido por 
                    <a href="https://wa.me/5593992089384" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">Clegivaldo Cruz</a>
                </footer>
            </div>
        </div>
    );
};

export default Layout; 