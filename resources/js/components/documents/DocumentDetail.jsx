import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import DocumentOverview from './DocumentOverview';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  // Estados
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  // Efeito para carregar o documento
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/documents/${id}`);
        setDocument(response.data);
      } catch (error) {
        console.error('Erro ao carregar documento:', error);
        enqueueSnackbar('Erro ao carregar documento', { variant: 'error' });
        navigate('/documents');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocument();
    }
  }, [id, navigate, enqueueSnackbar]);

  // Manipulador de download
  const handleDownload = async () => {
    try {
      const response = await axios.get(`/api/documents/${id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      enqueueSnackbar('Download iniciado com sucesso', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      enqueueSnackbar('Erro ao baixar documento', { variant: 'error' });
    }
  };

  // Obter ícone de status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'aprovado':
        return <span style={{ color: 'green' }}>&#10003;</span>;
      case 'em_revisao':
        return <span style={{ color: 'orange' }}>&#9889;</span>;
      case 'obsoleto':
        return <span style={{ color: 'red' }}>&#128721;</span>;
      default:
        return <span style={{ color: 'blue' }}>&#128270;</span>;
    }
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  if (loading) {
    return (
      <div style={{ width: '100%' }}>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0' }}>
          <div style={{ width: '50%', height: '100%', backgroundColor: '#4caf50', animation: 'linear-progress 1.5s infinite' }}></div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div style={{ textAlign: 'center', padding: '16px' }}>
        <h6>Documento não encontrado</h6>
        <button 
          style={{ 
            backgroundColor: '#4caf50', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            marginTop: '16px'
          }}
          onClick={() => navigate('/documents')}
        >
          Voltar para a lista
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <button 
          style={{ marginRight: '8px' }}
          onClick={() => navigate('/documents')} 
        >
          &lt;
        </button>
        <h4 style={{ margin: '0' }}>{document.title}</h4>
        <div style={{ flexGrow: 1 }} />
        <button
          style={{ 
            backgroundColor: document.file_path ? '#4caf50' : '#bbb',
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '4px', 
            cursor: document.file_path ? 'pointer' : 'not-allowed',
            marginRight: '8px'
          }}
          onClick={document.file_path ? handleDownload : undefined}
          disabled={!document.file_path}
        >
          Baixar
        </button>
        {!document.file_path && (
          <span style={{ color: 'red', marginLeft: 8, fontSize: 13 }}>
            Nenhum arquivo PDF disponível
          </span>
        )}
        <button
          style={{ 
            backgroundColor: '#4caf50', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '4px', 
            cursor: 'pointer'
          }}
          onClick={() => navigate(`/documents/${id}/edit`)}
        >
          Editar
        </button>
      </div>
      
      {/* Abas */}
      <div style={{ marginBottom: '16px' }}>
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            borderBottom: '1px solid #e0e0e0', 
            paddingBottom: '8px'
          }}
        >
          <button 
            style={{ 
              backgroundColor: activeTab === 0 ? '#4caf50' : 'transparent', 
              color: activeTab === 0 ? 'white' : 'inherit', 
              padding: '8px 16px', 
              borderRadius: '4px 4px 0 0', 
              cursor: 'pointer',
              border: 'none',
              borderBottom: activeTab === 0 ? '2px solid #4caf50' : 'none'
            }}
            onClick={(e) => setActiveTab(0)}
          >
            Visão Geral
          </button>
          <button 
            style={{ 
              backgroundColor: activeTab === 1 ? '#4caf50' : 'transparent', 
              color: activeTab === 1 ? 'white' : 'inherit', 
              padding: '8px 16px', 
              borderRadius: '4px 4px 0 0', 
              cursor: 'pointer',
              border: 'none',
              borderBottom: activeTab === 1 ? '2px solid #4caf50' : 'none'
            }}
            onClick={(e) => setActiveTab(1)}
          >
            Histórico de Revisões
          </button>
          <button 
            style={{ 
              backgroundColor: activeTab === 2 ? '#4caf50' : 'transparent', 
              color: activeTab === 2 ? 'white' : 'inherit', 
              padding: '8px 16px', 
              borderRadius: '4px 4px 0 0', 
              cursor: 'pointer',
              border: 'none',
              borderBottom: activeTab === 2 ? '2px solid #4caf50' : 'none'
            }}
            onClick={(e) => setActiveTab(2)}
          >
            Distribuição
          </button>
        </div>
      </div>
      
      {/* Conteúdo das abas */}
      <div>
        {activeTab === 0 && (
          <DocumentOverview 
            document={document} 
            formatDate={formatDate} 
            getStatusIcon={getStatusIcon} 
          />
        )}
        {activeTab === 1 && (
          <DocumentRevisions 
            documentId={id} 
            formatDate={formatDate} 
          />
        )}
        {activeTab === 2 && (
          <DocumentDistributions 
            documentId={id} 
            formatDate={formatDate} 
          />
        )}
      </div>
    </div>
  );
};

export default DocumentDetail;
