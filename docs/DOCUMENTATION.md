# Documentação do Módulo de Gerenciamento de Documentos

## Visão Geral
O módulo de Gerenciamento de Documentos permite o armazenamento, controle de versão e distribuição de documentos em conformidade com a ISO 17025.

## Funcionalidades Principais

### 1. Gerenciamento de Documentos
- Criação e edição de documentos
- Controle de versão
- Histórico de revisões
- Categorização de documentos
- Busca e filtros avançados

### 2. Controle de Acesso
- Permissões baseadas em funções (RBAC)
- Controle de visualização e edição
- Registro de atividades

### 3. Distribuição de Documentos
- Controle de distribuição física e digital
- Confirmação de recebimento
- Notificações de atualizações

## Estrutura do Código

### Componentes Principais

#### `DocumentManagement`
Página principal que lista todos os documentos com opções de filtro e busca.

#### `DocumentDetail`
Exibe os detalhes completos de um documento, incluindo:
- Visão geral
- Histórico de revisões
- Controle de distribuição

#### `DocumentEdit`
Formulário para criação e edição de documentos.

#### `DocumentList`
Componente que exibe a lista de documentos com paginação.

### Hooks Personalizados

#### `useDocumentManagement`
Gerencia o estado e a lógica da página de gerenciamento de documentos.

#### `useDocumentForm`
Gerencia o estado e a validação do formulário de documentos.

## API

### Endpoints Principais

#### Documentos
- `GET /api/documents` - Lista de documentos
- `POST /api/documents` - Criar novo documento
- `GET /api/documents/{id}` - Obter detalhes de um documento
- `PUT /api/documents/{id}` - Atualizar documento
- `DELETE /api/documents/{id}` - Excluir documento

#### Revisões
- `GET /api/documents/{id}/revisions` - Histórico de revisões
- `POST /api/documents/{id}/revisions` - Criar nova revisão

#### Distribuição
- `GET /api/documents/{id}/distributions` - Lista de distribuições
- `POST /api/documents/{id}/distributions` - Criar nova distribuição

## Configuração

### Variáveis de Ambiente
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_APP_NAME="Sistema de Gestão de Documentos"
```

### Dependências Principais
- React 18
- Material-UI (MUI) v5
- React Router v6
- React Query
- Formik + Yup (validação de formulários)
- date-fns (manipulação de datas)

## Guia de Desenvolvimento

### Configuração do Ambiente
1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure o arquivo `.env`
4. Inicie o servidor de desenvolvimento: `npm run dev`

### Convenções de Código
- Nomes de componentes em PascalCase
- Nomes de funções em camelCase
- Nomes de constantes em UPPER_CASE
- Use TypeScript para tipagem estática
- Documente componentes com PropTypes ou TypeScript interfaces

### Testes
Execute os testes com:
```bash
npm test
```

Gere relatório de cobertura:
```bash
npm run test:coverage
```

## Implantação

### Requisitos
- Node.js 16+
- NPM 8+
- Banco de dados compatível (MySQL/PostgreSQL)

### Passos para Implantação
1. Construa a aplicação: `npm run build`
2. Configure o servidor web (Nginx/Apache)
3. Configure o serviço de fila para processamento assíncrono
4. Configure o agendador de tarefas

## Segurança
- Todas as requisições à API usam HTTPS
- Autenticação via JWT
- Proteção contra CSRF
- Sanitização de entrada
- Validação de dados do lado do servidor

## Suporte
Para suporte, entre em contato com a equipe de desenvolvimento ou abra uma issue no repositório do projeto.

## Licença
Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
