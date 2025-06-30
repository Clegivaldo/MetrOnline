import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Eye, 
    Download,
    Filter,
    Building2,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ClientManagement = () => {
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({
        company_name: '',
        cnpj: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        contact_person: '',
        notes: ''
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await axios.get('/api/clients');
            setClients(response.data.data || response.data);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            // Se der erro de autenticação, tentar a rota pública
            if (error.response?.status === 401) {
                try {
                    const publicResponse = await axios.get('/api/clients/test');
                    setClients(publicResponse.data.data || publicResponse.data);
                } catch (publicError) {
                    console.error('Erro ao carregar clientes públicos:', publicError);
                    toast.error('Erro ao carregar clientes');
                }
            } else {
                toast.error('Erro ao carregar clientes');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingClient) {
                await axios.put(`/api/clients/${editingClient.id}`, formData);
                toast.success('Cliente atualizado com sucesso!');
            } else {
                await axios.post('/api/clients', formData);
                toast.success('Cliente criado com sucesso!');
            }
            
            setShowModal(false);
            setEditingClient(null);
            resetForm();
            fetchClients();
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            toast.error('Erro ao salvar cliente');
        }
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setFormData({
            company_name: client.company_name,
            cnpj: client.cnpj,
            email: client.email,
            password: client.password,
            phone: client.phone,
            address: client.address,
            city: client.city || '',
            state: client.state || '',
            zip_code: client.zip_code || '',
            contact_person: client.contact_person,
            notes: client.notes
        });
        setShowModal(true);
    };

    const handleDelete = async (clientId) => {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

        try {
            await axios.delete(`/api/clients/${clientId}`);
            toast.success('Cliente excluído com sucesso!');
            fetchClients();
        } catch (error) {
            console.error('Erro ao excluir cliente:', error);
            toast.error('Erro ao excluir cliente');
        }
    };

    const resetForm = () => {
        setFormData({
            company_name: '',
            cnpj: '',
            email: '',
            password: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zip_code: '',
            contact_person: '',
            notes: ''
        });
    };

    const openNewClientModal = () => {
        setEditingClient(null);
        resetForm();
        setShowModal(true);
    };

    const handleCnpjBlur = async () => {
        if (formData.cnpj && formData.cnpj.length >= 11) {
            try {
                let response;
                try {
                    response = await axios.get(`/api/cnpj/${formData.cnpj}`);
                } catch (error) {
                    if (error.response?.status === 404) {
                        // Se der 404, tentar a rota pública
                        response = await axios.get(`/api/cnpj/${formData.cnpj}`);
                    } else {
                        throw error;
                    }
                }
                
                if (response.data && response.data.company_name) {
                    setFormData(prev => ({
                        ...prev,
                        company_name: response.data.company_name || prev.company_name,
                        address: response.data.address || prev.address,
                        city: response.data.city || prev.city,
                        state: response.data.state || prev.state,
                        zip_code: response.data.zip_code || prev.zip_code,
                        email: response.data.email || prev.email,
                        phone: response.data.phone || prev.phone,
                    }));
                    toast.success('Dados do CNPJ preenchidos automaticamente!');
                } else {
                    toast.error('CNPJ não encontrado.');
                }
            } catch (error) {
                console.error('Erro ao consultar CNPJ:', error);
                toast.error('Erro ao consultar CNPJ.');
            }
        }
    };

    const filteredClients = clients.filter(client =>
        client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.cnpj.includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
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
                                Gerenciamento de Clientes
                            </h1>
                            <p className="text-gray-600">
                                Gerencie os clientes do sistema de metrologia
                            </p>
                        </div>
                        <button
                            onClick={openNewClientModal}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Novo Cliente
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar clientes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                                {filteredClients.length} cliente(s) encontrado(s)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Clients Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <div key={client.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{client.company_name}</h3>
                                        <p className="text-sm text-gray-600">{client.cnpj}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => handleEdit(client)}
                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(client.id)}
                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Mail className="w-4 h-4" />
                                    <span>{client.email}</span>
                                </div>
                                {client.phone && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        <span>{client.phone}</span>
                                    </div>
                                )}
                                {client.address && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span className="truncate">{client.address}</span>
                                    </div>
                                )}
                                {client.contact_person && (
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">Contato:</span> {client.contact_person}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Certificados:</span>
                                    <span className="font-medium text-gray-900">
                                        {client.certificates_count || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-1">
                                    <span className="text-gray-600">Criado em:</span>
                                    <span className="text-gray-900">
                                        {new Date(client.created_at).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredClients.length === 0 && (
                    <div className="text-center py-12">
                        <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nenhum cliente encontrado
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando seu primeiro cliente.'}
                        </p>
                    </div>
                )}

                {/* Modal de Cliente */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* CNPJ - Primeiro campo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        CNPJ *
                                    </label>
                                    <input
                                        type="text"
                                        name="cnpj"
                                        value={formData.cnpj}
                                        onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                                        onBlur={handleCnpjBlur}
                                        placeholder="00.000.000/0000-00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Razão Social */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Razão Social *
                                    </label>
                                    <input
                                        type="text"
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                                        placeholder="Nome da empresa"
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
                                        placeholder="email@empresa.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                {/* Senha */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Senha {!editingClient && '*'}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        placeholder={editingClient ? "Deixe em branco para manter a atual" : "Senha de acesso"}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required={!editingClient}
                                    />
                                    {editingClient && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Deixe em branco para manter a senha atual
                                        </p>
                                    )}
                                </div>

                                {/* Telefone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Telefone
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        placeholder="(11) 99999-9999"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Endereço */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Endereço
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        placeholder="Rua, número, bairro"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Cidade e Estado */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cidade
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                                            placeholder="São Paulo"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Estado
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                                            placeholder="SP"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* CEP */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        CEP
                                    </label>
                                    <input
                                        type="text"
                                        name="zip_code"
                                        value={formData.zip_code}
                                        onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                                        placeholder="00000-000"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Observações */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Observações
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        placeholder="Observações adicionais..."
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
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
                                        {editingClient ? 'Atualizar' : 'Criar'} Cliente
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

export default ClientManagement; 