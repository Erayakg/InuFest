import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
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
  FileDownload as FileDownloadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [projectReferees, setProjectReferees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const [projectResponse, refereesResponse] = await Promise.all([
          axios.get(`/v1/project/student/getProject/${id}`),
          axios.get(`/v1/project-referees/by-project/${id}`)
        ]);
        
        if (projectResponse.data.success) {
          setProject(projectResponse.data.data);
        } else {
          setError('Proje bilgileri alınamadı');
        }

        // Hakem bilgilerini set et
        setProjectReferees(refereesResponse.data);

      } catch (err) {
        setError('Proje yüklenirken bir hata oluştu');
        console.error('Proje detay hatası:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios({
        method: 'GET',
        url: `/v1/project/${id}/download`,
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 204 || !response.data) {
        throw new Error('Dosya bulunamadı');
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'proje.pdf');
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

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/v1/project/student/delete/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSnackbar({
        open: true,
        message: 'Proje başarıyla silindi',
        severity: 'success'
      });

      // Kısa bir süre bekleyip ana sayfaya yönlendir
      setTimeout(() => {
        navigate('/projects');
      }, 1500);

    } catch (error) {
      console.error('Proje silme hatası:', error);
      setSnackbar({
        open: true,
        message: 'Proje silinirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
      setOpenDialog(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Tarih bilgisi yok';

      // PostgreSQL timestamp formatını parse et
      const date = new Date(dateString);
      
      // Tarihi parçalara ayır
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');

      // Formatlanmış tarihi döndür
      return `${day}.${month}.${year} - ${hours}:${minutes}:${seconds}`;
      
    } catch (error) {
      console.error('Tarih formatı hatası:', error);
      return 'Tarih bilgisi yok';
    }
  };

  // Puana göre renk belirleme fonksiyonu
  const getScoreColor = (score) => {
    if (score >= 90) return '#2e7d32'; // Yeşil
    if (score >= 70) return '#1976d2'; // Mavi
    if (score >= 50) return '#ed6c02'; // Turuncu
    return '#d32f2f'; // Kırmızı
  };

  // Ortalama puan hesaplama
  const calculateAverageScore = (referees) => {
    const validAssessments = referees.filter(ref => ref.assessment?.score);
    if (validAssessments.length === 0) return null;
    
    const totalScore = validAssessments.reduce((sum, ref) => sum + ref.assessment.score, 0);
    return (totalScore / validAssessments.length).toFixed(2);
  };

  // Ortalama puanı hesapla
  const averageScore = calculateAverageScore(projectReferees);

  const RefereeCard = () => {
    const averageScore = calculateAverageScore(projectReferees);

    // Puana göre renk belirleme fonksiyonu
    const getScoreColor = (score) => {
      if (score >= 90) return '#2e7d32'; // Yeşil
      if (score >= 70) return '#1976d2'; // Mavi
      if (score >= 50) return '#ed6c02'; // Turuncu
      return '#d32f2f'; // Kırmızı
    };

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            Hakemler ve Değerlendirmeler
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {averageScore && (
            <Box 
              sx={{ 
                mb: 3, 
                p: 3,
                borderRadius: 2,
                background: (theme) => `linear-gradient(45deg, ${getScoreColor(averageScore)} 0%, ${theme.palette.background.paper} 200%)`,
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Typography variant="subtitle1" color="white">
                Ortalama Puan
              </Typography>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: 'white',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {averageScore}
              </Typography>
            </Box>
          )}
          
          {projectReferees && projectReferees.length > 0 ? (
            <Stack spacing={2}>
              {projectReferees.map((referee) => (
                <Paper key={referee.id} elevation={1} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {referee.refereeName.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        {referee.refereeName}
                      </Typography>
                      
                      {referee.assessment ? (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>Puan:</strong> {referee.assessment.score}
                          </Typography>
                          {referee.assessment.description && (
                            <>
                              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                <strong>Değerlendirme:</strong>
                              </Typography>
                              <Paper 
                                variant="outlined" 
                                sx={{ 
                                  p: 2, 
                                  mt: 1, 
                                  bgcolor: 'grey.50',
                                  borderRadius: 1,
                                  maxHeight: '300px',
                                  overflowY: 'auto'
                                }}
                              >
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  {referee.assessment.description}
                                </Typography>
                              </Paper>
                            </>
                          )}
                        </Box>
                      ) : (
                        <Chip
                          label="Değerlendirme Bekliyor"
                          color="warning"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography color="textSecondary">
              Henüz hakem atanmamış
            </Typography>
          )}
        </CardContent>
      </Card>
    );
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
        {/* Proje Detayları - Sol Taraf */}
        <Grid item xs={12} md={8}>
          {/* Proje Detayları Kartı */}
          <Card sx={{ mb: 3 }}>
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
                    <FileDownloadIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Proje Dosyası"
                    secondary={
                      <Button
                        variant="contained"
                        color="primary"
                        
                        onClick={handleDownload}
                        disabled={downloadLoading}
                        sx={{ mt: 1 }}
                      >
                        {downloadLoading ? 'İndiriliyor...' : 'Dosyayı İndir'}
                      </Button>
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
                    secondary={formatDate(project?.createdDate)}
                  />
                </ListItem>
              </List>

              {/* Tehlikeli Bölge */}
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: '#ffebee', 
                borderRadius: 1,
                border: '1px solid #ef5350'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6" color="error">
                    Tehlikeli Bölge
                  </Typography>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setOpenDeleteDialog(true)}
                  >
                    Projeyi Sil
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Hakemler ve Değerlendirmeler - Alt alta düzen */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Hakemler ve Değerlendirmeler
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {averageScore && (
                <Box 
                  sx={{ 
                    mb: 3, 
                    p: 3,
                    borderRadius: 2,
                    background: (theme) => `linear-gradient(45deg, ${getScoreColor(averageScore)} 0%, ${theme.palette.background.paper} 200%)`,
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Typography variant="subtitle1" color="white">
                    Ortalama Puan
                  </Typography>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      color: 'white',
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    {averageScore}
                  </Typography>
                </Box>
              )}

              <Stack spacing={2}>
                {projectReferees && projectReferees.length > 0 ? (
                  projectReferees.map((referee) => (
                    <Paper key={referee.id} elevation={1} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {referee.refereeName.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {referee.refereeName}
                          </Typography>
                          
                          {referee.assessment ? (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" color="textSecondary" gutterBottom>
                                <strong>Puan:</strong> {referee.assessment.score}
                              </Typography>
                              {referee.assessment.description && (
                                <>
                                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                    <strong>Değerlendirme:</strong>
                                  </Typography>
                                  <Paper 
                                    variant="outlined" 
                                    sx={{ 
                                      p: 2, 
                                      mt: 1, 
                                      bgcolor: 'grey.50',
                                      borderRadius: 1,
                                      maxHeight: '300px',
                                      overflowY: 'auto'
                                    }}
                                  >
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                      }}
                                    >
                                      {referee.assessment.description}
                                    </Typography>
                                  </Paper>
                                </>
                              )}
                            </Box>
                          ) : (
                            <Chip
                              label="Değerlendirme Bekliyor"
                              color="warning"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  ))
                ) : (
                  <Typography color="textSecondary">
                    Henüz hakem atanmamış
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Sağ Taraf - Takım Bilgileri */}
        <Grid item xs={12} md={4}>
          {/* Takım Kaptanı Kartı */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                Takım Kaptanı
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                  {project?.student?.username?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {project?.student?.username}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Öğrenci No: {project?.student?.studentNumber}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Email: {project?.student?.email}
                  </Typography>
                  {project?.student?.deparment && (
                    <Typography variant="body2" color="textSecondary">
                      Bölüm: {project?.student?.deparment}
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Takım Üyeleri Kartı */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon color="primary" />
                Takım Üyeleri
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                {project?.members && project.members.length > 0 ? (
                  project.members.map((member) => (
                    <Box key={member.id || Math.random()} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {member.firstName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {`${member.firstName} ${member.lastName}`}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {member.email}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Öğrenci No: {member.studentNumber}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography color="textSecondary">
                    Projede üye bulunmamaktadır
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Silme Onay Dialog'u */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>
          Projeyi Silmek İstediğinizden Emin misiniz?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu işlem geri alınamaz. Proje ve tüm ilişkili veriler kalıcı olarak silinecektir.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeleteDialog(false)} 
            disabled={deleteLoading}
          >
            İptal
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Siliniyor...' : 'Evet, Sil'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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