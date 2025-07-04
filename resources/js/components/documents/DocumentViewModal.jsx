import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DocumentViewModal = ({ id, onClose }) => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocument() {
      try {
        setLoading(true);
        const res = await axios.get(`/api/documents/${id}`);
        setDocument(res.data);
      } catch {
        setDocument(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchDocument();
  }, [id]);

  const handleDownload = async () => {
    try {
      const response = await axios.get(`/api/documents/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Erro ao baixar PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">Carregando...</div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center p-8">
        <h2 className="text-xl font-bold mb-4">Documento não encontrado.</h2>
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Fechar</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Informações do Documento</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
      </div>
      <div className="space-y-2 mb-6">
        <div><span className="font-semibold">Título:</span> {document.title}</div>
        <div><span className="font-semibold">Categoria:</span> {document.category_name || '-'}</div>
        <div><span className="font-semibold">Versão:</span> {document.version || '-'}</div>
        <div><span className="font-semibold">Criado por:</span> {document.created_by_name || '-'}</div>
        <div><span className="font-semibold">Data de Criação:</span> {document.created_at ? new Date(document.created_at).toLocaleString('pt-BR') : '-'}</div>
        <div><span className="font-semibold">Última Atualização:</span> {document.updated_at ? new Date(document.updated_at).toLocaleString('pt-BR') : '-'}</div>
        <div><span className="font-semibold">Arquivo:</span> {document.file_name ? (
          <>
            <span className="mr-2">{document.file_name}</span>
            <button onClick={() => window.open(`/storage/${document.file_path}`, '_blank')} className="px-2 py-1 text-blue-600 underline">Visualizar</button>
            <button onClick={handleDownload} className="ml-2 px-2 py-1 text-green-700 underline">Baixar</button>
          </>
        ) : (
          <span className="text-red-600">Nenhum arquivo PDF disponível</span>
        )}
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Fechar</button>
      </div>
    </div>
  );
};

export default DocumentViewModal;
