import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const statusOptions = [
  { value: 'planejada', label: 'Planejada' },
  { value: 'em_execucao', label: 'Em execução' },
  { value: 'concluida', label: 'Concluída' },
];

export default function InternalAudits() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('novo');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    planned_at: '',
    executed_at: '',
    status: 'planejada',
    findings: '',
    actions: '',
    effectiveness_verification: '',
    notes: ''
  });
  const [deleteDialog, setDeleteDialog] = useState(false);

  const filtered = audits.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()));

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelected(item);
    setForm(item ? {
      title: item.title || '',
      description: item.description || '',
      planned_at: item.planned_at ? item.planned_at.substring(0, 10) : '',
      executed_at: item.executed_at ? item.executed_at.substring(0, 10) : '',
      status: item.status || 'planejada',
      findings: item.findings || '',
      actions: item.actions || '',
      effectiveness_verification: item.effectiveness_verification || '',
      notes: item.notes || ''
    } : {
      title: '', description: '', planned_at: '', executed_at: '', status: 'planejada', findings: '', actions: '', effectiveness_verification: '', notes: ''
    });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const fetchAudits = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/internal-audits');
      setAudits(response.data);
    } catch (error) {}
    setLoading(false);
  };

  useEffect(() => { fetchAudits(); }, []);

  const handleSave = async () => {
    const payload = { ...form };
    if (user) payload.auditor_id = user.id;
    if (modalType === 'novo') {
      await axios.post('/api/internal-audits', payload);
    } else if (modalType === 'editar') {
      await axios.put(`/api/internal-audits/${selected.id}`, payload);
    }
    fetchAudits();
    setModalOpen(false);
  };
  const handleDelete = async () => {
    await axios.delete(`/api/internal-audits/${selected.id}`);
    fetchAudits();
    setDeleteDialog(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Auditorias Internas</h1>
              <p className="text-gray-600">Planeje, execute, registre e acompanhe auditorias internas do laboratório.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openModal('novo')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Auditoria
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
                  placeholder="Buscar auditorias..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planejada</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Executada</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8">Carregando auditorias...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8">Nenhuma auditoria encontrada.</td></tr>
                ) : filtered.map(audit => (
                  <tr key={audit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{audit.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{audit.planned_at ? audit.planned_at.substring(0, 10) : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{audit.executed_at ? audit.executed_at.substring(0, 10) : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{audit.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => openModal('visualizar', audit)} className="text-blue-600 hover:text-blue-900"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openModal('editar', audit)} className="text-yellow-600 hover:text-yellow-900"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { setSelected(audit); setDeleteDialog(true); }} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
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
                  {modalType === 'novo' ? 'Nova Auditoria' : modalType === 'editar' ? 'Editar Auditoria' : 'Detalhes da Auditoria'}
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
                      rows={2}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                      required
                    >
                      {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Constatações</label>
                    <textarea
                      name="findings"
                      value={form.findings}
                      onChange={e => setForm({ ...form, findings: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ações</label>
                    <textarea
                      name="actions"
                      value={form.actions}
                      onChange={e => setForm({ ...form, actions: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verificação de Efetividade</label>
                    <textarea
                      name="effectiveness_verification"
                      value={form.effectiveness_verification}
                      onChange={e => setForm({ ...form, effectiveness_verification: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                      rows={2}
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
              <div className="mb-6">Tem certeza que deseja excluir esta auditoria?</div>
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