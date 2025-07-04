import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const DocumentDistributions = ({ documentId, formatDate }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [notes, setNotes] = useState('');
  const [returningId, setReturningId] = useState(null);
  
  // Buscar distribuições do documento
  const fetchDistributions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/documents/${documentId}/distributions`);
      setDistributions(response.data);
    } catch (error) {
      console.error('Erro ao buscar distribuições:', error);
      enqueueSnackbar('Erro ao carregar histórico de distribuição', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Buscar usuários para distribuição
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      enqueueSnackbar('Erro ao carregar lista de usuários', { variant: 'error' });
    }
  };

  // Efeito para carregar os dados
  useEffect(() => {
    if (documentId) {
      fetchDistributions();
      fetchUsers();
    }
  }, [documentId]);

  // Abrir diálogo de nova distribuição
  const handleOpenDialog = () => {
    setOpenDialog(true);
    setSelectedUser('');
    setNotes('');
  };

  // Fechar diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setReturningId(null);
  };

  // Manipular envio de nova distribuição
  const handleSubmitDistribution = async () => {
    try {
      await axios.post(`/api/documents/${documentId}/distribute`, {
        user_id: selectedUser,
        notes
      });
      
      enqueueSnackbar('Documento distribuído com sucesso', { variant: 'success' });
      fetchDistributions();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao distribuir documento:', error);
      enqueueSnackbar('Erro ao distribuir documento', { variant: 'error' });
    }
  };

  // Manipular devolução de documento
  const handleReturnDocument = async (distributionId) => {
    try {
      await axios.put(`/api/documents/distributions/${distributionId}/return`, {
        return_notes: notes
      });
      
      enqueueSnackbar('Documento devolvido com sucesso', { variant: 'success' });
      fetchDistributions();
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao devolver documento:', error);
      enqueueSnackbar('Erro ao devolver documento', { variant: 'error' });
    }
  };

  // Abrir diálogo de devolução
  const handleOpenReturnDialog = (distributionId) => {
    setReturningId(distributionId);
    setNotes('');
    setOpenDialog(true);
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button
          style={{ backgroundColor: '#4caf50', color: 'white', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
          onClick={handleOpenDialog}
        >
          Distribuir Cópia
        </button>
      </div>

      <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
        <h4>Histórico de Distribuição</h4>
        <p>{distributions.length} distribuições registradas</p>
        <ul>
          {distributions.map((dist) => (
            <li key={dist.id}>
              Usuário: {dist.user_name} - Data: {formatDate(dist.created_at)}
              {dist.returned_at && (
                <span> | Devolvido em: {formatDate(dist.returned_at)}</span>
              )}
              <button style={{ marginLeft: '8px' }} onClick={() => handleOpenReturnDialog(dist.id)}>
                Devolver
              </button>
            </li>
          ))}
        </ul>
      </div>

      {openDialog && (
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', background: '#fafafa' }}>
          <h5>{returningId ? 'Devolver Documento' : 'Distribuir Cópia'}</h5>
          {!returningId && (
            <div>
              <label>Usuário:
                <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                  <option value="">Selecione</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
          <div>
            <label>Observações:
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} />
            </label>
          </div>
          <div style={{ marginTop: '8px' }}>
            <button onClick={handleCloseDialog} style={{ marginRight: '8px' }}>Cancelar</button>
            {returningId ? (
              <button onClick={() => handleReturnDocument(returningId)}>Devolver</button>
            ) : (
              <button onClick={handleSubmitDistribution} disabled={!selectedUser}>Distribuir</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentDistributions;