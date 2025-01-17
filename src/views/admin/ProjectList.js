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
  Container,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Stack
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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [mentorFilter, setMentorFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

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

  // Filter projects based on search query and mentor status
  const filteredProjects = projects
    .filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(project => {
      if (mentorFilter === "all") return true;
      if (mentorFilter === "assigned") return !!project.refereeUsername;
      if (mentorFilter === "unassigned") return !project.refereeUsername;
      return true;
    });

  // Sort projects by creation date
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const dateA = new Date(a.createdDate).getTime();
    const dateB = new Date(b.createdDate).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedProjects.length / rowsPerPage);
  const paginatedProjects = sortedProjects.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleMentorFilterChange = (event) => {
    setMentorFilter(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

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

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

  const renderControls = () => (
    <Box sx={{ 
      mb: 3, 
      display: 'flex', 
      gap: 2, 
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      <TextField
        label="Proje Ara"
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ minWidth: 200 }}
      />
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Sıralama</InputLabel>
        <Select
          value={sortOrder}
          label="Sıralama"
          onChange={handleSortChange}
        >
          <MenuItem value="desc">En Yeni</MenuItem>
          <MenuItem value="asc">En Eski</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Mentor Durumu</InputLabel>
        <Select
          value={mentorFilter}
          label="Mentor Durumu"
          onChange={handleMentorFilterChange}
        >
          <MenuItem value="all">Tümü</MenuItem>
          <MenuItem value="assigned">Mentor Atanmış</MenuItem>
          <MenuItem value="unassigned">Mentor Atanmamış</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ ml: 'auto' }}>
        <Typography variant="body2" color="textSecondary">
          Toplam: {filteredProjects.length} proje
        </Typography>
      </Box>
    </Box>
  );

  const renderPagination = () => (
    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        color="primary"
        showFirstButton
        showLastButton
      />
    </Box>
  );

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
          
          {renderControls()}
          
          {isMobile ? (
            <Grid container spacing={2}>
              {paginatedProjects.map((project) => (
                <Grid item xs={12} key={project.id}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
    <Tooltip title={project.description || ''}>
      <span>{truncateText(project.description)}</span>
    </Tooltip>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SupervisorAccountIcon color="primary" fontSize="small" />
                        <Typography variant="body2" color="textSecondary">
                          Danışman: {project.refereeUsername || 'Atanmamış'}
                        </Typography>
                      </Box>
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
                  {paginatedProjects.map((project) => (
                    <TableRow key={project.id} hover>
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
                      <TableCell>
                        <Chip 
                          label={project.refereeUsername || 'Atanmamış'}
                          size="small"
                          color={project.refereeUsername ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
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
          
          {renderPagination()}
          
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProjectList;