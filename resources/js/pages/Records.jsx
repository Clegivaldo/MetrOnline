import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Search } from 'lucide-react';
import axios from 'axios';

export default function Records() {
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('novo');
  const [selected, setSelected] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [form, setForm] = useState({
    type: '',
    title: '',
    description: '',
    file: null,
    related_equipment_id: '',
    related_certificate_id: ''
  });
  const [deleteDialog, setDeleteDialog] = useState(false);

  const filtered = records.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/records');
      setRecords(response.data);
    } finally {
      setLoading(false);
    }
  };
  const fetchEquipments = async () => {
    try {
      const response = await axios.get('/api/equipment');
      setEquipments(response.data);
    } catch {}
  };
  const fetchCertificates = async () => {
    try {
      const response = await axios.get('/api/certificates');
      setCertificates(response.data.data || response.data);
    } catch {}
  };

  useEffect(() => { fetchRecords(); fetchEquipments(); fetchCertificates(); }, []);

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelected(item);
    setForm(item ? {
      type: item.type || '',
      title: item.title || '',
      description: item.description || '',
      file: null,
      related_equipment_id: item.related_equipment_id || '',
      related_certificate_id: item.related_certificate_id || ''
    } : {
      type: '',
      title: '',
      description: '',
      file: null,
      related_equipment_id: '',
      related_certificate_id: ''
    });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  const handleSave = async () => {
    const data = new FormData();
    data.append('type', form.type);
    data.append('title', form.title);
    if (form.description) data.append('description', form.description);
    if (form.related_equipment_id) data.append('related_equipment_id', form.related_equipment_id);
    if (form.related_certificate_id) data.append('related_certificate_id', form.related_certificate_id);
    data.append('file', form.file);
    if (modalType === 'novo') {
      await axios.post('/api/records', data);
    } else if (modalType === 'editar') {
      await axios.post(`/api/records/${selected.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }, params: { _method: 'PUT' } });
    }
    fetchRecords();
    setModalOpen(false);
  };
  const handleDelete = async () => {
    await axios.delete(`/api/records/${selected.id}`);
    fetchRecords();
    setDeleteDialog(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Registros Técnicos</h1>
              <p className="text-gray-600">Gerencie os registros técnicos do laboratório, como dados brutos, resultados e relatórios.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openModal('novo')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Registro
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
                  placeholder="Buscar registros..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8">Carregando registros...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8">Nenhum registro encontrado.</td></tr>
                ) : filtered.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{record.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.related_equipment_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{record.related_certificate_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => openModal('visualizar', record)} className="text-blue-600 hover:text-blue-900"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openModal('editar', record)} className="text-yellow-600 hover:text-yellow-900"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { setSelected(record); setDeleteDialog(true); }} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
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
                  {modalType === 'novo' ? 'Novo Registro' : modalType === 'editar' ? 'Editar Registro' : 'Detalhes do Registro'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                      required
                    >
                      <option value="">Selecione</option>
                      <option value="dados_brutos">Dados Brutos</option>
                      <option value="resultado_calibracao">Resultado de Calibração</option>
                      <option value="certificado">Certificado</option>
                      <option value="relatorio">Relatório</option>
                    </select>
                  </div>
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Arquivo *</label>
                    <input
                      type="file"
                      name="file"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                      required={modalType === 'novo'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Equipamento Relacionado</label>
                    <select
                      name="related_equipment_id"
                      value={form.related_equipment_id}
                      onChange={e => setForm({ ...form, related_equipment_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                    >
                      <option value="">Nenhum</option>
                      {equipments.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.identification}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certificado Relacionado</label>
                    <select
                      name="related_certificate_id"
                      value={form.related_certificate_id}
                      onChange={e => setForm({ ...form, related_certificate_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                    >
                      <option value="">Nenhum</option>
                      {certificates.map(cert => (
                        <option key={cert.id} value={cert.id}>{cert.certificate_number || cert.id}</option>
                      ))}
                    </select>
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
              <div className="mb-6">Tem certeza que deseja excluir este registro?</div>
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