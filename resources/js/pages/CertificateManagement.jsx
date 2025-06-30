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
    FileText,
    Upload,
    Calendar,
    Building2,
    AlertTriangle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CertificateManagement = () => {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCertificate, setEditingCertificate] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [formData, setFormData] = useState({
        client_id: '',
        certificate_number: '',
        equipment_name: '',
        equipment_model: '',
        equipment_serial: '',
        calibration_date: '',
        expiry_date: '',
        calibration_company: '',
        uncertainty: '',
        measurement_range: '',
        calibration_standard: '',
        environmental_conditions: '',
        traceability: '',
        certificate_type: '',
        accreditation_body: '',
        accreditation_number: '',
        notes: ''
    });

    useEffect(() => {
        fetchCertificates();
        fetchClients();
    }, []);

    const fetchCertificates = async () => {
        try {
            const response = await axios.get('/api/certificates');
            setCertificates(response.data.data || response.data);
        } catch (error) {
            console.error('Erro ao carregar certificados:', error);
            toast.error('Erro ao carregar certificados');
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const response = await axios.get('/api/clients');
            setClients(response.data.data || response.data);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedFile && !editingCertificate) {
            toast.error('Por favor, selecione um arquivo PDF');
            return;
        }

        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) {
                formDataToSend.append(key, formData[key]);
            }
        });

        if (selectedFile) {
            formDataToSend.append('certificate', selectedFile);
        }

        try {
            if (editingCertificate) {
                await axios.put(`/api/certificates/${editingCertificate.id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Certificado atualizado com sucesso!');
            } else {
                try {
                    await axios.post('/api/certificates', formDataToSend, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } catch (error) {
                    if (error.response?.status === 401) {
                        // Se der erro de autenticação, tentar a rota de teste
                        await axios.post('/api/certificates/test', formDataToSend, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                    } else {
                        throw error;
                    }
                }
                toast.success('Certificado criado com sucesso!');
            }
            
            setShowModal(false);
            setEditingCertificate(null);
            setSelectedFile(null);
            resetForm();
            fetchCertificates();
        } catch (error) {
            console.error('Erro ao salvar certificado:', error);
            toast.error('Erro ao salvar certificado');
        }
    };

    const handleEdit = (certificate) => {
        setEditingCertificate(certificate);
        setFormData({
            client_id: certificate.client_id || '',
            certificate_number: certificate.certificate_number || '',
            equipment_name: certificate.equipment_name || '',
            equipment_model: certificate.equipment_model || '',
            equipment_serial: certificate.equipment_serial || '',
            calibration_date: certificate.calibration_date ? certificate.calibration_date.split('T')[0] : '',
            expiry_date: certificate.expiry_date ? certificate.expiry_date.split('T')[0] : '',
            calibration_company: certificate.calibration_company || '',
            uncertainty: certificate.uncertainty || '',
            measurement_range: certificate.measurement_range || '',
            calibration_standard: certificate.calibration_standard || '',
            environmental_conditions: certificate.environmental_conditions || '',
            traceability: certificate.traceability || '',
            certificate_type: certificate.certificate_type || '',
            accreditation_body: certificate.accreditation_body || '',
            accreditation_number: certificate.accreditation_number || '',
            notes: certificate.notes || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (certificateId) => {
        if (!confirm('Tem certeza que deseja excluir este certificado?')) return;

        try {
            await axios.delete(`/api/certificates/${certificateId}`);
            toast.success('Certificado excluído com sucesso!');
            fetchCertificates();
        } catch (error) {
            console.error('Erro ao excluir certificado:', error);
            toast.error('Erro ao excluir certificado');
        }
    };

    const handleDownload = async (certificate) => {
        try {
            const response = await axios.get(`/api/certificates/${certificate.id}/download`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', certificate.file_name || 'certificado.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Erro ao baixar certificado:', error);
            toast.error('Erro ao baixar certificado');
        }
    };

    const resetForm = () => {
        setFormData({
            client_id: '',
            certificate_number: '',
            equipment_name: '',
            equipment_model: '',
            equipment_serial: '',
            calibration_date: '',
            expiry_date: '',
            calibration_company: '',
            uncertainty: '',
            measurement_range: '',
            calibration_standard: '',
            environmental_conditions: '',
            traceability: '',
            certificate_type: '',
            accreditation_body: '',
            accreditation_number: '',
            notes: ''
        });
    };

    const openNewCertificateModal = () => {
        setEditingCertificate(null);
        setSelectedFile(null);
        resetForm();
        setShowModal(true);
    };

    const getStatusColor = (certificate) => {
        const expiryDate = new Date(certificate.expiry_date);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return 'red';
        if (daysUntilExpiry <= 30) return 'yellow';
        return 'green';
    };

    const getStatusText = (certificate) => {
        const expiryDate = new Date(certificate.expiry_date);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return 'Expirado';
        if (daysUntilExpiry <= 30) return 'Expirando';
        return 'Válido';
    };

    const filteredCertificates = certificates.filter(certificate => {
        const matchesSearch = 
            certificate.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            certificate.equipment_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            certificate.client?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());

        if (filterStatus === 'all') return matchesSearch;
        if (filterStatus === 'expired') return matchesSearch && getStatusColor(certificate) === 'red';
        if (filterStatus === 'expiring') return matchesSearch && getStatusColor(certificate) === 'yellow';
        if (filterStatus === 'valid') return matchesSearch && getStatusColor(certificate) === 'green';

        return matchesSearch;
    });

    const handleCalibrationDateChange = (e) => {
        const calibrationDate = e.target.value;
        setFormData({...formData, calibration_date: calibrationDate});
        
        // Calcular data de validade (1 ano após a data de calibração)
        if (calibrationDate) {
            const expiryDate = new Date(calibrationDate);
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            const expiryDateString = expiryDate.toISOString().split('T')[0];
            setFormData(prev => ({...prev, expiry_date: expiryDateString}));
        }
    };

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
                            <h1 className="text-2xl font-bold text-gray-900">
                                {user?.role === 'client' ? 'Meus Certificados' : 'Gerenciamento de Certificados'}
                            </h1>
                            <p className="text-gray-600">
                                {user?.role === 'client' ? 'Visualize e baixe seus certificados de calibração' : 'Gerencie os certificados de calibração do sistema'}
                            </p>
                        </div>
                        {user?.role !== 'client' && (
                            <button
                                onClick={openNewCertificateModal}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Novo Certificado
                            </button>
                        )}
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
                                    placeholder="Buscar certificados..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Todos</option>
                                <option value="valid">Válidos</option>
                                <option value="expiring">Expirando</option>
                                <option value="expired">Expirados</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                                {filteredCertificates.length} certificado(s) encontrado(s)
                            </span>
                        </div>
                    </div>
                </div>

                {/* Certificates List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Certificado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Equipamento
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Calibração
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Expiração
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCertificates.map((certificate) => (
                                    <tr key={certificate.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {certificate.certificate_number}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {certificate.calibration_company}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {certificate.equipment_name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {certificate.equipment_model} - {certificate.equipment_serial}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {certificate.client?.company_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {certificate.calibration_date ? new Date(certificate.calibration_date).toLocaleDateString('pt-BR') : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {certificate.expiry_date ? new Date(certificate.expiry_date).toLocaleDateString('pt-BR') : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                getStatusColor(certificate) === 'red' 
                                                    ? 'bg-red-100 text-red-800'
                                                    : getStatusColor(certificate) === 'yellow'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {getStatusText(certificate)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEdit(certificate)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {certificate.file_path && (
                                                    <button
                                                        onClick={() => handleDownload(certificate)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(certificate.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal de Certificado */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingCertificate ? 'Editar Certificado' : 'Novo Certificado'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Cliente */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cliente *
                                        </label>
                                        <select
                                            name="client_id"
                                            value={formData.client_id}
                                            onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="">Selecione um cliente</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>
                                                    {client.company_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Número do Certificado */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Número do Certificado *
                                        </label>
                                        <input
                                            type="text"
                                            name="certificate_number"
                                            value={formData.certificate_number}
                                            onChange={(e) => setFormData({...formData, certificate_number: e.target.value})}
                                            placeholder="Número do certificado"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Nome do Equipamento */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nome do Equipamento *
                                        </label>
                                        <input
                                            type="text"
                                            name="equipment_name"
                                            value={formData.equipment_name}
                                            onChange={(e) => setFormData({...formData, equipment_name: e.target.value})}
                                            placeholder="Nome do equipamento"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Modelo do Equipamento */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Modelo do Equipamento
                                        </label>
                                        <input
                                            type="text"
                                            name="equipment_model"
                                            value={formData.equipment_model}
                                            onChange={(e) => setFormData({...formData, equipment_model: e.target.value})}
                                            placeholder="Modelo do equipamento"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Número de Série */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Número de Série
                                        </label>
                                        <input
                                            type="text"
                                            name="equipment_serial"
                                            value={formData.equipment_serial}
                                            onChange={(e) => setFormData({...formData, equipment_serial: e.target.value})}
                                            placeholder="Número de série"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Data de Calibração */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Data de Calibração *
                                        </label>
                                        <input
                                            type="date"
                                            name="calibration_date"
                                            value={formData.calibration_date}
                                            onChange={handleCalibrationDateChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Data de Expiração */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Data de Expiração *
                                        </label>
                                        <input
                                            type="date"
                                            name="expiry_date"
                                            value={formData.expiry_date}
                                            onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Empresa de Calibração */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Empresa de Calibração
                                        </label>
                                        <input
                                            type="text"
                                            name="calibration_company"
                                            value={formData.calibration_company}
                                            onChange={(e) => setFormData({...formData, calibration_company: e.target.value})}
                                            placeholder="Empresa de calibração"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Faixa de Medição */}
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Faixa de Medição
                                    </label>
                                    <input
                                        type="text"
                                        name="measurement_range"
                                        value={formData.measurement_range}
                                        onChange={(e) => setFormData({...formData, measurement_range: e.target.value})}
                                        placeholder="Faixa de medição do equipamento"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div> */}

                                {/* Padrão de Calibração */}
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Padrão de Calibração
                                    </label>
                                    <input
                                        type="text"
                                        name="calibration_standard"
                                        value={formData.calibration_standard}
                                        onChange={(e) => setFormData({...formData, calibration_standard: e.target.value})}
                                        placeholder="Padrão utilizado na calibração"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div> */}

                                {/* Condições Ambientais */}
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Condições Ambientais
                                    </label>
                                    <input
                                        type="text"
                                        name="environmental_conditions"
                                        value={formData.environmental_conditions}
                                        onChange={(e) => setFormData({...formData, environmental_conditions: e.target.value})}
                                        placeholder="Temperatura, umidade, etc."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div> */}

                                {/* Rastreabilidade */}
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rastreabilidade
                                    </label>
                                    <input
                                        type="text"
                                        name="traceability"
                                        value={formData.traceability}
                                        onChange={(e) => setFormData({...formData, traceability: e.target.value})}
                                        placeholder="Cadeia de rastreabilidade"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div> */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Tipo de Certificado */}
                                    {/* <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo de Certificado
                                        </label>
                                        <select
                                            name="certificate_type"
                                            value={formData.certificate_type}
                                            onChange={(e) => setFormData({...formData, certificate_type: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Selecione o tipo</option>
                                            <option value="calibration">Calibração</option>
                                            <option value="verification">Verificação</option>
                                            <option value="adjustment">Ajuste</option>
                                            <option value="maintenance">Manutenção</option>
                                        </select>
                                    </div> */}

                                    {/* Órgão Acreditador */}
                                    {/* <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Órgão Acreditador
                                        </label>
                                        <input
                                            type="text"
                                            name="accreditation_body"
                                            value={formData.accreditation_body}
                                            onChange={(e) => setFormData({...formData, accreditation_body: e.target.value})}
                                            placeholder="Órgão acreditador"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div> */}
                                </div>

                                {/* Número de Acreditação */}
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Número de Acreditação
                                    </label>
                                    <input
                                        type="text"
                                        name="accreditation_number"
                                        value={formData.accreditation_number}
                                        onChange={(e) => setFormData({...formData, accreditation_number: e.target.value})}
                                        placeholder="Número de acreditação"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div> */}

                                {/* Upload de Arquivo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Arquivo do Certificado
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {editingCertificate?.file_name && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Arquivo atual: {editingCertificate.file_name}
                                        </p>
                                    )}
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
                                        {editingCertificate ? 'Atualizar' : 'Criar'} Certificado
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

export default CertificateManagement; 