import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    FileText, 
    AlertTriangle,
    Calendar,
    Download
} from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ClientDashboard = () => {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const response = await axios.get('/api/certificates');
            // Tratar resposta paginada ou não paginada
            const certificatesData = response.data.data || response.data;
            console.log('Certificados recebidos:', certificatesData);
            setCertificates(certificatesData);
        } catch (error) {
            console.error('Erro ao carregar certificados:', error);
            setCertificates([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (certificateId, fileName) => {
        try {
            const response = await axios.get(
                `/api/certificates/${certificateId}/download`,
                { responseType: 'blob' }
            );
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao fazer download:', error);
        }
    };

    const isExpiringSoon = (expiryDate) => {
        const expiry = new Date(expiryDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiry <= thirtyDaysFromNow && expiry >= new Date();
    };

    const isExpired = (expiryDate) => {
        return new Date(expiryDate) < new Date();
    };

    const validCertificates = Array.isArray(certificates) ? certificates.filter(cert => !isExpired(cert.expiry_date)) : [];
    const expiringSoon = Array.isArray(certificates) ? certificates.filter(cert => isExpiringSoon(cert.expiry_date)) : [];
    const expiredCertificates = Array.isArray(certificates) ? certificates.filter(cert => isExpired(cert.expiry_date)) : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando dashboard do cliente...</p>
                </div>
            </div>
        );
    }

    // Fallback se não houver usuário
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-gray-600">Usuário não encontrado</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Meus Certificados</h1>
                <p className="text-gray-600">
                    Bem-vindo, {user.company_name}! Aqui estão seus certificados de calibração.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total de Certificados</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{certificates.length}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Expirando em 30 dias</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {expiringSoon.length}
                            </p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Válidos</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {validCertificates.length}
                            </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Certificates List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Certificados ({certificates.length})
                    </h2>
                </div>
                <div className="p-6">
                    {certificates.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum certificado encontrado</h3>
                            <p className="text-gray-600">
                                Seus certificados aparecerão aqui quando forem enviados.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {certificates.map((certificate) => (
                                <div key={certificate.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {certificate.equipment_name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Número: {certificate.certificate_number}
                                            </p>
                                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                <span>
                                                    Calibração: {format(new Date(certificate.calibration_date), 'dd/MM/yyyy', { locale: ptBR })}
                                                </span>
                                                <span>
                                                    Expira: {format(new Date(certificate.expiry_date), 'dd/MM/yyyy', { locale: ptBR })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {isExpired(certificate.expiry_date) && (
                                                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                                    Expirado
                                                </span>
                                            )}
                                            {isExpiringSoon(certificate.expiry_date) && !isExpired(certificate.expiry_date) && (
                                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                                    Expirando
                                                </span>
                                            )}
                                            <button
                                                onClick={() => handleDownload(certificate.id, certificate.file_name)}
                                                className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard; 