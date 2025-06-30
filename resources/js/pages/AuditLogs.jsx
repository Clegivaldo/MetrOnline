import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    Search, 
    Filter,
    Download,
    Calendar,
    User,
    Activity,
    Eye
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuditLogs = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [filterUser, setFilterUser] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [showDetails, setShowDetails] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await axios.get('/api/audit-logs');
            setLogs(response.data.data || response.data);
        } catch (error) {
            console.error('Erro ao carregar logs:', error);
            toast.error('Erro ao carregar logs de auditoria');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get('/api/audit-logs/export', {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast.success('Logs exportados com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar logs:', error);
            toast.error('Erro ao exportar logs');
        }
    };

    const getActionColor = (action) => {
        const colors = {
            'Login realizado': 'bg-green-100 text-green-800',
            'Logout realizado': 'bg-gray-100 text-gray-800',
            'Cliente criado': 'bg-blue-100 text-blue-800',
            'Cliente atualizado': 'bg-yellow-100 text-yellow-800',
            'Cliente deletado': 'bg-red-100 text-red-800',
            'Certificado criado': 'bg-green-100 text-green-800',
            'Certificado atualizado': 'bg-yellow-100 text-yellow-800',
            'Certificado deletado': 'bg-red-100 text-red-800',
            'Usuário criado': 'bg-purple-100 text-purple-800',
            'Usuário atualizado': 'bg-yellow-100 text-yellow-800',
            'Usuário deletado': 'bg-red-100 text-red-800',
        };
        
        return colors[action] || 'bg-gray-100 text-gray-800';
    };

    const getRoleColor = (role) => {
        const colors = {
            admin: 'bg-purple-100 text-purple-800',
            user: 'bg-blue-100 text-blue-800',
            client: 'bg-green-100 text-green-800'
        };
        
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = 
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesAction = filterAction === 'all' || log.action === filterAction;
        const matchesUser = filterUser === 'all' || log.user_email === filterUser;
        
        let matchesDate = true;
        if (dateRange.start && dateRange.end) {
            const logDate = new Date(log.created_at);
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            matchesDate = logDate >= startDate && logDate <= endDate;
        }

        return matchesSearch && matchesAction && matchesUser && matchesDate;
    });

    const uniqueActions = [...new Set(logs.map(log => log.action))];
    const uniqueUsers = [...new Set(logs.map(log => log.user_email))];

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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Logs de Auditoria
                            </h1>
                            <p className="text-gray-600">
                                Visualize todas as atividades e ações realizadas no sistema
                            </p>
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Busca */}
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar nos logs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Filtro por Ação */}
                        <div>
                            <select
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Todas as ações</option>
                                {uniqueActions.map(action => (
                                    <option key={action} value={action}>{action}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Usuário */}
                        <div>
                            <select
                                value={filterUser}
                                onChange={(e) => setFilterUser(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Todos os usuários</option>
                                {uniqueUsers.map(userEmail => (
                                    <option key={userEmail} value={userEmail}>{userEmail}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Filtro por Data - Linha separada */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            {filteredLogs.length} log(s) encontrado(s)
                        </span>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterAction('all');
                                setFilterUser('all');
                                setDateRange({ start: '', end: '' });
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            Limpar filtros
                        </button>
                    </div>
                </div>

                {/* Lista de Logs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data/Hora
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ação
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuário
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Função
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        IP
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {new Date(log.created_at).toLocaleDateString('pt-BR')}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 text-gray-400 mr-2" />
                                                <div className="text-sm text-gray-900">
                                                    {log.user_email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(log.user_role)}`}>
                                                {log.user_role === 'admin' ? 'Administrador' : 
                                                 log.user_role === 'user' ? 'Usuário' : 'Cliente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.ip_address}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => setShowDetails(showDetails === log.id ? null : log.id)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Ver detalhes"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Detalhes do Log */}
                    {showDetails && (
                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Log</h3>
                            {logs.find(log => log.id === showDetails) && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Detalhes da Ação
                                        </label>
                                        <pre className="bg-white p-4 rounded-lg border text-sm overflow-x-auto">
                                            {JSON.stringify(logs.find(log => log.id === showDetails)?.details, null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            User Agent
                                        </label>
                                        <p className="text-sm text-gray-900 bg-white p-3 rounded-lg border">
                                            {logs.find(log => log.id === showDetails)?.user_agent || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {filteredLogs.length === 0 && (
                    <div className="text-center py-12">
                        <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">Nenhum log encontrado</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs; 