import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const validationSchema = Yup.object({
  version: Yup.string().required('Versão é obrigatória'),
  revision_date: Yup.date().required('Data da revisão é obrigatória'),
  file: Yup.mixed().required('Arquivo PDF é obrigatório'),
  observations: Yup.string(),
});

const RevisionCreate = ({ documentId, onSaved, onCancel }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      version: '',
      revision_date: '',
      file: null,
      observations: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if (values[key] !== null && values[key] !== undefined) {
            formData.append(key, values[key]);
          }
        });
        formData.append('status', 'vigente');
        await axios.post(`/api/documents/${documentId}/revisions`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        enqueueSnackbar('Revisão cadastrada com sucesso!', { variant: 'success' });
        if (onSaved) onSaved();
      } catch (error) {
        enqueueSnackbar(
          error.response?.data?.message || 'Erro ao cadastrar revisão',
          { variant: 'error' }
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Data da Revisão *</label>
          <input
            type="date"
            name="revision_date"
            value={formik.values.revision_date}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
            required
          />
          {formik.touched.revision_date && formik.errors.revision_date && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.revision_date}</div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Arquivo PDF *</label>
          <input
            accept=".pdf"
            type="file"
            name="file"
            onChange={(e) => formik.setFieldValue('file', e.currentTarget.files[0])}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {formik.touched.file && formik.errors.file && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.file}</div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
          <textarea
            name="observations"
            value={formik.values.observations}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          {formik.touched.observations && formik.errors.observations && (
            <div className="text-red-500 text-xs mt-1">{formik.errors.observations}</div>
          )}
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          Salvar Revisão
        </button>
      </div>
    </form>
  );
};

export default RevisionCreate;
