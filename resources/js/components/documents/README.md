# Módulo de Gerenciamento de Documentos

Este módulo fornece funcionalidades completas para o gerenciamento de documentos em conformidade com a ISO 17025.

## Componentes

### DocumentList
Exibe uma lista paginada de documentos com opções de filtro e busca.

**Props:**
- `documents`: Array de documentos a serem exibidos
- `loading`: Estado de carregamento
- `page`: Página atual
- `rowsPerPage`: Itens por página
- `totalRows`: Total de itens
- `onPageChange`: Função chamada ao mudar a página
- `onRowsPerPageChange`: Função chamada ao alterar itens por página
- `onSearchChange`: Função chamada ao buscar
- `onViewClick`: Função chamada ao visualizar um documento
- `onEditClick`: Função chamada ao editar um documento
- `onDeleteClick`: Função chamada ao excluir um documento

### DocumentDetail
Exibe os detalhes completos de um documento.

**Props:**
- `document`: Documento a ser exibido
- `onBack`: Função chamada ao voltar
- `onEdit`: Função chamada ao editar
- `onDelete`: Função chamada ao excluir

### DocumentEdit
Formulário para criação/edição de documentos.

**Props:**
- `document`: Documento a ser editado (opcional)
- `onSubmit`: Função chamada ao enviar o formulário
- `onCancel`: Função chamada ao cancelar
- `categories`: Lista de categorias disponíveis

## Hooks

### useDocumentManagement
Gerencia o estado da lista de documentos.

**Retorna:**
- `documents`: Lista de documentos
- `loading`: Estado de carregamento
- `error`: Erro, se houver
- `pagination`: Dados de paginação
- `filters`: Filtros ativos
- `handleSearch`: Manipulador de busca
- `handleFilterChange`: Manipulador de filtros
- `handlePageChange`: Manipulador de mudança de página

### useDocumentForm
Gerencia o estado do formulário de documentos.

**Retorna:**
- `formData`: Dados do formulário
- `errors`: Erros de validação
- `handleChange`: Manipulador de mudança
- `handleSubmit`: Manipulador de envio
- `handleFileChange`: Manipulador de arquivo
- `resetForm`: Reseta o formulário

## Estilos

### Tema
O módulo usa o tema padrão do Material-UI com as seguintes personalizações:

```javascript
{
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    // ... outras personalizações
  },
}
```

## Testes

### Testes Unitários
Os testes unitários cobrem:
- Renderização dos componentes
- Interações do usuário
- Lógica de negócios
- Manipulação de estado

Para executar os testes:
```bash
npm test
```

### Testes de Integração
Os testes de integração cobrem:
- Fluxos completos do usuário
- Integração com a API
- Gerenciamento de estado global

Para executar os testes de integração:
```bash
npm run test:integration
```

## Melhorias Futuras
- Suporte a upload de múltiplos arquivos
- Visualizador de documentos integrado
- Assinatura digital
- Notificações em tempo real
- Exportação para PDF/Excel
- Suporte a metadados personalizados

## Contribuição
1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request
