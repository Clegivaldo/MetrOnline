import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const DocumentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [docRes, catRes] = await Promise.all([
          axios.get(`/api/documents/${id}`),
          axios.get('/api/document-categories')
        ]);
        setDocument(docRes.data);
        setForm({
          title: docRes.data.title || '',
          description: docRes.data.description || '',
          category_id: docRes.data.category_id || '',
          is_controlled: docRes.data.is_controlled ?? true,
          code: docRes.data.code || '',
          file: null,
        });
        setCategories(catRes.data);
      } catch (error) {
        enqueueSnackbar('Erro ao carregar dados do documento ou categorias', { variant: 'error' });
        navigate('/documents');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, navigate, enqueueSnackbar]);

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
      await axios.post(`/api/documents/${id}?_method=PUT`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      enqueueSnackbar('Documento atualizado com sucesso!', { variant: 'success' });
      navigate(`/documents/${id}`);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
        enqueueSnackbar('Verifique os campos obrigatórios e tente novamente.', { variant: 'warning' });
      } else {
        enqueueSnackbar('Erro ao atualizar documento', { variant: 'error' });
      }
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!document) {
    return <div>Documento não encontrado.</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 24 }}>
      <h2>Editar Documento</h2>
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
          {document.file_name && (
            <div style={{ marginTop: 4, fontSize: 13 }}>
              Arquivo atual: <b>{document.file_name}</b>
            </div>
          )}
          {errors.file && <div style={{ color: 'red' }}>{errors.file[0]}</div>}
        </div>
        <div style={{ marginTop: 24 }}>
          <button
            type="submit"
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
            Salvar
          </button>
          <button
            type="button"
            onClick={() => navigate(`/documents/${id}`)}
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

export default DocumentEdit;
