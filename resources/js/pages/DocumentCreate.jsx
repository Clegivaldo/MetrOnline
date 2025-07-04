import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import RevisionCreate from '../components/documents/RevisionCreate';

// Esquema de validação (apenas dados do documento)
const validationSchema = Yup.object({
  title: Yup.string().required('Título é obrigatório'),
  code: Yup.string().required('Código é obrigatório'),
  category_id: Yup.string().required('Categoria é obrigatória'),
  description: Yup.string(),
});

const DocumentCreate = ({ editingDocument, onClose, onSaved }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [createdDocumentId, setCreatedDocumentId] = useState(null);

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
      description: editingDocument.description || '',
    } : {
      title: '',
      code: '',
      category_id: '',
      description: '',
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await axios.post('/api/documents', values);
        enqueueSnackbar('Documento criado com sucesso!', { variant: 'success' });
        setCreatedDocumentId(response.data.id);
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

  return (
    <>
      {!createdDocumentId ? (
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
      ) : (
        <RevisionCreate documentId={createdDocumentId} onSaved={onSaved} onCancel={onClose} />
      )}
    </>
  );
};

export default DocumentCreate;
