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
  AvatarGroup,
  Avatar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProjectList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

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

      const response = await axios.get(`v1/project/student/getAllProject/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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

  const handleView = (id) => {
    navigate(`/projectdetail/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/projectedit/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      // API çağrısı eklenecek
      console.log('Delete project:', id);
      // await axios.delete(`http://localhost:8080/project/${id}`);
      // Silme başarılı olursa listeyi güncelle
      // setProjects(projects.filter(project => project.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Proje silinirken bir hata oluştu');
    }
  };

  // Öğrenci avatarları için renk üreteci
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  // Öğrenci avatarları için stil
  const getAvatarStyle = (name) => ({
    bgcolor: stringToColor(name),
    cursor: 'pointer',
  });

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

  // Mobil görünüm için kart komponenti
  const MobileProjectCard = ({ project }) => (
    <Card sx={{ mb: 2, p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {project.name}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {project.description}
        </Typography>
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Typography variant="caption" color="textSecondary">
            Kategori
          </Typography>
          <Typography variant="body2">
            <Chip label={project.category.name} size="small" color="primary" />
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="caption" color="textSecondary">
            Öğrenciler
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {project.students.map((student) => (
              <Tooltip
                key={student.id}
                title={`Öğrenci No: ${student.studentNumber}`}
                arrow
              >
                <Chip
                  label={student.username}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderRadius: '16px',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    },
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="textSecondary">
            Oluşturulma Tarihi
          </Typography>
          <Typography variant="body2">
            {new Date(project.createDate).toLocaleDateString()}
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <IconButton size="small" onClick={() => handleView(project.id)} color="primary">
          <VisibilityIcon />
        </IconButton>
        <IconButton size="small" onClick={() => handleEdit(project.id)} color="primary">
          <EditIcon />
        </IconButton>
        <IconButton size="small" onClick={() => handleDelete(project.id)} color="error">
          <DeleteIcon />
        </IconButton>
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
              {projects.map((project) => (
                <MobileProjectCard key={project.id} project={project} />
              ))}
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="project table">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Proje Adı</strong></TableCell>
                    <TableCell><strong>Açıklama</strong></TableCell>
                    <TableCell><strong>Kategori</strong></TableCell>
                    <TableCell><strong>Öğrenciler</strong></TableCell>
                    <TableCell><strong>Oluşturulma Tarihi</strong></TableCell>
                    <TableCell><strong>İşlemler</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow
                      key={project.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.description}</TableCell>
                      <TableCell>
                        <Chip
                          label={project.category.name}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {project.students.map((student, index) => (
                            <Tooltip
                              key={student.id}
                              title={`Öğrenci No: ${student.studentNumber}`}
                              arrow
                            >
                              <Chip
                                label={student.username}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderRadius: '16px',
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                  },
                                }}
                              />
                            </Tooltip>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(project.createDate).toLocaleDateString()}
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
                        <Tooltip title="Düzenle">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(project.id)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(project.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectList; 