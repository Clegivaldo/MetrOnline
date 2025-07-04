import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    User, 
    Mail, 
    Lock, 
    Shield, 
    Calendar,
    Save,
    Key,
    Eye,
    EyeOff,
    Upload
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [profileImage, setProfileImage] = useState(null);
    const [currentImage, setCurrentImage] = useState(null);

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    // Carregar dados do perfil e foto
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
            });
            
            // Carregar foto de perfil se existir
            if (user.profile_image_url) {
                setCurrentImage(user.profile_image_url);
            }
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', profileData.name);
            formData.append('email', profileData.email);
            
            if (profileImage) {
                formData.append('profile_image', profileImage);
            }

            const response = await axios.post('/api/profile/update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Atualizar a foto de perfil se foi enviada
            if (response.data.profile_image_url) {
                setCurrentImage(response.data.profile_image_url);
            }

            toast.success('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            toast.error('Erro ao atualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error('As senhas não coincidem');
            return;
        }

        if (passwordData.new_password.length < 6) {
            toast.error('A nova senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            await axios.post('/api/auth/change-password', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
                confirm_password: passwordData.confirm_password
            });
            
            toast.success('Senha alterada com sucesso!');
            setShowPasswordModal(false);
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            const message = error.response?.data?.error || 'Erro ao alterar senha';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const getRoleDisplay = (role) => {
        const roles = {
            admin: { name: 'Administrador', color: 'bg-purple-100 text-purple-800', icon: Shield },
            user: { name: 'Usuário', color: 'bg-blue-100 text-blue-800', icon: User },
            client: { name: 'Cliente', color: 'bg-green-100 text-green-800', icon: User }
        };
        
        const roleInfo = roles[role] || roles.user;
        const Icon = roleInfo.icon;
        
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleInfo.color}`}>
                <Icon className="w-4 h-4 mr-2" />
                {roleInfo.name}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Meu Perfil
                    </h1>
                    <p className="text-gray-600">
                        Gerencie suas informações pessoais e configurações de conta
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Informações do Perfil */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Informações Pessoais
                                </h2>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Key className="w-4 h-4 mr-2" />
                                    Alterar Senha
                                </button>
                            </div>

                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                {/* Nome */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome Completo *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Botão Salvar */}
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Informações da Conta */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Informações da Conta
                            </h2>

                            <div className="space-y-6">
                                {/* Avatar e Nome */}
                                <div className="text-center">
                                    <div className="relative w-20 h-20 mx-auto mb-4">
                                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                                            {currentImage ? (
                                                <img 
                                                    src={currentImage} 
                                                    alt="Foto de perfil" 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.style.display = 'none';
                                                        const fallback = e.target.parentElement.querySelector('.fallback-icon');
                                                        if (fallback) {
                                                            fallback.style.display = 'flex';
                                                        }
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`w-full h-full flex items-center justify-center fallback-icon ${currentImage ? 'hidden' : 'flex'}`}>
                                                <User className="w-10 h-10 text-blue-600" />
                                            </div>
                                        </div>
                                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer hover:bg-blue-700 transition-colors">
                                            <Upload className="w-3 h-3" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setProfileImage(file);
                                                        const imageUrl = URL.createObjectURL(file);
                                                        setCurrentImage(imageUrl);
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                                    <p className="text-gray-600">{user?.email}</p>
                                </div>

                                {/* Função */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Função
                                    </label>
                                    {getRoleDisplay(user?.role)}
                                </div>

                                {/* Data de Criação */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Membro desde
                                    </label>
                                    <div className="flex items-center text-gray-900">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                                    </div>
                                </div>

                                {/* Último Login */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Último Login
                                    </label>
                                    <div className="flex items-center text-gray-900">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                        {user?.last_login ? new Date(user.last_login).toLocaleDateString('pt-BR') : 'N/A'}
                                    </div>
                                </div>

                                {/* Status da Conta */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status da Conta
                                    </label>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Ativa
                                    </span>
                                </div>

                                {/* Botão de Logout */}
                                <div className="pt-4">
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <Lock className="w-4 h-4 mr-2" />
                                        Sair da Conta
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de Alteração de Senha */}
                {showPasswordModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Alterar Senha
                                </h2>
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                {/* Senha Atual */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Senha Atual *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Nova Senha */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nova Senha *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={passwordData.new_password}
                                            onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirmar Nova Senha */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmar Nova Senha *
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={passwordData.confirm_password}
                                            onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? 'Alterando...' : 'Alterar Senha'}
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

export default Profile; 