import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Avatar
} from '@mui/material';
import {
  Description as DocumentIcon,
  Category as CategoryIcon,
  Update as UpdateIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const DocumentOverview = ({ document, formatDate, getStatusIcon }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader 
            title="Informações do Documento"
            action={
              <Chip 
                icon={getStatusIcon(document.status)}
                label={document.status_label || document.status}
                color={
                  document.status === 'aprovado' ? 'success' : 
                  document.status === 'em_revisao' ? 'warning' :
                  document.status === 'obsoleto' ? 'error' : 'default'
                }
                variant="outlined"
              />
            }
          />
          <Divider />
          <CardContent>
            <List>
              <ListItem>
                <ListItemIcon>
                  <DocumentIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Título" 
                  secondary={document.title}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CategoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Categoria" 
                  secondary={document.category?.name || 'Não especificada'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <UpdateIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Versão" 
                  secondary={`v${document.version}`}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Data de Vigência" 
                  secondary={formatDate(document.effective_date)}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Próxima Revisão" 
                  secondary={formatDate(document.review_date)}
                />
              </ListItem>
              
              {document.description && (
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Descrição" 
                    secondary={document.description}
                    secondaryTypographyProps={{ whiteSpace: 'pre-line' }}
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardHeader title="Metadados" />
          <Divider />
          <CardContent>
            <List>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Criado por" 
                  secondary={document.creator?.name || 'Usuário não encontrado'}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Data de Criação" 
                  secondary={formatDate(document.created_at)}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Última Atualização" 
                  secondary={formatDate(document.updated_at)}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <DocumentIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Arquivo" 
                  secondary={document.file_name}
                  secondaryTypographyProps={{
                    style: {
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }
                  }}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DocumentOverview;
