import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GradeIcon from '@mui/icons-material/Grade';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RefereeProjectList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openEvalDialog, setOpenEvalDialog] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [score, setScore] = useState('');
  const [projectScores, setProjectScores] = useState({});

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      fetchProjectScores();
    }
  }, [projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      console.log(userId);
      console.log(token);
      if (!token || !userId) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`v1/project/referee/getAllProject/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(response.data);
      if (response.data.success) {
        setProjects(response.data.data);
      } else {
        setError(response.data.data || response.data.message || 'Bir hata oluştu');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }

      const errorMessage = err.response?.data?.data || 
                          err.response?.data?.message || 
                          'Projeler yüklenirken bir hata oluştu';
      setError(errorMessage);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectScores = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Her proje için ayrı ayrı değerlendirme kontrolü yap
      const scorePromises = projects.map(project => 
        axios.get(`/assessment/assessmentValue/${project.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(response => {
          if (response.data.success && response.data.data?.value) {
            return {
              projectId: project.id,
              value: response.data.data.value,
              projectName: response.data.data.projectName
            };
          }
          return null;
        })
        .catch(() => null)
      );

      const responses = await Promise.all(scorePromises);
      const scores = {};
      
      responses.forEach((response) => {
        if (response && response.value) {
          scores[response.projectId] = response;
        }
      });

      setProjectScores(scores);
    } catch (error) {
      console.error('Değerlendirme puanları alınamadı:', error);
    }
  };

  const handleView = (id) => {
    navigate(`/projectDetails/${id}`);
  };



  const handleEvaluate = (id) => {
    setSelectedProjectId(id);
    setOpenEvalDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenEvalDialog(false);
    setScore('');
    setSelectedProjectId(null);
  };

  const handleSubmitEvaluation = async () => {
    try {
      const token = localStorage.getItem('token');
      const assessmentRequest = {
        projectId: selectedProjectId,
        value: parseFloat(score)
      };

      await axios.post('/assessment/createAssessment', 
        assessmentRequest,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      handleCloseDialog();
      fetchProjects();
      fetchProjectScores(); // Puanları yenile
    } catch (err) {
      console.error('Değerlendirme hatası:', err);
      setError('Proje değerlendirilirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Mobil görünüm için kart bileşeni güncellendi
  const MobileProjectCard = ({ project }) => (
    <Card sx={{ mb: 2, p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {project.name}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {project.description}
        </Typography>
        {project.student && (
          <Box sx={{ mt: 1, mb: 1 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Öğrenci:
            </Typography>
            <Chip
              label={project.student.username}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
            
          </Box>
        )}
        {projectScores[project.id] && (
          <Typography variant="h6" color="primary">
            Değerlendirme Puanı: {projectScores[project.id].value}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <IconButton size="small" onClick={() => handleView(project.id)} color="primary">
          <VisibilityIcon />
        </IconButton>
        {!projectScores[project.id] && (
          <IconButton size="small" onClick={() => handleEvaluate(project.id)} color="success">
            <GradeIcon />
          </IconButton>
        )}
      </Box>
    </Card>
  );

  return (
    <Box>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h3" mb={3}>
            Projeler
          </Typography>
          
          {isMobile ? (
            <Box>
              {projects && projects.length > 0 ? (
                projects.map((project) => (
                  <MobileProjectCard key={project.id} project={project} />
                ))
              ) : (
                <Typography>Henüz proje bulunmamaktadır.</Typography>
              )}
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="project table">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Proje Adı</strong></TableCell>
                    <TableCell><strong>Açıklama</strong></TableCell>
                    <TableCell><strong>Kategori</strong></TableCell>
                    <TableCell><strong>Öğrenci Bilgileri</strong></TableCell>
                    <TableCell><strong>Değerlendirme Puanı</strong></TableCell>
                    <TableCell><strong>İşlemler</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects && projects.length > 0 ? (
                    projects.map((project) => {
                      const hasScore = projectScores[project.id]?.value;
                      return (
                        <TableRow key={project.id}>
                          <TableCell>{project.name}</TableCell>
                          <TableCell>{project.description}</TableCell>
                          <TableCell>
                            <Chip
                              label={project.category?.name || 'Kategori Yok'}
                              size="small"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            {project.student && (
                              <Box>
                                <Typography variant="subtitle2">
                                  {project.student.username}
                                </Typography>
                                
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>
                            {hasScore ? (
                              <Typography color="primary">
                                {projectScores[project.id].value}
                              </Typography>
                            ) : (
                              <Typography color="textSecondary">
                                Değerlendirilmedi
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Görüntüle">
                              <IconButton
                                size="small"
                                onClick={() => handleView(project.id)}
                                color="primary"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            {!hasScore && (
                              <Tooltip title="Değerlendir">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEvaluate(project.id)}
                                  color="success"
                                >
                                  <GradeIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography>Henüz proje bulunmamaktadır.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={openEvalDialog} onClose={handleCloseDialog}>
        <DialogTitle>Proje Değerlendirme</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Değerlendirme Puanı"
            type="number"
            fullWidth
            value={score}
            onChange={(e) => setScore(e.target.value)}
            inputProps={{ min: 0, max: 100 }}
            helperText="0-100 arası bir puan giriniz"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button 
            onClick={handleSubmitEvaluation} 
            variant="contained" 
            color="primary"
            disabled={!score || score < 0 || score > 100}
          >
            Değerlendir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RefereeProjectList; 