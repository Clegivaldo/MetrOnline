import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const DocumentRevisions = ({ documentId, formatDate }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Buscar revisões do documento
  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/documents/${documentId}/revisions`);
        setRevisions(response.data);
      } catch (error) {
        console.error('Erro ao buscar revisões:', error);
        enqueueSnackbar('Erro ao carregar histórico de revisões', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchRevisions();
    }
  }, [documentId, enqueueSnackbar]);

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
        return <span style={{ color: 'gray' }}>&#128270;</span>;
    }
  };

  // Manipulador de download
  const handleDownloadRevision = async (revisionId, fileName) => {
    try {
      const response = await axios.get(`/api/documents/revisions/${revisionId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      enqueueSnackbar('Download da revisão iniciado com sucesso', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao baixar revisão:', error);
      enqueueSnackbar('Erro ao baixar revisão', { variant: 'error' });
    }
  };

  if (loading) {
    return <div style={{ width: '100%', marginTop: '10px' }}><div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0' }}></div></div>;
  }

  if (revisions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '16px' }}>
        <p style={{ color: '#6c757d' }}>Nenhuma revisão encontrada para este documento.</p>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '20px', color: '#6c757d' }}>&#128203;</span>
        <h3 style={{ margin: '0' }}>Histórico de Revisões</h3>
      </div>
      <div style={{ padding: '16px' }}>
        <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
          {revisions.map((revision, index) => (
            <React.Fragment key={revision.id}>
              <li style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px', color: '#6c757d' }}>&#128203;</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Versão {revision.version}</span>
                      <span style={{ fontSize: '14px', color: '#6c757d', backgroundColor: '#e0e0e0', padding: '4px 8px', borderRadius: '4px' }}>{revision.status}</span>
                      {revision.is_current && (
                        <span style={{ fontSize: '14px', color: '#1976d2', border: '1px solid #1976d2', padding: '4px 8px', borderRadius: '4px' }}>Versão Atual</span>
                      )}
                    </div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#333' }}>{revision.notes || 'Nenhuma observação fornecida.'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#6c757d' }}>&#128100;</span>
                      <span style={{ fontSize: '14px', color: '#6c757d' }}>{revision.creator?.name || 'Usuário desconhecido'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#6c757d' }}>&#128197;</span>
                      <span style={{ fontSize: '14px', color: '#6c757d' }}>{formatDate(revision.created_at)}</span>
                    </div>
                  </div>
                </div>
                <button 
                  style={{ backgroundColor: '#4caf50', color: 'white', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => handleDownloadRevision(revision.id, revision.file_name)}
                >
                  <span style={{ fontSize: '16px' }}>&#128190;</span>
                  Baixar
                </button>
              </li>
              {index < revisions.length - 1 && <div style={{ height: '1px', backgroundColor: '#f0f0f0', margin: '12px 0' }}></div>}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DocumentRevisions;
