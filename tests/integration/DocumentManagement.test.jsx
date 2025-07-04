import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import DocumentManagement from '../../resources/js/pages/DocumentManagement';

// Configuração do servidor MSW para simular chamadas à API
const server = setupServer(
  rest.get('/api/documents', (req, res, ctx) => {
    return res(
      ctx.json({
        data: [
          {
            id: 1,
            title: 'Documento de Teste',
            code: 'DOC-001',
            category: { id: 1, name: 'Categoria Teste' },
            status: 'aprovado',
            version: '1.0',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
          }
        ],
        total: 1
      })
    );
  }),
  
  rest.get('/api/document-categories', (req, res, ctx) => {
    return res(
      ctx.json([
        { id: 1, name: 'Categoria Teste' },
        { id: 2, name: 'Outra Categoria' }
      ])
    );
  })
);

// Habilita a simulação de API antes dos testes
beforeAll(() => server.listen());
// Reseta qualquer requisição que possa ter sido feita durante os testes
afterEach(() => server.resetHandlers());
// Limpa todos os mocks após os testes
afterAll(() => server.close());

describe('DocumentManagement Integration', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderComponent = () => {
    
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/documents']}>
          <Routes>
            <Route path="/documents" element={<DocumentManagement />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('deve carregar e exibir a lista de documentos', async () => {
    renderComponent();
    
    // Verifica se o título da página está visível
    expect(screen.getByText('Gestão de Documentos')).toBeInTheDocument();
    
    // Aguarda o carregamento dos dados
    await waitFor(() => {
      expect(screen.getByText('Documento de Teste')).toBeInTheDocument();
      expect(screen.getByText('DOC-001')).toBeInTheDocument();
      expect(screen.getByText('Categoria Teste')).toBeInTheDocument();
    });
  });

  it('deve permitir a busca de documentos', async () => {
    renderComponent();
    
    // Simula a digitação no campo de busca
    const searchInput = screen.getByPlaceholderText('Buscar documentos...');
    fireEvent.change(searchInput, { target: { value: 'teste' } });
    
    // Aqui você poderia verificar se a função de busca foi chamada com o valor correto
    // Isso dependeria de como o componente DocumentManagement implementa a busca
  });

  it('deve exibir mensagem quando não houver documentos', async () => {
    // Sobrescreve o handler para retornar uma lista vazia
    server.use(
      rest.get('/api/documents', (req, res, ctx) => {
        return res(
          ctx.json({
            data: [],
            total: 0
          })
        );
      })
    );
    
    renderComponent();
    
    // Aguarda o carregamento dos dados
    await waitFor(() => {
      expect(screen.getByText('Nenhum documento encontrado')).toBeInTheDocument();
    });
  });

  it('deve lidar com erros ao carregar documentos', async () => {
    // Sobrescreve o handler para retornar um erro
    server.use(
      rest.get('/api/documents', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ message: 'Erro ao carregar documentos' })
        );
      })
    );
    
    renderComponent();
    
    // Verifica se a mensagem de erro é exibida
    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar documentos')).toBeInTheDocument();
    });
  });
});
