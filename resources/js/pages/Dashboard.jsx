import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    Users, 
    Building2, 
    FileText, 
    AlertTriangle, 
    Clock, 
    TrendingUp,
    Plus,
    Download,
    Settings,
    BarChart3,
    Activity,
    Calendar,
    Mail,
    Shield,
    Database
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState({
        stats: {
            total_certificates: 0,
            total_clients: 0,
            expiring_certificates: 0
        },
        recent_activity: []
    });
    const [loading, setLoading] = useState(true);
    const [advancedStats, setAdvancedStats] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
        if (user?.role === 'admin') {
            fetchAdvancedStats();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/dashboard');
            if (response.data) {
                setDashboardData(response.data);
            }
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            // Manter dados padrão se derro
        } finally {
            setLoading(false);
        }
    };

    const fetchAdvancedStats = async () => {
        try {
            const response = await axios.get('/api/dashboard/advanced');
            if (response.data) {
                setAdvancedStats(response.data);
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas avançadas:', error);
        }
    };

    const QuickActionCard = ({ icon: Icon, title, description, onClick, color = 'blue' }) => (
        <div 
            onClick={() => navigate(onClick)}
            className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer group hover:border-${color}-200`}
        >
            <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-${color}-200 transition-colors`}>
                <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>
    );

    const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
                {change && (
                    <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change > 0 ? '+' : ''}{change}%
                    </span>
                )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
            <p className="text-gray-600 text-sm">{title}</p>
        </div>
    );

    const RecentActivityItem = ({ action, user, time, details }) => (
        <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{action}</p>
                <p className="text-xs text-gray-500">{user} • {time}</p>
                {details && <p className="text-xs text-gray-600 mt-1">{details}</p>}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Bem-vindo de volta, {user?.name || 'usuário'}! Aqui está um resumo do sistema.
                    </p>
                </div>

                {/* Estatísticas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={FileText}
                        title="Total de Certificados"
                        value={dashboardData?.stats?.total_certificates ?? 0}
                        color="blue"
                    />
                    <StatCard
                        icon={Building2}
                        title="Total de Clientes"
                        value={dashboardData?.stats?.total_clients ?? 0}
                        color="green"
                    />
                    <StatCard
                        icon={AlertTriangle}
                        title="Expirando em 30 dias"
                        value={dashboardData?.stats?.expiring_certificates ?? 0}
                        color="orange"
                    />
                    {user?.role === 'admin' && (
                        <StatCard
                            icon={Users}
                            title="Total de Usuários"
                            value={advancedStats?.user_stats?.total_users ?? 0}
                            color="purple"
                        />
                    )}
                </div>

                {/* Ações Rápidas */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {(user?.role === 'admin' || user?.role === 'user') && (
                            <>
                                <QuickActionCard
                                    icon={Plus}
                                    title="Novo Cliente"
                                    description="Cadastrar novo cliente"
                                    onClick="/clients"
                                    color="green"
                                />
                                <QuickActionCard
                                    icon={FileText}
                                    title="Novo Certificado"
                                    description="Upload de certificado"
                                    onClick="/certificates"
                                    color="blue"
                                />
                            </>
                        )}
                        
                        {user?.role === 'admin' && (
                            <>
                                <QuickActionCard
                                    icon={Users}
                                    title="Novo Usuário"
                                    description="Criar conta de usuário"
                                    onClick="/users"
                                    color="purple"
                                />
                                <QuickActionCard
                                    icon={Settings}
                                    title="Configurações"
                                    description="Configurar sistema"
                                    onClick="/system-settings"
                                    color="gray"
                                />
                            </>
                        )}
                        
                        {user?.role === 'client' && (
                            <>
                                <QuickActionCard
                                    icon={FileText}
                                    title="Meus Certificados"
                                    description="Ver todos os certificados"
                                    onClick="/certificates"
                                    color="blue"
                                />
                                <QuickActionCard
                                    icon={Download}
                                    title="Relatórios"
                                    description="Exportar dados"
                                    onClick="/reports"
                                    color="orange"
                                />
                            </>
                        )}
                        
                        {(user?.role === 'admin' || user?.role === 'user') && (
                            <>
                                <QuickActionCard
                                    icon={Download}
                                    title="Relatórios"
                                    description="Exportar dados"
                                    onClick="/reports"
                                    color="orange"
                                />
                                <QuickActionCard
                                    icon={BarChart3}
                                    title="Estatísticas"
                                    description="Ver gráficos"
                                    onClick="/statistics"
                                    color="indigo"
                                />
                            </>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Certificados Recentes */}
                    <div className={user?.role === 'admin' ? 'lg:col-span-2' : 'lg:col-span-3'}>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {user?.role === 'client' ? 'Meus Certificados' : 'Certificados Recentes'}
                                </h2>
                                <button 
                                    onClick={() => navigate('/certificates')}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    Ver todos
                                </button>
                            </div>
                            <div className="space-y-4">
                                {dashboardData?.recent_certificates?.map((certificate) => (
                                    <div key={certificate.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{certificate.certificate_number}</p>
                                                <p className="text-sm text-gray-600">{certificate.equipment_name}</p>
                                                {user?.role !== 'client' && (
                                                    <p className="text-xs text-gray-500">{certificate.client?.company_name}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                {certificate.expiry_date ? new Date(certificate.expiry_date).toLocaleDateString('pt-BR') : 'N/A'}
                                            </p>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                certificate.status === 'Expirado'
                                                    ? 'bg-red-100 text-red-800'
                                                    : certificate.status === 'Expirando'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {certificate.status || 'Válido'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {(!dashboardData?.recent_certificates || dashboardData.recent_certificates.length === 0) && (
                                    <div className="text-center py-8 text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p>Nenhum certificado encontrado</p>
                                        {user?.role === 'client' && (
                                            <p className="text-sm mt-2">Entre em contato com o administrador para solicitar certificados.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Atividades Recentes */}
                    {user?.role === 'admin' && (
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Atividades Recentes</h2>
                                    <button 
                                        onClick={() => navigate('/audit-logs')}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Ver logs
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {dashboardData?.recent_activities?.map((activity, index) => (
                                        <RecentActivityItem
                                            key={index}
                                            action={activity.action || 'Atividade'}
                                            user={activity.user_email || 'Sistema'}
                                            time={activity.created_at ? new Date(activity.created_at).toLocaleDateString('pt-BR') : 'Agora'}
                                            details={activity.ip_address ? `IP: ${activity.ip_address}` : null}
                                        />
                                    ))}
                                    {(!dashboardData?.recent_activities || dashboardData.recent_activities.length === 0) && (
                                        <div className="text-center py-8 text-gray-500">
                                            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <p>Nenhuma atividade recente</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Estatísticas Avançadas (apenas admin) */}
                {user?.role === 'admin' && advancedStats && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Estatísticas Avançadas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                icon={Shield}
                                title="Administradores"
                                value={advancedStats.user_stats?.admins || 0}
                                color="purple"
                            />
                            <StatCard
                                icon={Users}
                                title="Usuários"
                                value={advancedStats.user_stats?.regular_users || 0}
                                color="blue"
                            />
                            <StatCard
                                icon={Building2}
                                title="Clientes"
                                value={advancedStats.client_stats?.total_clients || 0}
                                color="green"
                            />
                            <StatCard
                                icon={Database}
                                title="Logs de Auditoria"
                                value={advancedStats.total_audit_logs || 0}
                                color="gray"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard; 