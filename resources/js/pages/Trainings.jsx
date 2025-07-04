import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Search, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function Trainings() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('novo');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    planned_at: '',
    executed_at: '',
    effectiveness_evaluation: '',
    file: null
  });
  const [deleteDialog, setDeleteDialog] = useState(false);

  const filtered = trainings.filter(t => t.title?.toLowerCase().includes(search.toLowerCase()));

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelected(item);
    setForm(item ? {
      title: item.title || '',
      description: item.description || '',
      planned_at: item.planned_at ? item.planned_at.substring(0, 10) : '',
      executed_at: item.executed_at ? item.executed_at.substring(0, 10) : '',
      effectiveness_evaluation: item.effectiveness_evaluation || '',
      file: null
    } : {
      title: '', description: '', planned_at: '', executed_at: '', effectiveness_evaluation: '', file: null
    });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/trainings');
      setTrainings(response.data);
    } catch (error) {}
    setLoading(false);
  };

  useEffect(() => { fetchTrainings(); }, []);

  const handleSave = async () => {
    const data = new FormData();
    data.append('title', form.title);
    data.append('user_id', user.id);
    if (form.description) data.append('description', form.description);
    if (form.planned_at) data.append('planned_at', form.planned_at);
    if (form.executed_at) data.append('executed_at', form.executed_at);
    if (form.effectiveness_evaluation) data.append('effectiveness_evaluation', form.effectiveness_evaluation);
    if (form.file) data.append('file', form.file);
    if (modalType === 'novo') {
      await axios.post('/api/trainings', data);
    } else if (modalType === 'editar') {
      await axios.post(`/api/trainings/${selected.id}?_method=PUT`, data);
    }
    fetchTrainings();
    setModalOpen(false);
  };
  const handleDelete = async () => {
    await axios.delete(`/api/trainings/${selected.id}`);
    fetchTrainings();
    setDeleteDialog(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pessoal & Treinamentos</h1>
              <p className="text-gray-600">Gerencie o cadastro, qualificações e treinamentos do pessoal do laboratório.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openModal('novo')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Treinamento
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
                  placeholder="Buscar treinamentos..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planejado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Executado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Efetividade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arquivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8">Carregando treinamentos...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8">Nenhum treinamento encontrado.</td></tr>
                ) : filtered.map(training => (
                  <tr key={training.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{training.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{training.planned_at ? training.planned_at.substring(0, 10) : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{training.executed_at ? training.executed_at.substring(0, 10) : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{training.effectiveness_evaluation}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {training.file_path ? (
                        <a href={"/storage/" + training.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center"><FileText className="w-4 h-4 mr-1" />Arquivo</a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => openModal('visualizar', training)} className="text-blue-600 hover:text-blue-900"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openModal('editar', training)} className="text-yellow-600 hover:text-yellow-900"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { setSelected(training); setDeleteDialog(true); }} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Modal de CRUD */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalType === 'novo' ? 'Novo Treinamento' : modalType === 'editar' ? 'Editar Treinamento' : 'Detalhes do Treinamento'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Planejada</label>
                    <input
                      type="date"
                      name="planned_at"
                      value={form.planned_at}
                      onChange={e => setForm({ ...form, planned_at: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Execução</label>
                    <input
                      type="date"
                      name="executed_at"
                      value={form.executed_at}
                      onChange={e => setForm({ ...form, executed_at: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Avaliação de Efetividade</label>
                    <textarea
                      name="effectiveness_evaluation"
                      value={form.effectiveness_evaluation}
                      onChange={e => setForm({ ...form, effectiveness_evaluation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Arquivo (opcional)</label>
                    <input
                      type="file"
                      name="file"
                      onChange={e => setForm({ ...form, file: e.target.files[0] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Fechar
                  </button>
                  {modalType !== 'visualizar' && (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Salvar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal de confirmação de exclusão */}
        {deleteDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="mb-4 text-lg font-semibold">Confirmar Exclusão</div>
              <div className="mb-6">Tem certeza que deseja excluir este treinamento?</div>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setDeleteDialog(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancelar</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 