import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { useSnackbar } from 'notistack';
import axios from 'axios';
// 1. Remover import DocumentList from '../components/documents/DocumentList';
import DocumentCreate from './DocumentCreate';

const DocumentManagement = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  // Estados
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  // Modal categoria
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [savingCategory, setSavingCategory] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  
  // Buscar documentos
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        per_page: rowsPerPage,
        search: searchTerm,
        category_id: selectedCategory || undefined,
        status: selectedStatus || undefined
      };
      
      const response = await axios.get('/api/documents', { params });
      
      // Se a resposta for paginada
      if (response.data.data) {
        setDocuments(response.data.data);
        setTotalRows(response.data.total || response.data.data.length);
      } else {
        setDocuments(response.data);
        setTotalRows(response.data.length);
      }
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      enqueueSnackbar('Erro ao carregar documentos', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, selectedCategory, selectedStatus, enqueueSnackbar]);
  
  // Buscar categorias
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('/api/document-categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      enqueueSnackbar('Erro ao carregar categorias', { variant: 'error' });
    }
  }, [enqueueSnackbar]);
  
  // Efeitos
  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, [fetchDocuments, fetchCategories]);
  
  // Manipuladores de eventos
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPage(0);
  };
  
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setPage(0);
  };
  
  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value);
    setPage(0);
  };
  
  const handleViewDocument = (document) => {
    navigate(`/documents/${document.id}`);
  };
  
  const handleEditDocument = (document) => {
    setEditingDocument(document);
    setShowDocumentModal(true);
  };
  
  const handleDeleteDocument = async (document) => {
    if (window.confirm(`Tem certeza que deseja excluir o documento "${document.title}"?`)) {
      try {
        await axios.delete(`/api/documents/${document.id}`);
        enqueueSnackbar('Documento excluído com sucesso!', { variant: 'success' });
        fetchDocuments(); // Recarregar a lista
      } catch (error) {
        console.error('Erro ao excluir documento:', error);
        enqueueSnackbar(
          error.response?.data?.message || 'Erro ao excluir documento', 
          { variant: 'error' }
        );
      }
    }
  };
  
  const handleCreateDocument = () => {
    setEditingDocument(null);
    setShowDocumentModal(true);
  };
  
  // Modal categoria
  const openCategoryModal = () => setCategoryModalOpen(true);
  const closeCategoryModal = () => { setCategoryModalOpen(false); setNewCategory({ name: '' }); };
  const handleCategoryInput = (e) => setNewCategory({ ...newCategory, [e.target.name]: e.target.value });
  const handleSaveCategory = async () => {
    if (!newCategory.name) {
      enqueueSnackbar('Preencha o nome da categoria', { variant: 'warning' });
      return;
    }
    setSavingCategory(true);
    try {
      await axios.post('/api/document-categories', { name: newCategory.name });
      enqueueSnackbar('Categoria criada com sucesso!', { variant: 'success' });
      fetchCategories();
      closeCategoryModal();
    } catch (error) {
      enqueueSnackbar('Erro ao criar categoria', { variant: 'error' });
    } finally {
      setSavingCategory(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Documentos</h1>
              <p className="text-gray-600">Gerencie os documentos do sistema, incluindo manuais, procedimentos e registros.</p>
            </div>
            <div className="flex gap-2">
              <button
          onClick={handleCreateDocument}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base"
        >
                <Plus className="w-4 h-4 mr-2" />
          Novo Documento
              </button>
              <button
                onClick={() => setCategoryModalOpen(true)}
                className="flex items-center px-4 py-2 border-2 border-purple-500 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors font-semibold text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </button>
            </div>
          </div>
        </div>
        {/* Filtros e busca */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas as categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os status</option>
                <option value="rascunho">Rascunho</option>
                <option value="em_revisao">Em Revisão</option>
                <option value="aprovado">Aprovado</option>
                <option value="obsoleto">Obsoleto</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {documents.length} documento(s) encontrado(s)
              </span>
            </div>
          </div>
        </div>
        {/* Lista de documentos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabela de documentos */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Carregando documentos...
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Nenhum documento encontrado.
                    </td>
                  </tr>
                ) : (
                  documents.map((document) => (
                    <tr key={document.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {document.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {categories.find(cat => cat.id === document.category_id)?.name || 'Desconhecida'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {document.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDocument(document)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Ver"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditDocument(document)}
                          className="text-purple-600 hover:text-purple-900 mr-3"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(document)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(null, page - 1)}
                disabled={page === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(null, page + 1)}
                disabled={page >= Math.ceil(totalRows / rowsPerPage) - 1}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Próxima
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <span className="text-sm text-gray-700">
                  Página <span className="font-semibold">{page + 1}</span> de <span className="font-semibold">{Math.ceil(totalRows / rowsPerPage)}</span>
                </span>
                <span className="relative z-0 inline-flex shadow-sm rounded-md">
                  <button
                    onClick={() => handlePageChange(null, page - 1)}
                    disabled={page === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Anterior</span>
                    ‹
                  </button>
                  <button
                    onClick={() => handlePageChange(null, page + 1)}
                    disabled={page >= Math.ceil(totalRows / rowsPerPage) - 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Próxima</span>
                    ›
                  </button>
                </span>
              </div>
              <div className="flex items-center">
                <select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm leading-5 font-medium text-gray-700"
                >
                  <option value="10">10 por página</option>
                  <option value="20">20 por página</option>
                  <option value="50">50 por página</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        {showDocumentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingDocument ? 'Editar Documento' : 'Novo Documento'}
                </h2>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <DocumentCreate
                editingDocument={editingDocument}
                onClose={() => setShowDocumentModal(false)}
                onSaved={() => { setShowDocumentModal(false); fetchDocuments(); }}
              />
            </div>
          </div>
        )}
        {/* Modal Nova Categoria */}
        {categoryModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Nova Categoria</h2>
                <button onClick={closeCategoryModal} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <form onSubmit={e => { e.preventDefault(); handleSaveCategory(); }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Categoria *</label>
                <input
                  type="text"
                  name="name"
                  value={newCategory.name}
                  onChange={handleCategoryInput}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                  required
                />
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={closeCategoryModal} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" disabled={savingCategory}>
                    {savingCategory ? 'Salvando...' : 'Salvar'}
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

export default DocumentManagement;
