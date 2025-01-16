import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  AttachFile as AttachFileIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/v1/project/student/getProject/${id}`);
        
        if (response.data.success) {
          setProject(response.data.data);
        } else {
          setError('Proje bilgileri alınamadı');
        }
      } catch (err) {
        setError('Proje yüklenirken bir hata oluştu');
        console.error('Proje detay hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetail();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          {project?.name}
        </Typography>
        <Chip 
          label={project?.category?.name} 
          sx={{ 
            bgcolor: 'white', 
            color: 'primary.main',
            fontWeight: 'bold'
          }} 
        />
      </Paper>

      <Grid container spacing={3}>
        {/* Proje Detayları */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Proje Detayları
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DescriptionIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="subtitle1" color="primary.main" gutterBottom>
                        Proje Açıklaması
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body1">
                        {project?.description}
                      </Typography>
                    }
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CategoryIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Kategori"
                    secondary={project?.category?.name}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Oluşturulma Tarihi"
                    secondary={new Date(project?.createDate).toLocaleDateString('tr-TR')}
                  />
                </ListItem>

                {project?.projectFile && (
                  <ListItem>
                    <ListItemIcon>
                      <AttachFileIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Proje Dosyası"
                      secondary={
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AttachFileIcon />}
                          onClick={() => window.open(project.projectFile, '_blank')}
                          sx={{ mt: 1 }}
                        >
                          Dosyayı Görüntüle
                        </Button>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Proje Üyeleri */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Proje Üyeleri
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <List>
                {project?.students?.map((student) => (
                  <Paper
                    key={student.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      mb: 2,
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom color="primary.main">
                      {student.username}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SchoolIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {student.studentNumber}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {student.department}
                    </Typography>
                  </Paper>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectDetail;