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
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const token = localStorage.getItem('token');
const config = {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const ProjectList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State Management
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateSortOrder, setDateSortOrder] = useState(null);
  const [scoreSortOrder, setScoreSortOrder] = useState(null);
  const [mentorFilter, setMentorFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [averageScores, setAverageScores] = useState({});
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  // Fetch Projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`/v1/project`, config);
        
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

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`/v1/category`, config);
        setCategories(response.data.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);


  // Fetch Sub-Categories when Category Filter Changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (categoryFilter === "all") {
        setSubCategories([]); // Eğer "Tümü" seçilirse alt kategorileri temizle
        return;
      }
  
      // Seçilen kategoriyi bul
      const selectedCategory = categories.find(cat => cat.name === categoryFilter);
      if (!selectedCategory) return;
  
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/v1/category/getSubCategories/${selectedCategory.id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
  
        // API'den gelen veriyi işle
        const categoryData = response.data.data.find(cat => cat.id === selectedCategory.id);
        if (categoryData && categoryData.subCategories) {
          console.log("Alt Kategoriler:", categoryData.subCategories);
          setSubCategories(categoryData.subCategories); // Alt kategorileri state'e kaydet
        } else {
          setSubCategories([]); // Alt kategori yoksa state'i temizle
        }
      } catch (err) {
        console.error('Alt kategoriler çekilirken hata oluştu:', err);
      }
    };
  
    fetchSubCategories();
  }, [categoryFilter, categories]);



  // Fetch Average Scores
  useEffect(() => {
    const fetchAverageScores = async () => {
      try {
        const response = await axios.get(`/v1/project-referees`, config);
  
        // Proje ID'lere göre gruplama ve ortalama hesaplama
        const scores = {};
        response.data.forEach((item) => {
          const { projectId, assessments } = item;
  
          if (!scores[projectId]) {
            scores[projectId] = { totalScore: 0, count: 0 };
          }
  
          if (assessments && assessments.length > 0) {
            assessments.forEach((assessment) => {
              scores[projectId].totalScore += assessment.score;
              scores[projectId].count += 1;
            });
          }
        });
  
        // Ortalama puanları hesapla
        const averageScores = {};
        Object.keys(scores).forEach((projectId) => {
          const { totalScore, count } = scores[projectId];
          averageScores[projectId] = count > 0 ? totalScore / count : 0;
        });
  
        setAverageScores(averageScores);
      } catch (err) {
        console.error('Ortalama puanlar alınırken bir hata oluştu:', err);
      }
    };
  
    fetchAverageScores();
  }, []);
  // Filtering and Sorting Logic
  const filteredAndSortedProjects = React.useMemo(() => {
    return [...projects]
      .filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter(project => {
        if (mentorFilter === "all") return true;
        if (mentorFilter === "assigned") return project.refereeUsernameList?.length > 0;
        if (mentorFilter === "unassigned") return !project.refereeUsernameList?.length;
        return true;
      })
      .filter(project => {
        if (categoryFilter === "all") return true;
        
        const matchesCategory = project.category?.name === categoryFilter;
        if (!matchesCategory) return false;

        if (selectedSubCategory === '') return true;

        return project.subCategory?.id === parseInt(selectedSubCategory);
      })
      .filter(project => {
        // Alt kategori filtresi kontrolü
        if (subCategoryFilter === "all") return true;
        return project.category?.subCategoryResponse === subCategoryFilter;
      })
      .sort((a, b) => {
        if (scoreSortOrder) {
          const scoreA = averageScores[a.id] || 0;
          const scoreB = averageScores[b.id] || 0;
          
          if (scoreA !== scoreB) {
            return scoreSortOrder === "highest" ? scoreB - scoreA : scoreA - scoreB;
          }
        }
        
        if (dateSortOrder) {
          const dateA = new Date(a.createdDate).getTime();
          const dateB = new Date(b.createdDate).getTime();
          return dateSortOrder === "desc" ? dateB - dateA : dateA - dateB;
        }
        
        return 0; // No sorting if no order is selected
      });
  }, [projects, searchQuery, mentorFilter, categoryFilter, subCategoryFilter,selectedSubCategory, scoreSortOrder, dateSortOrder, averageScores]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProjects.length / rowsPerPage);
  const paginatedProjects = filteredAndSortedProjects.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Event Handlers
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleDateSortChange = (event) => {
    setDateSortOrder(event.target.value);
  };

  const handleScoreSortChange = (event) => {
    setScoreSortOrder(event.target.value);
  };

  const handleMentorFilterChange = (event) => {
    setMentorFilter(event.target.value);
    setPage(1);
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setSubCategoryFilter("all"); // Reset sub-category filter when category changes
    setPage(1);
  };
  const handleSubCategoryFilterChange = (event) => {
    setSubCategoryFilter(event.target.value);
    setPage(1);
  };

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (categoryFilter === "all") {
        setSubCategories([]); // Eğer "Tümü" seçilirse alt kategorileri temizle
        return;
      }
  
      // Seçilen kategoriyi bul
      const selectedCategory = categories.find(cat => cat.name === categoryFilter);
      if (!selectedCategory) return;
  
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/v1/category/getSubCategories/${selectedCategory.id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
  
        // API'den gelen veriyi işle
        const categoryData = response.data.data.find(cat => cat.id === selectedCategory.id);
        if (categoryData && categoryData.subCategories) {
          console.log("Alt Kategoriler:", categoryData.subCategories);
          setSubCategories(categoryData.subCategories); // Alt kategorileri state'e kaydet
        } else {
          setSubCategories([]); // Alt kategori yoksa state'i temizle
        }
      } catch (err) {
        console.error('Alt kategoriler çekilirken hata oluştu:', err);
      }
    };
  
    fetchSubCategories();
  }, [categoryFilter, categories]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleView = (id) => {
    navigate(`/projectDetails/${id}`);
  };

  // Utility Functions
  const formatDate = (dateString) => {
    if (!dateString) return 'Tarih bilgisi yok';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
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

  // Render Controls
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
        <InputLabel>Tarih Sıralaması</InputLabel>
        <Select
          value={dateSortOrder}
          label="Tarih Sıralaması"
          onChange={handleDateSortChange}
        >
          <MenuItem value="desc">En Yeni</MenuItem>
          <MenuItem value="asc">En Eski</MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Puan Sıralaması</InputLabel>
        <Select
          value={scoreSortOrder}
          label="Puan Sıralaması"
          onChange={handleScoreSortChange}
        >
          <MenuItem value="highest">En Yüksek</MenuItem>
          <MenuItem value="lowest">En Düşük</MenuItem>
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
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Kategori</InputLabel>
        <Select
          value={categoryFilter}
          label="Kategori"
          onChange={handleCategoryFilterChange}
        >
          <MenuItem value="all">Tümü</MenuItem>
          {categories.map(category => (
            <MenuItem key={category.id} value={category.name}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 200 }} disabled={categoryFilter === "all"}>
        <InputLabel>Alt Kategori</InputLabel>
        <Select
          value={subCategoryFilter}
          label="Alt Kategori"
          onChange={handleSubCategoryFilterChange}
        >
          <MenuItem value="all">Tümü</MenuItem>
          {subCategories.map(subCategory => (
            <MenuItem key={subCategory.id} value={subCategory.name}>
              {subCategory.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );

  // Loading State
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error State
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Box>
    );
  }

  // Empty State
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

  // Mobile View
  const renderMobileView = () => (
    <Grid container spacing={2}>
      {paginatedProjects.map((project) => (
        <Grid item xs={12} key={project.id}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {project.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StarIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
                <Typography variant="body2" color="textSecondary">
                  {(averageScores[project.id] || 0).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CategoryIcon color="primary" fontSize="small" />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {project.category?.name || 'Kategori Yok'}
                  </Typography>
                  {project.subCategory && (
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                      Alt Kategori: {project.subCategory.name}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PersonIcon color="primary" fontSize="small" />
                <Typography variant="body2">
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
                  Hakemler: {project.refereeUsernameList?.length > 0 
                    ? project.refereeUsernameList.join(', ') 
                    : 'Atanmamış'}
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
                {formatDate(project.createdDate)}
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
  );

  // Desktop View
  const renderDesktopView = () => (
    <TableContainer component={Paper} variant="outlined">
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell><strong>Proje Adı</strong></TableCell>
            <TableCell><strong>Ortalama Puan</strong></TableCell>
            <TableCell><strong>Kategori</strong></TableCell>
            <TableCell><strong>Kaptan</strong></TableCell>
            <TableCell><strong>Üyeler</strong></TableCell>
            <TableCell><strong>Hakemler</strong></TableCell>
            <TableCell><strong>Tarih</strong></TableCell>
            <TableCell align="center"><strong>İşlemler</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedProjects.map((project) => (
            <TableRow key={project.id} hover>
              <TableCell>{project.name}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon fontSize="small" sx={{ color: theme.palette.warning.main }} />
                {(averageScores[project.id] || 0).toFixed(2)}
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Chip 
                    label={project.category?.name || 'Kategori Yok'} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                  {project.subCategory && (
                    <Chip 
                      label={project.subCategory.name}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" fontSize="small" />
                  <Typography>
                    {formatCaptain(project.student)}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Tooltip title={formatMembers(project.members)}>
                  <Typography>
                    {truncateText(formatMembers(project.members), 30)}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell>
                {project.refereeUsernameList?.length > 0 ? (
                  project.refereeUsernameList.map((referee, index) => (
                    <Chip 
                      key={index}
                      label={referee}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))
                ) : (
                  <Chip 
                    label="Atanmamış"
                    size="small"
                    color="default"
                    variant="outlined"
                  />
                )}
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
  );

  // Main Render
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
            Projeler
          </Typography>
          
          {renderControls()}
          
          {isMobile ? renderMobileView() : renderDesktopView()}
          
          <Box sx={{ 
            mt: 3, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center' 
          }}>
            <Typography variant="body2" color="textSecondary">
              Toplam {filteredAndSortedProjects.length} proje
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProjectList;
