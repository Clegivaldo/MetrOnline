import React from 'react';


const DocumentOverview = ({ document, formatDate, getStatusIcon }) => {
  return (
    <div className="document-overview" style={{ display: 'flex', gap: 24 }}>
      <div style={{ flex: 2 }}>
        <div className="card" style={{ border: '1px solid #ccc', borderRadius: 8, marginBottom: 16 }}>
          <div className="card-header" style={{ padding: 16, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>Informações do Documento</span>
            <span style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid #aaa', background: '#f5f5f5', fontSize: 12 }}>
              {getStatusIcon(document.status)} {document.status_label || document.status}
            </span>
          </div>
          <div className="card-content" style={{ padding: 16 }}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><b>Título:</b> {document.title}</li>
              <li><b>Categoria:</b> {document.category?.name || 'Não especificada'}</li>
              <li><b>Versão:</b> v{document.version}</li>
              <li><b>Data de Vigência:</b> {formatDate(document.effective_date)}</li>
              <li><b>Próxima Revisão:</b> {formatDate(document.review_date)}</li>
              {document.description && (
                <li><b>Descrição:</b> <span style={{ whiteSpace: 'pre-line' }}>{document.description}</span></li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div className="card" style={{ border: '1px solid #ccc', borderRadius: 8 }}>
          <div className="card-header" style={{ padding: 16, borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 'bold' }}>Metadados</span>
          </div>
          <div className="card-content" style={{ padding: 16 }}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><b>Criado por:</b> {document.creator?.name || 'Usuário não encontrado'}</li>
              <li><b>Data de Criação:</b> {formatDate(document.created_at)}</li>
              <li><b>Última Atualização:</b> {formatDate(document.updated_at)}</li>
              <li><b>Arquivo:</b> <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: 200 }}>{document.file_name}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentOverview;
