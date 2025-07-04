import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  description: Yup.string(),
  file: Yup.mixed()
});

const DocumentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filePreview, setFilePreview] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);

  // Buscar categorias e documento
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar categorias
        const categoriesResponse = await axios.get('/api/document-categories');
        setCategories(categoriesResponse.data);

        // Buscar documento
        const documentResponse = await axios.get(`/api/documents/${id}`);
        const documentData = documentResponse.data;
        
        // Preencher formulário com os dados do documento
        formik.setValues({
          title: documentData.title || '',
          code: documentData.code || '',
          category_id: documentData.category?.id || '',
          status: documentData.status || 'draft',
          version: documentData.version || '1.0',
          description: documentData.description || '',
          file: null
        });
        
        setCurrentFile(documentData.file);
        setFilePreview(documentData.file_url);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        enqueueSnackbar('Erro ao carregar os dados do documento', { variant: 'error' });
        navigate('/documents');
      }
    };

    fetchData();
  }, [id, enqueueSnackbar, navigate]);

  // Configuração do Formik
  const formik = useFormik({
    initialValues: {
      title: '',
      code: '',
      category_id: '',
      status: 'draft',
      version: '1.0',
      description: '',
      file: null
    },
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

        // Adiciona _method para suportar PUT via POST (necessário para upload de arquivos)
        formData.append('_method', 'PUT');

        const response = await axios.post(`/api/documents/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        enqueueSnackbar('Documento atualizado com sucesso!', { variant: 'success' });
        navigate(`/documents/${response.data.id}`);
      } catch (error) {
        console.error('Erro ao atualizar documento:', error);
        enqueueSnackbar(
          error.response?.data?.message || 'Erro ao atualizar documento', 
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
      
      // Criar preview do arquivo
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

  if (loading && !formik.values.title) {
    return (
      <div style={{ width: '100%' }}>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0' }}>
          <div style={{ width: '50%', height: '100%', backgroundColor: '#4caf50', animation: 'linear-progress 1.5s infinite' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ marginRight: 8 }}>&lt;</button>
        <h2 style={{ margin: 0 }}>Editar Documento</h2>
      </div>
      <form onSubmit={formik.handleSubmit}>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 2 }}>
            <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, marginBottom: 24 }}>
              <div style={{ padding: 16, borderBottom: '1px solid #e0e0e0' }}>
                <h4 style={{ margin: 0 }}>Informações do Documento</h4>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label>Título<br />
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formik.values.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={loading}
                        style={{ width: '100%' }}
                      />
                      {formik.touched.title && formik.errors.title && (
                        <span style={{ color: 'red', fontSize: 12 }}>{formik.errors.title}</span>
                      )}
                    </label>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Código<br />
                      <input
                        type="text"
                        id="code"
                        name="code"
                        value={formik.values.code}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={loading}
                        style={{ width: '100%' }}
                      />
                      {formik.touched.code && formik.errors.code && (
                        <span style={{ color: 'red', fontSize: 12 }}>{formik.errors.code}</span>
                      )}
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label>Categoria<br />
                      <select
                        id="category_id"
                        name="category_id"
                        value={formik.values.category_id}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={loading}
                        style={{ width: '100%' }}
                      >
                        <option value="">Selecione</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      {formik.touched.category_id && formik.errors.category_id && (
                        <span style={{ color: 'red', fontSize: 12 }}>{formik.errors.category_id}</span>
                      )}
                    </label>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Status<br />
                      <select
                        id="status"
                        name="status"
                        value={formik.values.status}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={loading}
                        style={{ width: '100%' }}
                      >
                        <option value="draft">Rascunho</option>
                        <option value="active">Ativo</option>
                        <option value="obsolete">Obsoleto</option>
                      </select>
                      {formik.touched.status && formik.errors.status && (
                        <span style={{ color: 'red', fontSize: 12 }}>{formik.errors.status}</span>
                      )}
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label>Versão<br />
                      <input
                        type="text"
                        id="version"
                        name="version"
                        value={formik.values.version}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={loading}
                        style={{ width: '100%' }}
                      />
                      {formik.touched.version && formik.errors.version && (
                        <span style={{ color: 'red', fontSize: 12 }}>{formik.errors.version}</span>
                      )}
                    </label>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Arquivo<br />
                      <input
                        type="file"
                        id="file"
                        name="file"
                        onChange={handleFileChange}
                        disabled={loading}
                        style={{ width: '100%' }}
                      />
                      {formik.touched.file && formik.errors.file && (
                        <span style={{ color: 'red', fontSize: 12 }}>{formik.errors.file}</span>
                      )}
                      {filePreview && (
                        <div style={{ marginTop: 8 }}>
                          <a href={filePreview} target="_blank" rel="noopener noreferrer">Visualizar arquivo atual</a>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Descrição<br />
                    <textarea
                      id="description"
                      name="description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={loading}
                      style={{ width: '100%', minHeight: 60 }}
                    />
                    {formik.touched.description && formik.errors.description && (
                      <span style={{ color: 'red', fontSize: 12 }}>{formik.errors.description}</span>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button
            type="submit"
            style={{ backgroundColor: '#4caf50', color: 'white', padding: '8px 24px', borderRadius: 4, border: 'none', cursor: 'pointer' }}
            disabled={loading}
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentEdit;
