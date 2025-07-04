import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    Building2, 
    Mail, 
    Settings, 
    Save, 
    Upload,
    Eye,
    EyeOff,
    TestTube,
    Server,
    FileText,
    Plus,
    Edit,
    Trash2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SystemSettings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('company');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    
    // Dados da empresa
    const [companyData, setCompanyData] = useState({
        company_name: '',
        cnpj: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        website: '',
        description: '',
    });
    const [logoFile, setLogoFile] = useState(null);
    const [currentLogo, setCurrentLogo] = useState(null);

    // Configurações SMTP
    const [smtpSettings, setSmtpSettings] = useState({
        smtp_host: '',
        smtp_port: 587,
        smtp_username: '',
        smtp_password: '',
        smtp_encryption: 'tls',
        from_email: '',
        from_name: ''
    });

    // Templates de email
    const [emailTemplates, setEmailTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templateContent, setTemplateContent] = useState('');
    const [testTemplateModalOpen, setTestTemplateModalOpen] = useState(false);
    const [testTemplateClient, setTestTemplateClient] = useState('');
    const [testTemplateEquipment, setTestTemplateEquipment] = useState('');
    const [clients, setClients] = useState([]);
    const [equipments, setEquipments] = useState([]);

    // Segurança
    const [securitySettings, setSecuritySettings] = useState({
        max_login_attempts_ip: 5,
        max_login_attempts_email: 3,
        block_duration_ip: 15,
        block_duration_email: 30,
        session_timeout: 120
    });

    // Notificações
    const [notificationSettings, setNotificationSettings] = useState({
        expiry_notification_days: [30, 15, 7, 1],
        auto_send_emails: true,
        notification_email: ''
    });

    useEffect(() => {
        fetchCompanySettings();
        fetchSmtpSettings();
        fetchEmailTemplates();
        fetchSecuritySettings();
        fetchNotificationSettings();
    }, []);

    const fetchCompanySettings = async () => {
        try {
            const response = await axios.get('/api/company-settings');
            if (response.data) {
                setCompanyData(response.data);
                setCurrentLogo(response.data.logo_url);
            }
        } catch (error) {
            console.error('Erro ao carregar configurações da empresa:', error);
        }
    };

    const fetchSmtpSettings = async () => {
        try {
            const response = await axios.get('/api/system/settings');
            if (response.data) {
                setSmtpSettings(response.data.email);
            }
        } catch (error) {
            console.error('Erro ao carregar configurações SMTP:', error);
        }
    };

    const fetchEmailTemplates = async () => {
        try {
            const response = await axios.get('/api/system/email-templates');
            setEmailTemplates(response.data);
        } catch (error) {
            console.error('Erro ao carregar templates de email:', error);
        }
    };

    const fetchSecuritySettings = async () => {
        try {
            const response = await axios.get('/api/system/settings');
            if (response.data && response.data.security) {
                setSecuritySettings(response.data.security);
            }
        } catch (error) {
            console.error('Erro ao carregar configurações de segurança:', error);
        }
    };

    const fetchNotificationSettings = async () => {
        try {
            const response = await axios.get('/api/system/settings');
            if (response.data && response.data.notification) {
                setNotificationSettings(response.data.notification);
            }
        } catch (error) {
            console.error('Erro ao carregar configurações de notificação:', error);
        }
    };

    const handleCompanySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            Object.keys(companyData).forEach(key => {
                if (companyData[key]) {
                    formData.append(key, companyData[key]);
                }
            });

            if (logoFile) {
                formData.append('logo', logoFile);
            }

            await axios.post('/api/company-settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Configurações da empresa salvas com sucesso!');
            fetchCompanySettings();
        } catch (error) {
            console.error('Erro ao salvar configurações da empresa:', error);
            toast.error('Erro ao salvar configurações da empresa');
        } finally {
            setLoading(false);
        }
    };

    const handleSmtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Preparar dados para envio
            const dataToSend = {};
            
            // Adicionar email settings se existirem
            if (Object.keys(smtpSettings).some(key => smtpSettings[key])) {
                dataToSend.email = smtpSettings;
            }
            
            // Adicionar security settings se existirem
            if (Object.keys(securitySettings).some(key => securitySettings[key])) {
                dataToSend.security = securitySettings;
            }
            
            // Adicionar notification settings se existirem
            if (Object.keys(notificationSettings).some(key => notificationSettings[key])) {
                dataToSend.notification = notificationSettings;
            }

            await axios.post('/api/system/settings', dataToSend);
            
            toast.success('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            if (error.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat();
                toast.error(errorMessages.join(', '));
            } else {
                toast.error('Erro ao salvar configurações');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmail) {
            toast.error('Digite um email para teste');
            return;
        }

        setLoading(true);

        try {
            await axios.post('/api/system/test-email', {
                test_email: testEmail
            });
            
            toast.success('Email de teste enviado com sucesso!');
            setTestEmail('');
        } catch (error) {
            console.error('Erro ao enviar email de teste:', error);
            toast.error('Erro ao enviar email de teste');
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setTemplateContent(template.body || '');
    };

    const handleTemplateSave = async () => {
        if (!selectedTemplate) return;

        try {
            await axios.put(`/api/system/email-templates/${selectedTemplate.id}`, {
                name: selectedTemplate.name,
                subject: selectedTemplate.subject,
                body: templateContent,
                is_active: selectedTemplate.is_active
            });
            toast.success('Template salvo com sucesso!');
            fetchEmailTemplates();
            setSelectedTemplate(null);
        } catch (error) {
            console.error('Erro ao salvar template:', error);
            if (error.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat();
                toast.error(errorMessages.join(', '));
            } else {
                toast.error('Erro ao salvar template');
            }
        }
    };

    const openTestTemplateModal = (template) => {
        setSelectedTemplate(template);
        setTestTemplateModalOpen(true);
        // Buscar clientes
        axios.get('/api/clients').then(res => setClients(res.data));
        setEquipments([]);
        setTestTemplateClient('');
        setTestTemplateEquipment('');
    };

    const closeTestTemplateModal = () => {
        setSelectedTemplate(null);
        setTestTemplateModalOpen(false);
    };

    const handleSendTestTemplate = async () => {
        if (!selectedTemplate) return;

        setLoading(true);

        try {
            await axios.post('/api/system/test-template', {
                template_id: selectedTemplate.id,
                client_id: testTemplateClient,
                certificate_id: testTemplateEquipment
            });
            
            toast.success('Teste de envio enviado com sucesso!');
            closeTestTemplateModal();
        } catch (error) {
            console.error('Erro ao enviar teste de envio:', error);
            toast.error('Erro ao enviar teste de envio');
        } finally {
            setLoading(false);
        }
    };

    // Buscar equipamentos ao selecionar cliente
    useEffect(() => {
        if (testTemplateClient) {
            axios.get(`/api/clients/${testTemplateClient}/certificates`).then(res => setEquipments(res.data));
        } else {
            setEquipments([]);
        }
    }, [testTemplateClient]);

    const TabButton = ({ id, title, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
            <Icon className="w-4 h-4 mr-2" />
            {title}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Configurações do Sistema
                    </h1>
                    <p className="text-gray-600">
                        Gerencie as configurações da empresa, SMTP, segurança e templates de email
                    </p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex space-x-4">
                        <TabButton id="company" title="Dados da Empresa" icon={Building2} />
                        <TabButton id="smtp" title="Configurações SMTP" icon={Server} />
                        <TabButton id="templates" title="Templates de Email" icon={FileText} />
                        <TabButton id="security" title="Segurança" icon={Settings} />
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    {/* Dados da Empresa */}
                    {activeTab === 'company' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Dados da Empresa</h2>
                            <form onSubmit={handleCompanySubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nome da Empresa *
                                        </label>
                                        <input
                                            type="text"
                                            value={companyData.company_name}
                                            onChange={(e) => setCompanyData({...companyData, company_name: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            CNPJ *
                                        </label>
                                        <input
                                            type="text"
                                            value={companyData.cnpj}
                                            onChange={(e) => setCompanyData({...companyData, cnpj: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={companyData.email}
                                            onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Telefone
                                        </label>
                                        <input
                                            type="text"
                                            value={companyData.phone}
                                            onChange={(e) => setCompanyData({...companyData, phone: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            value={companyData.website}
                                            onChange={(e) => setCompanyData({...companyData, website: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            CEP
                                        </label>
                                        <input
                                            type="text"
                                            value={companyData.zip_code}
                                            onChange={(e) => setCompanyData({...companyData, zip_code: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Endereço
                                    </label>
                                    <input
                                        type="text"
                                        value={companyData.address}
                                        onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cidade
                                        </label>
                                        <input
                                            type="text"
                                            value={companyData.city}
                                            onChange={(e) => setCompanyData({...companyData, city: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Estado
                                        </label>
                                        <input
                                            type="text"
                                            value={companyData.state}
                                            onChange={(e) => setCompanyData({...companyData, state: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descrição
                                    </label>
                                    <textarea
                                        value={companyData.description}
                                        onChange={(e) => setCompanyData({...companyData, description: e.target.value})}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Logo da Empresa
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        {currentLogo && (
                                            <img src={currentLogo} alt="Logo atual" className="w-16 h-16 object-contain border rounded" />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setLogoFile(e.target.files[0])}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {loading ? 'Salvando...' : 'Salvar Configurações'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Configurações SMTP */}
                    {activeTab === 'smtp' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurações SMTP</h2>
                            <form onSubmit={handleSmtpSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Host SMTP *
                                        </label>
                                        <input
                                            type="text"
                                            value={smtpSettings.smtp_host}
                                            onChange={(e) => setSmtpSettings({...smtpSettings, smtp_host: e.target.value})}
                                            placeholder="smtp.gmail.com"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Porta SMTP *
                                        </label>
                                        <input
                                            type="number"
                                            value={smtpSettings.smtp_port}
                                            onChange={(e) => setSmtpSettings({...smtpSettings, smtp_port: parseInt(e.target.value)})}
                                            placeholder="587"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Usuário SMTP *
                                        </label>
                                        <input
                                            type="text"
                                            value={smtpSettings.smtp_username}
                                            onChange={(e) => setSmtpSettings({...smtpSettings, smtp_username: e.target.value})}
                                            placeholder="seu-email@gmail.com"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Senha SMTP *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={smtpSettings.smtp_password}
                                                onChange={(e) => setSmtpSettings({...smtpSettings, smtp_password: e.target.value})}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Criptografia *
                                        </label>
                                        <select
                                            value={smtpSettings.smtp_encryption}
                                            onChange={(e) => setSmtpSettings({...smtpSettings, smtp_encryption: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        >
                                            <option value="tls">TLS</option>
                                            <option value="ssl">SSL</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Remetente *
                                        </label>
                                        <input
                                            type="email"
                                            value={smtpSettings.from_email}
                                            onChange={(e) => setSmtpSettings({...smtpSettings, from_email: e.target.value})}
                                            placeholder="noreply@empresa.com"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome do Remetente *
                                    </label>
                                    <input
                                        type="text"
                                        value={smtpSettings.from_name}
                                        onChange={(e) => setSmtpSettings({...smtpSettings, from_name: e.target.value})}
                                        placeholder="Sistema de Metrologia"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div className="flex items-center space-x-3 mt-4">
                                    <input
                                        type="email"
                                        value={testEmail}
                                        onChange={e => setTestEmail(e.target.value)}
                                        placeholder="Digite um email para teste"
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleTestEmail}
                                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <TestTube className="w-4 h-4 mr-2" />
                                        Testar Email
                                    </button>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {loading ? 'Salvando...' : 'Salvar Configurações'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Email Templates */}
                    {activeTab === 'templates' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Templates de Email
                            </h2>
                            
                            {/* Variáveis Disponíveis */}
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <h3 className="text-lg font-medium text-blue-900 mb-3">Variáveis Disponíveis</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-blue-800 mb-2">Informações do Cliente:</h4>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li><code className="bg-blue-100 px-1 rounded">&#123;&#123;$client_name&#125;&#125;</code> - Razão do cliente</li>
                                            <li><code className="bg-blue-100 px-1 rounded">&#123;&#123;$client_email&#125;&#125;</code> - Email do cliente</li>
                                            <li><code className="bg-blue-100 px-1 rounded">&#123;&#123;$client_cnpj&#125;&#125;</code> - CNPJ do cliente</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-blue-800 mb-2">Informações do Certificado:</h4>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li><code className="bg-blue-100 px-1 rounded">&#123;&#123;$certificate_number&#125;&#125;</code> - Número do certificado</li>
                                            <li><code className="bg-blue-100 px-1 rounded">&#123;&#123;$equipment_name&#125;&#125;</code> - Nome do equipamento</li>
                                            <li><code className="bg-blue-100 px-1 rounded">&#123;&#123;$expiry_date&#125;&#125;</code> - Data de expiração</li>
                                            <li><code className="bg-blue-100 px-1 rounded">&#123;&#123;$days_until_expiry&#125;&#125;</code> - Dias até expirar</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {emailTemplates.map((template) => (
                                    <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    template.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {template.is_active ? 'Ativo' : 'Inativo'}
                                                </span>
                                                <button
                                                    onClick={() => handleTemplateSelect(template)}
                                                    className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => openTestTemplateModal(template)}
                                                    className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                >
                                                    <TestTube className="w-4 h-4 mr-1" />
                                                    Testar Envio
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            <strong>Assunto:</strong> {template.subject}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Corpo:</strong> {template.body.substring(0, 100)}...
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Modal de Edição de Template */}
                            {selectedTemplate && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                Editar Template: {selectedTemplate.name}
                                            </h2>
                                            <button
                                                onClick={() => setSelectedTemplate(null)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Legendas das variáveis disponíveis */}
                                            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                                                <h3 className="text-lg font-medium text-blue-900 mb-3">Variáveis Disponíveis</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="font-medium text-blue-800 mb-2">Informações do Cliente:</h4>
                                                        <ul className="text-sm text-blue-700 space-y-1">
                                                            <li><code className="bg-blue-100 px-1 rounded">&#123;&#123;$client_name&#125;&#125;</code> - Razão do cliente</li>
                                                            <li><code className="bg-blue-100 px-1 rounded">&#123;&#123;$client_email&#125;&#125;</code> - Email do cliente</li>
                                                            <li><code className="bg-blue-100 px-1 rounded">&#123;&#123;$client_cnpj&#125;&#125;</code> - CNPJ do cliente</li>
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-blue-800 mb-2">Informações do Certificado:</h4>
                                                        <ul className="text-sm text-blue-700 space-y-1">
                                                            <li><code className="bg-blue-100 px-1 rounded">&#123;&#123;$certificate_number&#125;&#125;</code> - Número do certificado</li>
                                                            <li><code className="bg-blue-100 px-1 rounded">&#123;&#123;$equipment_name&#125;&#125;</code> - Nome do equipamento</li>
                                                            <li><code className="bg-blue-100 px-1 rounded">&#123;&#123;$expiry_date&#125;&#125;</code> - Data de expiração</li>
                                                            <li><code className="bg-blue-100 px-1 rounded">&#123;&#123;$days_until_expiry&#125;&#125;</code> - Dias até expirar</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nome do Template
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedTemplate.name}
                                                    onChange={(e) => setSelectedTemplate({...selectedTemplate, name: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Assunto
                                                </label>
                                                <input
                                                    type="text"
                                                    value={selectedTemplate.subject}
                                                    onChange={(e) => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Corpo da Mensagem
                                                </label>
                                                <textarea
                                                    value={templateContent}
                                                    onChange={(e) => setTemplateContent(e.target.value)}
                                                    rows={15}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Digite o conteúdo do template. Use as variáveis disponíveis acima."
                                                />
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="is_active"
                                                    checked={selectedTemplate.is_active}
                                                    onChange={(e) => setSelectedTemplate({...selectedTemplate, is_active: e.target.checked})}
                                                    className="mr-2"
                                                />
                                                <label htmlFor="is_active" className="text-sm text-gray-700">
                                                    Template ativo
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-3 pt-6">
                                            <button
                                                onClick={() => setSelectedTemplate(null)}
                                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleTemplateSave}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Salvar Template
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal de Teste de Template */}
                            {testTemplateModalOpen && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-semibold text-gray-900">Testar Envio de Template</h2>
                                            <button onClick={closeTestTemplateModal} className="text-gray-400 hover:text-gray-600">✕</button>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                                            <select
                                                value={testTemplateClient}
                                                onChange={e => setTestTemplateClient(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="">Selecione um cliente</option>
                                                {clients.map(client => (
                                                    <option key={client.id} value={client.id}>{client.company_name} ({client.email})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Equipamento</label>
                                            <select
                                                value={testTemplateEquipment}
                                                onChange={e => setTestTemplateEquipment(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                disabled={!testTemplateClient}
                                            >
                                                <option value="">Selecione um equipamento</option>
                                                {equipments.map(eq => (
                                                    <option key={eq.id} value={eq.id}>{eq.equipment_name} - {eq.certificate_number}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={closeTestTemplateModal}
                                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleSendTestTemplate}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                Enviar Teste
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Segurança */}
                    {activeTab === 'security' && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurações de Segurança</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Máximo de tentativas por IP
                                    </label>
                                    <input
                                        type="number"
                                        value={securitySettings.max_login_attempts_ip}
                                        onChange={(e) => setSecuritySettings({...securitySettings, max_login_attempts_ip: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        min="1"
                                        max="20"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Máximo de tentativas por email
                                    </label>
                                    <input
                                        type="number"
                                        value={securitySettings.max_login_attempts_email}
                                        onChange={(e) => setSecuritySettings({...securitySettings, max_login_attempts_email: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        min="1"
                                        max="10"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duração do bloqueio por IP (minutos)
                                    </label>
                                    <input
                                        type="number"
                                        value={securitySettings.block_duration_ip}
                                        onChange={(e) => setSecuritySettings({...securitySettings, block_duration_ip: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        min="1"
                                        max="60"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duração do bloqueio por email (minutos)
                                    </label>
                                    <input
                                        type="number"
                                        value={securitySettings.block_duration_email}
                                        onChange={(e) => setSecuritySettings({...securitySettings, block_duration_email: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        min="1"
                                        max="120"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Timeout da sessão (minutos)
                                    </label>
                                    <input
                                        type="number"
                                        value={securitySettings.session_timeout}
                                        onChange={(e) => setSecuritySettings({...securitySettings, session_timeout: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        min="30"
                                        max="480"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    onClick={handleSmtpSubmit}
                                    disabled={loading}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {loading ? 'Salvando...' : 'Salvar Configurações'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemSettings; 