import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Search } from 'lucide-react';
import axios from 'axios';

export default function Equipment() {
  const [search, setSearch] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('novo');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    identification: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    location: '',
    status: 'em_uso',
    last_calibration_at: '',
    next_calibration_at: '',
    last_maintenance_at: '',
    unique_code: '',
    certificate_id: '',
    notes: ''
  });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [certificates, setCertificates] = useState([]);

  const filtered = equipment.filter(e => e.identification?.toLowerCase().includes(search.toLowerCase()));

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelected(item);
    setForm(item ? {
      identification: item.identification || '',
      manufacturer: item.manufacturer || '',
      model: item.model || '',
      serial_number: item.serial_number || '',
      location: item.location || '',
      status: item.status || 'em_uso',
      last_calibration_at: item.last_calibration_at ? item.last_calibration_at.substring(0, 10) : '',
      next_calibration_at: item.next_calibration_at ? item.next_calibration_at.substring(0, 10) : '',
      last_maintenance_at: item.last_maintenance_at ? item.last_maintenance_at.substring(0, 10) : '',
      unique_code: item.unique_code || '',
      certificate_id: item.certificate_id || '',
      notes: item.notes || ''
    } : {
      identification: '', manufacturer: '', model: '', serial_number: '', location: '', status: 'em_uso', last_calibration_at: '', next_calibration_at: '', last_maintenance_at: '', unique_code: '', certificate_id: '', notes: ''
    });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/equipment');
      setEquipment(response.data);
    } catch (error) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipment();
    // Buscar certificados válidos
    axios.get('/api/certificates').then(res => {
      setCertificates(res.data.data || res.data);
    });
  }, []);

  const handleSave = async () => {
    const payload = { ...form };
    payload.status = form.status;
    payload.identification = form.identification;
    payload.unique_code = form.unique_code;
    if (!payload.certificate_id) delete payload.certificate_id;
    if (modalType === 'novo') {
      await axios.post('/api/equipment', payload);
    } else if (modalType === 'editar') {
      await axios.put(`/api/equipment/${selected.id}`, payload);
    }
    fetchEquipment();
    setModalOpen(false);
  };
  const handleDelete = async () => {
    await axios.delete(`/api/equipment/${selected.id}`);
    fetchEquipment();
    setDeleteDialog(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Equipamentos</h1>
              <p className="text-gray-600">Gerencie o cadastro, histórico de calibração/manutenção e status dos equipamentos.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openModal('novo')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Equipamento
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
                  placeholder="Buscar equipamentos..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identificação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fabricante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Série</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Próx. Calibração</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8">Carregando equipamentos...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8">Nenhum equipamento encontrado.</td></tr>
                ) : filtered.map(eq => (
                  <tr key={eq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{eq.identification}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{eq.manufacturer}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{eq.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{eq.serial_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{eq.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{eq.next_calibration_at ? eq.next_calibration_at.substring(0, 10) : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => openModal('visualizar', eq)} className="text-blue-600 hover:text-blue-900"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openModal('editar', eq)} className="text-yellow-600 hover:text-yellow-900"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { setSelected(eq); setDeleteDialog(true); }} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
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
                  {modalType === 'novo' ? 'Novo Equipamento' : modalType === 'editar' ? 'Editar Equipamento' : 'Detalhes do Equipamento'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Identificação *</label>
                    <input
                      type="text"
                      name="identification"
                      value={form.identification}
                      onChange={e => setForm({ ...form, identification: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fabricante</label>
                    <input
                      type="text"
                      name="manufacturer"
                      value={form.manufacturer}
                      onChange={e => setForm({ ...form, manufacturer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                    <input
                      type="text"
                      name="model"
                      value={form.model}
                      onChange={e => setForm({ ...form, model: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nº Série</label>
                    <input
                      type="text"
                      name="serial_number"
                      value={form.serial_number}
                      onChange={e => setForm({ ...form, serial_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
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
                      <option value="em_uso">Em uso</option>
                      <option value="em_calibracao">Em calibração</option>
                      <option value="em_manutencao">Em manutenção</option>
                      <option value="fora_de_servico">Fora de serviço</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Última Calibração</label>
                    <input
                      type="date"
                      name="last_calibration_at"
                      value={form.last_calibration_at}
                      onChange={e => setForm({ ...form, last_calibration_at: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Próxima Calibração</label>
                    <input
                      type="date"
                      name="next_calibration_at"
                      value={form.next_calibration_at}
                      onChange={e => setForm({ ...form, next_calibration_at: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Última Manutenção</label>
                    <input
                      type="date"
                      name="last_maintenance_at"
                      value={form.last_maintenance_at}
                      onChange={e => setForm({ ...form, last_maintenance_at: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código Único *</label>
                    <input
                      type="text"
                      name="unique_code"
                      value={form.unique_code}
                      onChange={e => setForm({ ...form, unique_code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Certificado</label>
                    <select
                      name="certificate_id"
                      value={form.certificate_id}
                      onChange={e => setForm({ ...form, certificate_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={modalType === 'visualizar'}
                    >
                      <option value="">Nenhum</option>
                      {certificates.map(cert => (
                        <option key={cert.id} value={cert.id}>{cert.certificate_number} - {cert.equipment_name}</option>
                      ))}
                    </select>
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
              <div className="mb-6">Tem certeza que deseja excluir este equipamento?</div>
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