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
  CircularProgress,
} from "@mui/material";
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
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        const response = await axios.get(`/v1/project/student/getAllProject/${userId}`, {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });
        
        if (response.data.success && Array.isArray(response.data.data)) {
          setProjects(response.data.data);
        } else if (response.data.success && response.data.data) {
          setProjects([response.data.data]);
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Projeler yüklenirken bir hata oluştu');
        setProjects([]);
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
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Tarih formatı hatası:', error);
      return 'Tarih bilgisi yok';
    }
  };

  const truncateText = (text, wordCount = 4) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  const formatReferees = (refereeList) => {
    if (!refereeList || refereeList.length === 0) return 'Danışman Atanmamış';
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {refereeList.map((referee, index) => (
          <Chip
            key={index}
            label={referee}
            size="small"
            variant="outlined"
          />
        ))}
      </Box>
    );
  };

  const formatMembers = (members) => {
    if (!members || members.length === 0) return 'Üye Yok';
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {members.map(member => (
          <Chip
            key={member.studentNumber}
            label={`${member.firstName} ${member.lastName}`}
            size="small"
            variant="outlined"
            title={`${member.firstName} ${member.lastName} (${member.studentNumber})`}
          />
        ))}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const projectsArray = Array.isArray(projects) ? projects : [];

  if (projectsArray.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Henüz hiç proje bulunmamaktadır.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" mb={3}>
            Projeler
          </Typography>
          
          {isMobile ? (
            <Box>
              {projectsArray.map((project) => (
                <Card key={project.id} sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {project.name}
                    </Typography>
                    <Tooltip title={project.description || ''}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        {truncateText(project.description)}
                      </Typography>
                    </Tooltip>
                    <Typography variant="body2" color="textSecondary">
                      Kategori: {project.category?.name || 'Kategori Yok'}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Üyeler:
                      </Typography>
                      {formatMembers(project.members)}
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Danışmanlar:
                      </Typography>
                      {formatReferees(project.refereeUsernameList)}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    <TableCell><strong>Üyeler</strong></TableCell>
                    <TableCell><strong>Danışmanlar</strong></TableCell>
                    <TableCell><strong>Oluşturulma</strong></TableCell>
                    <TableCell><strong>İşlemler</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectsArray.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>
                        <Tooltip title={project.description || ''}>
                          <Typography>
                            {truncateText(project.description)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.category?.name || 'Kategori Yok'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: '200px' }}>
                        {formatMembers(project.members)}
                      </TableCell>
                      <TableCell sx={{ minWidth: '200px' }}>
                        {formatReferees(project.refereeUsernameList)}
                      </TableCell>
                      <TableCell>
                        {formatDate(project.createdDate)}
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