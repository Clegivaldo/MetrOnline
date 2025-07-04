import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const DocumentCreate = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category_id: '',
    is_controlled: true,
    code: '',
    file: null,
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await axios.get('/api/document-categories');
        setCategories(res.data);
      } catch (error) {
        enqueueSnackbar('Erro ao carregar categorias', { variant: 'error' });
      }
    }
    fetchCategories();
  }, [enqueueSnackbar]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({
      ...prev,
      file: e.target.files[0] || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('category_id', form.category_id);
      formData.append('is_controlled', form.is_controlled ? 1 : 0);
      formData.append('code', form.code);
      if (form.file) {
        formData.append('file', form.file);
      }
      await axios.post('/api/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      enqueueSnackbar('Documento criado com sucesso!', { variant: 'success' });
      navigate('/documents');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
        enqueueSnackbar('Verifique os campos obrigatórios e tente novamente.', { variant: 'warning' });
      } else {
        enqueueSnackbar('Erro ao criar documento', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 24 }}>
      <h2>Novo Documento</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div style={{ marginBottom: 12 }}>
          <label>Título *</label><br />
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            style={{ width: '100%', padding: 8 }}
          />
          {errors.title && <div style={{ color: 'red' }}>{errors.title[0]}</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Descrição</label><br />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            style={{ width: '100%', padding: 8 }}
          />
          {errors.description && <div style={{ color: 'red' }}>{errors.description[0]}</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Categoria *</label><br />
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            style={{ width: '100%', padding: 8 }}
          >
            <option value="">Selecione</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.category_id && <div style={{ color: 'red' }}>{errors.category_id[0]}</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Código *</label><br />
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            style={{ width: '100%', padding: 8 }}
          />
          {errors.code && <div style={{ color: 'red' }}>{errors.code[0]}</div>}
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            <input
              type="checkbox"
              name="is_controlled"
              checked={form.is_controlled}
              onChange={handleChange}
            />
            Documento Controlado
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Arquivo PDF (máx. 10MB)</label><br />
          <input
            type="file"
            name="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          {errors.file && <div style={{ color: 'red' }}>{errors.file[0]}</div>}
        </div>
        <div style={{ marginTop: 24 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#4caf50',
              color: 'white',
              padding: '10px 24px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold',
              marginRight: 8
            }}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/documents')}
            style={{
              backgroundColor: '#bbb',
              color: 'white',
              padding: '10px 24px',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentCreate;
