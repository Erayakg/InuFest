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
  Paper,
  Avatar,
  Stack,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
  AttachFile as AttachFileIcon,
  School as SchoolIcon,
  PictureAsPdf as PdfIcon,
  Event as EventIcon,
  Person as PersonIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

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

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios({
        method: 'GET',
        url: `/v1/project/${id}/downloadt`,
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });

      if (response.status === 204) {
        throw new Error('Dosya bulunamadı');
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `proje-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: 'Dosya başarıyla indirildi',
        severity: 'success'
      });
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      setSnackbar({
        open: true,
        message: error.message === 'Dosya bulunamadı' 
          ? 'Dosya bulunamadı' 
          : 'Dosya indirilirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setDownloadLoading(false);
    }
  };

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
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          {project?.name}
        </Typography>
       
      </Paper>

      <Grid container spacing={3}>
        {/* Ana Bilgiler Kartı */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                  {project?.name}
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {/* Kategori */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Kategori
                      </Typography>
                      <Typography variant="body1">
                        {project?.category?.name}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Mentör */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Proje Mentörü
                      </Typography>
                      <Typography variant="body1">
                        {project?.referee || 'Atanmamış'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Oluşturulma Tarihi */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Oluşturulma Tarihi
                      </Typography>
                      <Typography variant="body1">
                        {new Date(project?.createDate).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

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
                          variant="contained"
                          color="primary"
                          startIcon={downloadLoading ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
                          onClick={handleDownload}
                          disabled={downloadLoading}
                          sx={{ mt: 1 }}
                        >
                          {downloadLoading ? 'İndiriliyor...' : 'Dosyayı İndir'}
                        </Button>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Proje Üyeleri ve Mentör Kartı */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon color="primary" />
                Proje Ekibi
              </Typography>
              
              {/* Mentör Bilgisi */}
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Mentör
                </Typography>
                {project?.referee ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                    <Avatar>
                      {project.referee?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1">
                        {project.referee}
                      </Typography>
                      {project.referee.department && (
                        <Typography variant="caption" color="textSecondary">
                          {project.referee.department}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body1" color="textSecondary">
                    Henüz mentör atanmamış
                  </Typography>
                )}
              </Box>

              {/* Öğrenci Listesi */}
              <Typography variant="subtitle2" color="primary" gutterBottom>
                <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Öğrenciler
              </Typography>
              <Stack spacing={2}>
                {project?.students && project.students.length > 0 ? (
                  project.students.map((student) => (
                    <Box key={student.id || Math.random()} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {student.name && student.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">
                          {student.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {student.username}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {student.studentNumber}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography color="textSecondary">
                    Projede öğrenci bulunmamaktadır
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Proje Dosyası İndirme Kartı */}
        <Grid item xs={12}>
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PdfIcon color="primary" fontSize="large" />
                <Typography variant="h6" sx={{ flex: 1 }}>
                  Proje Dosyası
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={downloadLoading ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
                  onClick={handleDownload}
                  disabled={downloadLoading}
                  size="large"
                >
                  {downloadLoading ? 'İndiriliyor...' : 'Projeyi İndir'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectDetail;