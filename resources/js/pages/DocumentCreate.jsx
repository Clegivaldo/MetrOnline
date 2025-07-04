import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import axios from 'axios';

// Esquema de validação
const validationSchema = Yup.object({
  title: Yup.string().required('Título é obrigatório'),
  code: Yup.string().required('Código é obrigatório'),
  category_id: Yup.string().required('Categoria é obrigatória'),
  status: Yup.string().required('Status é obrigatório'),
  version: Yup.string().required('Versão é obrigatória'),
  effective_date: Yup.date().required('Data de vigência é obrigatória'),
  review_date: Yup.date().min(
    Yup.ref('effective_date'),
    'Data de revisão deve ser após a vigência'
  ).required('Data de revisão é obrigatória'),
  description: Yup.string(),
  file: Yup.mixed().required('Arquivo é obrigatório')
});

const DocumentCreate = ({ editingDocument, onClose, onSaved }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);

  // Buscar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/document-categories');
        setCategories(response.data);
      } catch (error) {
        enqueueSnackbar('Erro ao carregar categorias', { variant: 'error' });
      }
    };
    fetchCategories();
  }, [enqueueSnackbar]);

  // Configuração do Formik
  const formik = useFormik({
    initialValues: editingDocument ? {
      title: editingDocument.title || '',
      code: editingDocument.code || '',
      category_id: editingDocument.category_id || '',
      status: editingDocument.status || 'draft',
      version: editingDocument.version || '1.0',
      effective_date: editingDocument.effective_date || '',
      review_date: editingDocument.review_date || '',
      description: editingDocument.description || '',
      file: null
    } : {
      title: '',
      code: '',
      category_id: '',
      status: 'draft',
      version: '1.0',
      effective_date: '',
      review_date: '',
      description: '',
      file: null
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const formData = new FormData();
        Object.keys(values).forEach(key => {
          if (values[key] !== null && values[key] !== undefined) {
            formData.append(key, values[key]);
          }
        });
        if (editingDocument) {
          formData.append('_method', 'PUT');
          await axios.post(`/api/documents/${editingDocument.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          enqueueSnackbar('Documento atualizado com sucesso!', { variant: 'success' });
        } else {
          await axios.post('/api/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          enqueueSnackbar('Documento criado com sucesso!', { variant: 'success' });
        }
        if (onSaved) onSaved();
      } catch (error) {
        enqueueSnackbar(
          error.response?.data?.message || 'Erro ao salvar documento',
          { variant: 'error' }
        );
      } finally {
        setLoading(false);
      }
    }
  });

  // Manipulador de arquivo
  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      formik.setFieldValue('file', file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Título *</label>
          <input
            type="text"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
            required
          />
          {formik.touched.title && formik.errors.title && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.title}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
          <input
            type="text"
            name="code"
            value={formik.values.code}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
            required
          />
          {formik.touched.code && formik.errors.code && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.code}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
          <select
            name="category_id"
            value={formik.values.category_id}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          {formik.touched.category_id && formik.errors.category_id && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.category_id}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
          <select
            name="status"
            value={formik.values.status}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
            required
          >
            <option value="draft">Rascunho</option>
            <option value="pending_review">Em Revisão</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Rejeitado</option>
            <option value="obsolete">Obsoleto</option>
          </select>
          {formik.touched.status && formik.errors.status && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.status}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Versão *</label>
          <input
            type="text"
            name="version"
            value={formik.values.version}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
            required
          />
          {formik.touched.version && formik.errors.version && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.version}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Vigência *</label>
          <input
            type="date"
            name="effective_date"
            value={formik.values.effective_date}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
            required
          />
          {formik.touched.effective_date && formik.errors.effective_date && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.effective_date}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Revisão *</label>
          <input
            type="date"
            name="review_date"
            value={formik.values.review_date}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
            required
          />
          {formik.touched.review_date && formik.errors.review_date && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.review_date}</div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
          <textarea
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          {formik.touched.description && formik.errors.description && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.description}</div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Arquivo do Documento *</label>
          <input
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
            type="file"
            onChange={handleFileChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {formik.touched.file && formik.errors.file && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.file}</div>
          )}
          {formik.values.file && (
            <div className="text-sm text-gray-500 mt-1">Arquivo selecionado: {formik.values.file.name}</div>
          )}
          {filePreview && (
            <div className="mt-2 text-center">
              <div className="text-xs text-gray-500 mb-1">Visualização:</div>
              <img src={filePreview} alt="Preview" className="mx-auto max-h-40" />
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {editingDocument ? 'Atualizar' : 'Criar'} Documento
        </button>
      </div>
    </form>
  );
};

export default DocumentCreate;
