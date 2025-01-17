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
  useMediaQuery,
  CircularProgress,
  Grid,
  Container
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import CategoryIcon from '@mui/icons-material/Category';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
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
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        

        const response = await axios.get(`/v1/project`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('API Response:', response.data);

        if (response.data && response.data.data) {
          const projectData = Array.isArray(response.data.data) 
            ? response.data.data 
            : [response.data.data];
          
          setProjects(projectData);
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.response?.data?.message || 'Projeler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleView = (id) => {
    navigate(`/projectDetails/${id}`);
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Tarih bilgisi yok';
      const date = new Date(dateString);
      return date.toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(',', ' -');
    } catch (error) {
      console.error('Tarih formatı hatası:', error);
      return 'Tarih bilgisi yok';
    }
  };

  const formatMembers = (members) => {
    if (!members || members.length === 0) return 'Üye Yok';
    return members.map(member => 
      `${member.firstName} ${member.lastName} (${member.studentNumber})`
    ).join(', ');
  };

  const formatCaptain = (student) => {
    if (!student) return 'Kaptan bilgisi yok';
    return `${student.username} (${student.studentNumber})`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography align="center" variant="h6" color="textSecondary">
              Henüz hiç proje bulunmamaktadır.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
            Projeler
          </Typography>
          
          {isMobile ? (
            <Grid container spacing={2}>
              {projects.map((project) => (
                <Grid item xs={12} key={project.id}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {project.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CategoryIcon color="primary" fontSize="small" />
                        <Typography variant="body2" color="textSecondary">
                          {project.category?.name || 'Kategori Yok'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PersonIcon color="primary" fontSize="small" />
                        <Typography variant="body2" sx={{ 
                          color: theme.palette.primary.main,
                          fontWeight: 'medium'
                        }}>
                          Kaptan: {formatCaptain(project.student)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <GroupsIcon color="primary" fontSize="small" />
                        <Typography variant="body2" color="textSecondary">
                          Üyeler: {formatMembers(project.members)}
                        </Typography>
                      </Box>
                      {project.refereeUsername && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SupervisorAccountIcon color="primary" fontSize="small" />
                          <Typography variant="body2" color="textSecondary">
                            Danışman: {project.refereeUsername}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      borderTop: 1,
                      borderColor: 'divider',
                      pt: 2
                    }}>
                      <Typography variant="caption" color="textSecondary">
                        Oluşturulma: {formatDate(project.createdDate)}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleView(project.id)} 
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Proje Adı</strong></TableCell>
                    <TableCell><strong>Açıklama</strong></TableCell>
                    <TableCell><strong>Kategori</strong></TableCell>
                    <TableCell><strong>Kaptan</strong></TableCell>
                    <TableCell><strong>Üyeler</strong></TableCell>
                    <TableCell><strong>Danışman</strong></TableCell>
                    <TableCell><strong>Oluşturulma</strong></TableCell>
                    <TableCell align="center"><strong>İşlemler</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id} hover>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.description}</TableCell>
                      <TableCell>
                        <Chip 
                          label={project.category?.name || 'Kategori Yok'} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon color="primary" fontSize="small" />
                          <Typography sx={{ 
                            color: theme.palette.primary.main,
                            fontWeight: 'medium'
                          }}>
                            {formatCaptain(project.student)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{formatMembers(project.members)}</TableCell>
                      <TableCell>{project.refereeUsername || 'Atanmamış'}</TableCell>
                      <TableCell>{formatDate(project.createdDate)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Detayları Görüntüle">
                          <IconButton
                            size="small"
                            onClick={() => handleView(project.id)}
                            color="primary"
                          >
                            <VisibilityIcon />
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
    </Container>
  );
};

export default ProjectList;