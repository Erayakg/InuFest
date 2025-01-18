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
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import CategoryIcon from '@mui/icons-material/Category';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AssessmentModal from './AssessmentModal';
import GradeIcon from '@mui/icons-material/Grade';

const RefereeProjectList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);

  const fetchRefereeProjects = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('Kullanıcı bilgisi bulunamadı');
      }

      const response = await axios.get(`/v1/project/referee/getAllProject/${userId}`);
      
      if (response.data && response.data.data) {
        const projectData = Array.isArray(response.data.data) 
          ? response.data.data 
          : [response.data.data];
        
        setProjects(projectData);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error('Error fetching referee projects:', err);
      setError(err.response?.data?.message || 'Projeler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefereeProjects();
  }, []);

  const filteredProjects = projects
    .filter(project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const dateA = new Date(a.createdDate).getTime();
    const dateB = new Date(b.createdDate).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

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

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleView = (id) => {
    navigate(`/projectDetails/${id}`);
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tarih bilgisi yok';
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR').replace(',', ' -');
  };

  const handleAssessment = (projectId) => {
    setSelectedProjectId(projectId);
    setAssessmentModalOpen(true);
  };

  const handleAssessmentSuccess = () => {
    fetchRefereeProjects();
  };

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {paginatedProjects.map((project) => (
        <Grid item xs={12} key={project.id}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {project.name}
              </Typography>
              <Chip 
                label={project.category?.name || 'Kategori Yok'} 
                size="small" 
                color="primary"
                variant="outlined"
                sx={{ mb: 1 }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {truncateText(project.description, 100)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PersonIcon color="primary" fontSize="small" />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontWeight: 'medium'
                }}
              >
                {project.student?.username || 'Kaptan bilgisi yok'}
              </Typography>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderTop: 1,
              borderColor: 'divider',
              pt: 2,
              mt: 1
            }}>
              <Typography variant="caption" color="textSecondary">
                {formatDate(project.createdDate)}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Tooltip title="Detayları Görüntüle">
                  <IconButton
                    size="small"
                    onClick={() => handleView(project.id)}
                    color="primary"
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Değerlendir">
                  <IconButton
                    size="small"
                    onClick={() => handleAssessment(project.id)}
                    color="secondary"
                  >
                    <GradeIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderDesktopView = () => (
    <TableContainer 
      component={Paper} 
      variant="outlined"
      sx={{ 
        maxHeight: 'calc(100vh - 300px)',
        overflowX: 'hidden'
      }}
    >
      <Table sx={{ 
        tableLayout: 'fixed',
        minWidth: '100%'
      }}>
        <TableHead>
          <TableRow>
            <TableCell width="25%" sx={{ fontWeight: 'bold' }}>Proje Adı</TableCell>
            <TableCell width="30%" sx={{ fontWeight: 'bold' }}>Açıklama</TableCell>
            <TableCell width="15%" sx={{ fontWeight: 'bold' }}>Kategori</TableCell>
            <TableCell width="20%" sx={{ fontWeight: 'bold' }}>Takım Kaptanı</TableCell>
            <TableCell width="10%" align="center" sx={{ fontWeight: 'bold' }}>İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedProjects.map((project) => (
            <TableRow 
              key={project.id} 
              hover
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                <Tooltip title={project.name}>
                  <Typography noWrap>{project.name}</Typography>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                <Tooltip title={project.description || ''}>
                  <Typography noWrap>{truncateText(project.description, 40)}</Typography>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Chip 
                  label={project.category?.name || 'Kategori Yok'} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    maxWidth: '100%',
                    '.MuiChip-label': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }
                  }}
                />
              </TableCell>
              <TableCell sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" fontSize="small" />
                  <Tooltip title={project.student?.username || 'Kaptan bilgisi yok'}>
                    <Typography 
                      noWrap 
                      sx={{ 
                        color: theme.palette.primary.main,
                        flex: 1
                      }}
                    >
                      {project.student?.username || 'Kaptan bilgisi yok'}
                    </Typography>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell align="center">
                {renderActionButtons(project.id)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderControls = () => (
    <Box sx={{ 
      mb: 3, 
      display: 'flex', 
      gap: 2, 
      flexWrap: 'wrap', 
      alignItems: 'center',
      flexDirection: isMobile ? 'column' : 'row',
      width: isMobile ? '100%' : 'auto'
    }}>
      <TextField
        label="Proje Ara"
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ 
          minWidth: isMobile ? '100%' : 200 
        }}
      />
      <FormControl 
        size="small" 
        sx={{ 
          minWidth: isMobile ? '100%' : 200 
        }}
      >
        <InputLabel>Sıralama</InputLabel>
        <Select value={sortOrder} label="Sıralama" onChange={handleSortChange}>
          <MenuItem value="desc">En Yeni</MenuItem>
          <MenuItem value="asc">En Eski</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ 
        ml: isMobile ? 0 : 'auto',
        width: isMobile ? '100%' : 'auto',
        textAlign: isMobile ? 'center' : 'right'
      }}>
        <Typography variant="body2" color="textSecondary">
          Toplam: {filteredProjects.length} proje
        </Typography>
      </Box>
    </Box>
  );

  const renderActionButtons = (projectId) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
      <Tooltip title="Detayları Görüntüle">
        <IconButton
          size="small"
          onClick={() => handleView(projectId)}
          color="primary"
        >
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Değerlendir">
        <IconButton
          size="small"
          onClick={() => handleAssessment(projectId)}
          color="secondary"
        >
          <GradeIcon />
        </IconButton>
      </Tooltip>
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
        <Typography color="error" align="center">{error}</Typography>
      </Box>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography align="center" variant="h6" color="textSecondary">
              Atanmış proje bulunmamaktadır.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              mb: 4,
              fontSize: isMobile ? '1.5rem' : '2rem' 
            }}
          >
            Üzerime Atanan Projeler
          </Typography>
          
          {renderControls()}
          
          {isMobile ? renderMobileView() : renderDesktopView()}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              size={isMobile ? "small" : "medium"}
            />
          </Box>
        </CardContent>
      </Card>
      <AssessmentModal
        open={assessmentModalOpen}
        handleClose={() => {
          setAssessmentModalOpen(false);
          setSelectedProjectId(null);
        }}
        projectId={selectedProjectId}
        onSuccess={handleAssessmentSuccess}
      />
    </Container>
  );
};

export default RefereeProjectList; 