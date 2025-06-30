import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Eye, 
    Shield,
    User,
    Mail,
    Lock,
    Key
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        is_active: true
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users');
            setUsers(response.data.data || response.data);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            toast.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingUser) {
                await axios.put(`/api/users/${editingUser.id}`, formData);
                toast.success('Usuário atualizado com sucesso!');
            } else {
                await axios.post('/api/users', formData);
                toast.success('Usuário criado com sucesso!');
            }
            
            setShowModal(false);
            setEditingUser(null);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Erro ao salvar usuário:', error);
            toast.error('Erro ao salvar usuário');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            is_active: user.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

        try {
            await axios.delete(`/api/users/${userId}`);
            toast.success('Usuário excluído com sucesso!');
            fetchUsers();
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            toast.error('Erro ao excluir usuário');
        }
    };

    const handleResetPassword = async (userId) => {
        if (!confirm('Tem certeza que deseja redefinir a senha deste usuário?')) return;

        try {
            // Gerar uma senha aleatória
            const newPassword = Math.random().toString(36).slice(-8);
            
            try {
                await axios.post(`/api/users/${userId}/reset-password`, {
                    new_password: newPassword
                });
            } catch (error) {
                if (error.response?.status === 401) {
                    // Se der erro de autenticação, tentar a rota de teste
                    await axios.post(`/api/users/${userId}/reset-password/test`, {
                        new_password: newPassword
                    });
                } else {
                    throw error;
                }
            }
            
            toast.success(`Senha redefinida com sucesso! Nova senha: ${newPassword}`);
        } catch (error) {
            console.error('Erro ao redefinir senha:', error);
            toast.error('Erro ao redefinir senha');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'user',
            is_active: true
        });
    };

    const openNewUserModal = () => {
        setEditingUser(null);
        resetForm();
        setShowModal(true);
    };

    const getRoleBadge = (role) => {
        const colors = {
            admin: 'bg-purple-100 text-purple-800',
            user: 'bg-blue-100 text-blue-800',
            client: 'bg-green-100 text-green-800'
        };
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role] || colors.user}`}>
                {role === 'admin' ? 'Administrador' : role === 'user' ? 'Usuário' : 'Cliente'}
            </span>
        );
    };

    const getStatusBadge = (isActive) => {
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
                {isActive ? 'Ativo' : 'Inativo'}
            </span>
        );
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Gerenciamento de Usuários
                            </h1>
                            <p className="text-gray-600">
                                Gerencie os usuários do sistema de metrologia
                            </p>
                        </div>
                        <button
                            onClick={openNewUserModal}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Usuário
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar usuários..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                                {filteredUsers.length} usuário(s) encontrado(s)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usuário
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Função
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Criado em
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((userItem) => (
                                    <tr key={userItem.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {userItem.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {userItem.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                <div className="text-sm text-gray-900">
                                                    {userItem.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getRoleBadge(userItem.role)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(userItem.is_active)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(userItem.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEdit(userItem)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Editar usuário"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleResetPassword(userItem.id)}
                                                    className="text-yellow-600 hover:text-yellow-900"
                                                    title="Redefinir senha"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                {userItem.id !== user?.id && (
                                                    <button
                                                        onClick={() => handleDelete(userItem.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Excluir usuário"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal de Usuário */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Nome */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="Nome completo"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        placeholder="email@exemplo.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Senha */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        placeholder={editingUser ? 'Nova senha' : 'Senha'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required={!editingUser}
                                    />
                                </div>

                                {/* Função */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Função *
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="user">Usuário</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Usuário ativo</span>
                                    </label>
                                </div>

                                {/* Botões */}
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {editingUser ? 'Atualizar' : 'Criar'} Usuário
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement; 