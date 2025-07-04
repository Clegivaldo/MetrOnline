import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const DocumentList = ({ 
  documents, 
  loading, 
  onDeleteClick, 
  onPageChange, 
  onRowsPerPageChange, 
  page, 
  rowsPerPage, 
  totalRows,
  onSearchChange,
  searchTerm,
  categories,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event, document) => {
    setSelectedDocument(document);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDocument(null);
  };

  const handleEdit = () => {
    if (selectedDocument) {
      navigate(`/documents/${selectedDocument.id}/edit`);
    }
    handleMenuClose();
  };

  const handleView = () => {
    if (selectedDocument) {
      navigate(`/documents/${selectedDocument.id}`);
    }
    handleMenuClose();
  };

  const handleDownload = () => {
    if (selectedDocument) {
      // Lógica de download será implementada no componente pai
      handleMenuClose();
    }
  };

  const handleDelete = () => {
    if (selectedDocument && onDeleteClick) {
      onDeleteClick(selectedDocument);
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprovado':
        return 'success';
      case 'em_revisao':
        return 'warning';
      case 'rascunho':
        return 'default';
      case 'obsoleto':
        return 'error';
      default:
        return 'default';
    }
  };

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

  return (
    <div>
      <div>
        <div>
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div>
          <select
            value={selectedCategory || ''}
            onChange={onCategoryChange}
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <select
            value={selectedStatus || ''}
            onChange={onStatusChange}
          >
            <option value="">Todos os status</option>
            <option value="rascunho">Rascunho</option>
            <option value="em_revisao">Em Revisão</option>
            <option value="aprovado">Aprovado</option>
            <option value="obsoleto">Obsoleto</option>
          </select>
        </div>
      </div>
      
      <div>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Título</th>
              <th>Categoria</th>
              <th>Versão</th>
              <th>Status</th>
              <th>Data de Criação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} align="center" style={{ padding: '16px' }}>
                  Carregando...
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={7} align="center" style={{ padding: '16px' }}>
                  Nenhum documento encontrado.
                </td>
              </tr>
            ) : (
              documents.map((document) => (
                <tr key={document.id} style={{ cursor: 'pointer' }}>
                  <td>{document.code}</td>
                  <td>
                    <span style={{ fontWeight: 'bold' }}>
                      {document.title}
                    </span>
                  </td>
                  <td>
                    {document.category?.name || '-'}
                  </td>
                  <td>v{document.version}</td>
                  <td>
                    <span style={{ 
                      backgroundColor: getStatusColor(document.status),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}>
                      {document.status_label || document.status}
                    </span>
                  </td>
                  <td>{formatDate(document.created_at)}</td>
                  <td align="right">
                    <button 
                      style={{ 
                        backgroundColor: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      onClick={(e) => handleMenuOpen(e, document)}
                    >
                      •••
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <div>
          Linhas por página:
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        <div>
          {totalRows !== -1 ? `${totalRows} total` : ''}
        </div>
        <div>
          {page + 1} de {totalRows !== -1 ? Math.ceil(totalRows / rowsPerPage) : '...'}
        </div>
        <button onClick={() => onPageChange(page - 1)} disabled={page === 0}>Anterior</button>
        <button onClick={() => onPageChange(page + 1)} disabled={totalRows === -1 || page >= Math.ceil(totalRows / rowsPerPage) - 1}>Próxima</button>
      </div>

      {/* Menu de ações */}
      {menuOpen && (
        <div 
          style={{
            position: 'absolute',
            top: `${anchorEl.getBoundingClientRect().bottom + 5}px`,
            right: `${window.innerWidth - anchorEl.getBoundingClientRect().right - 5}px`,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
          }}
        >
          <div 
            style={{ padding: '8px 12px', cursor: 'pointer' }}
            onClick={handleView}
          >
            👁️ Visualizar
          </div>
          <div 
            style={{ padding: '8px 12px', cursor: 'pointer' }}
            onClick={handleEdit}
          >
            ✏️ Editar
          </div>
          <div 
            style={{ padding: '8px 12px', cursor: 'pointer' }}
            onClick={handleDownload}
          >
            ⬇️ Baixar
          </div>
          <hr style={{ margin: '8px 0' }} />
          <div 
            style={{ padding: '8px 12px', cursor: 'pointer', color: 'red' }}
            onClick={handleDelete}
          >
            🗑️ Excluir
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
