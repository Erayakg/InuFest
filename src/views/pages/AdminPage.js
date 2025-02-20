import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  Snackbar,
  Pagination,
  DialogContentText,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as ProjectIcon,
  Person as MentorIcon,
  Delete as DeleteIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';

const AdminPage = () => {
  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState({});
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [showMentorForm, setShowMentorForm] = useState(false);
  const [newMentorData, setNewMentorData] = useState({
    name: '',
    mail: '',
    categoryId: '',
    phoneNumber: '+90 '
  });
  const [projectsWithMentor, setProjectsWithMentor] = useState([]);
  const [projectsWithoutMentor, setProjectsWithoutMentor] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [isLoading, setIsLoading] = useState({
    fetchData: false,
    assignMentor: false,
    addMentor: false,
    addCategory: false,
    updateCategory: false,
    deleteCategory: false,
    removeMentor: false
  });
  const [assignedMentors, setAssignedMentors] = useState({});
  const [assignmentError, setAssignmentError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showSubCategoryForm, setShowSubCategoryForm] = useState(false);
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [subCategories, setSubCategories] = useState({});
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [deleteRefereeDialog, setDeleteRefereeDialog] = useState({
    open: false,
    refereeId: null,
    refereeName: ''
  });
   // Telefon numarasını formatla
   const formatPhoneNumber = (value) => {
    // Sadece rakamları al
    const cleaned = value.replace(/\D/g, "");
    // +90 sabit kalsın, geri kalanı formatla
    if (cleaned.length <= 2) {
      return `+${cleaned}`;
    } else if (cleaned.length <= 5) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    } else if (cleaned.length <= 8) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
    } else if (cleaned.length <= 10) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
    } else {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`;
    }
  };
  const handlePhoneNumberKeyDown = (e) => {
    const { selectionStart } = e.target;
    // Eğer imleç +90 kısmındaysa ve silme tuşuna basıldıysa engelle
    if (selectionStart <= 4 && (e.key === "Backspace" || e.key === "Delete")) {
      e.preventDefault();
    }
  };
  const validate = () => {
    const newError = {};
    if (!newMentorData.phoneNumber || !/^\+90 \d{3} \d{3} \d{2} \d{2}$/.test(newMentorData.phoneNumber)) newError.phoneNumber = "Telefon numarası +90 xxx xxx xx xx formatında olmalı";
    
    return newError;
  
  };

  useEffect(() => {
    fetchMentors();
    fetchAllProjects();
    fetchCategories();
  }, []);

  const fetchAllProjects = async () => {
    setIsLoading(prev => ({ ...prev, fetchData: true }));
    try {
      const projectsResponse = await axios.get('/v1/project', config);
      const allProjects = projectsResponse.data.data;

      const projectsWithReferees = await Promise.all(
        allProjects.map(async (project) => {
          const refereesResponse = await axios.get(`/v1/project-referees/by-project/${project.id}`, config);
          return {
            ...project,
            referees: refereesResponse.data.map(referee => ({
              id: referee.id,
              refereeId: referee.refereeId,
              name: referee.refereeName,
              assessments: referee.assessments
            })) || []
          };
        })
      );

      // Mentörü olan ve olmayan projeleri ayır
      const withMentor = projectsWithReferees.filter(project => project.referees.length > 0);
      const withoutMentor = projectsWithReferees.filter(project => project.referees.length === 0);

      setProjectsWithMentor(withMentor.map(project => ({
        id: project.id,
        name: project.name,
        creator: project.creator,
        referees: project.referees,
        status: 'Devam Ediyor'
      })));

      setProjectsWithoutMentor(withoutMentor.map(project => ({
        id: project.id,
        name: project.name,
        creator: project.creator,
        referees: [],
        status: 'Hakem Bekleniyor'
      })));

    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, fetchData: false }));
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await axios.get('/v1/referee', config);
      setMentors(response.data.data);
      
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/v1/category', config);
      // Her kategori için alt kategori sayısını kontrol et
      const categoriesWithSubCount = await Promise.all(
        response.data.data.map(async (category) => {
          const subResponse = await axios.get(`/v1/category/getSubCategories/${category.id}`, config);
          const subCategories = subResponse.data.data.find(cat => cat.id === category.id)?.subCategories || [];
          return {
            ...category,
            hasSubCategories: subCategories.length > 0
          };
        })
      );
      setCategories(categoriesWithSubCount);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAssignedMentors = async (projectId) => {
    try {
      const response = await axios.get(`/v1/project-referees/by-project/${projectId}`, config);
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned mentors:', error);
      return [];
    }
  };

  const handleAssignMentor = async (project) => {
    setAssignmentError(null);
    setSelectedProject(project);
    setSelectedMentor('');
    
    const assignments = await fetchAssignedMentors(project.id);
    setAssignedMentors(assignments);
    
    setOpenAssignDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenAssignDialog(false);
    setSelectedProject(null);
    setSelectedMentor('');
  };

  const handleSaveAssignment = async () => {
    if (!selectedMentor || !selectedProject) return;
    
    setIsLoading(prev => ({ ...prev, assignMentor: true }));
    setAssignmentError(null);

    try {
      const mentorAssignments = await axios.get(`/v1/project-referees/by-referee/${selectedMentor}`, config);
      const isAlreadyAssigned = mentorAssignments.data.some(
        assignment => assignment.projectId === selectedProject.id
      );

      if (isAlreadyAssigned) {
        setAssignmentError('Bu hakem zaten bu projeye atanmış!');
        return;
      }

      await axios.post('/v1/project-referees', {
        projectId: selectedProject.id,
        refereeId: selectedMentor
      }, config);
      
      await fetchAllProjects();
      handleCloseDialog();
    } catch (error) {
      console.error('Error assigning mentor:', error);
      setAssignmentError(error.response?.data?.message || 'Hakem atama işlemi başarısız oldu');
    } finally {
      setIsLoading(prev => ({ ...prev, assignMentor: false }));
    }
  };

  const handleRemoveMentor = async (projectId, refereeId, refereeName) => {
    
    
    if (window.confirm(`${refereeName} isimli hakemü projeden silmek istediğinize emin misiniz?`)) {
      setIsLoading(prev => ({ ...prev, removeMentor: true }));
      try {
        const projectReferees = await axios.get(`/v1/project-referees/by-project/${projectId}`, config);
        const refereeAssignment = projectReferees.data.find(ref => ref.refereeId === refereeId);
        
        if (!refereeAssignment) {
          throw new Error('Hakem ataması bulunamadı');
        }

        await axios.delete(`/v1/project-referees/${refereeAssignment.id}`, config);
        
        await fetchAllProjects();
        setSnackbar({
          open: true,
          message: 'Hakem başarıyla kaldırıldı',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error removing mentor:', error);
        setSnackbar({
          open: true,
          message: `Hakem kaldırılırken bir hata oluştu: ${error.message}`,
          severity: 'error'
        });
      } finally {
        setIsLoading(prev => ({ ...prev, removeMentor: false }));
      }
    }
  };

  const handleMentorInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      // Telefon numarasını formatla
      const formattedPhoneNumber = formatPhoneNumber(value);
      setNewMentorData({
        ...newMentorData,
        [name]: formattedPhoneNumber,
      });
    } else {
      setNewMentorData({
        ...newMentorData,
        [name]: value,
      });
    }
  };

  const handleAddMentor = async (e) => {
    e.preventDefault();
    const newError = validate();
    if (Object.keys(newError).length > 0) {
      setError(newError);
      return;
    }
    setError({});
    setIsLoading(prev => ({ ...prev, addMentor: true }));
    try {
      const response = await axios.post('/v1/referee/addReferee', newMentorData, config);
      setMentors([...mentors, response.data.data]);
      setNewMentorData({ name: '', mail: '', categoryId: '', phoneNumber: '' });
      setShowMentorForm(false);
    } catch (error) {
      console.error('Error adding mentor:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, addMentor: false }));
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setIsLoading(prev => ({ ...prev, addCategory: true }));
    try {
      await axios.post('/v1/category/addCategory', { name: newCategoryName }, config);
      fetchCategories();
      setNewCategoryName('');
      setShowCategoryForm(false);
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, addCategory: false }));
    }
  };

  const handleUpdateCategory = async () => {
    setIsLoading(prev => ({ ...prev, updateCategory: true }));
    try {
      await axios.put('/v1/category/updateCategory', {
        categoryId: editingCategory.id,
        name: editingCategory.name
      }, config);
      fetchCategories();
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, updateCategory: false }));
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    setIsLoading(prev => ({ ...prev, deleteCategory: true }));
    try {
      const response = await axios.delete(`/v1/category/deleteCategory/${categoryId}`, config);
      const message = response.data.data;
      setSnackbar({
        open: true,
        message: typeof message === 'string' ? message : 'Kategori başarıyla silindi',
        severity: 'success'
      });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      let errorMessage = 'Kategori bir projeye yada hakeme bağlı olduğu için silemezsiniz';
   
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsLoading(prev => ({ ...prev, deleteCategory: false }));
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const filteredProjects = [...projectsWithoutMentor, ...projectsWithMentor]
    .filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterStatus ? project.status === filterStatus : true)
    );

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const LoadingButton = ({ loading, children, ...props }) => (
    <Button
      disabled={loading}
      {...props}
    >
      {loading ? <CircularProgress size={24} /> : children}
    </Button>
  );

  const renderDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center', p: { xs: 2, md: 3 } }}>
            <Avatar sx={{ width: { xs: 40, md: 60 }, height: { xs: 40, md: 60 }, margin: '0 auto 16px auto', bgcolor: 'success.main' }}>
              <ProjectIcon />
            </Avatar>
            <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
              {projectsWithoutMentor.length}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
              Hakem Bekleyen Projeler
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center', p: { xs: 2, md: 3 } }}>
            <Avatar sx={{ width: { xs: 40, md: 60 }, height: { xs: 40, md: 60 }, margin: '0 auto 16px auto', bgcolor: 'warning.main' }}>
              <MentorIcon />
            </Avatar>
            <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
              {mentors.length}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
              Aktif Hakem
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center', p: { xs: 2, md: 3 } }}>
            <Avatar sx={{ width: { xs: 40, md: 60 }, height: { xs: 40, md: 60 }, margin: '0 auto 16px auto', bgcolor: 'primary.main' }}>
              <ProjectIcon />
            </Avatar>
            <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
              {projectsWithMentor.length}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
              Devam Eden Projeler
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderProjects = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
          Proje - Hakem Atamaları
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', mb: 2 }}>
          <TextField
            label="Proje Ara"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ width: { xs: '100%', md: '40%' }, mb: { xs: 2, md: 0 } }}
          />
          <FormControl variant="outlined" sx={{ width: { xs: '100%', md: '40%' } }}>
            <InputLabel>Durum Filtrele</InputLabel>
            <Select
              value={filterStatus}
              onChange={handleFilterChange}
              label="Durum Filtrele"
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="Devam Ediyor">Devam Ediyor</MenuItem>
              <MenuItem value="Hakem Bekleniyor">Hakem Bekleniyor</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Proje Adı</TableCell>
                <TableCell>Hakemler</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell align="right">İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {project.referees && project.referees.length > 0 ? (
                        project.referees.map(referee => (
                          <Chip
                            key={referee.id}
                            label={referee.name}
                            size="small"
                            color={referee.assessments && referee.assessments.length > 0 ? "success" : "primary"}
                            variant="outlined"
                            onDelete={() => handleRemoveMentor(project.id, referee.refereeId, referee.name)}
                            sx={{ 
                              '& .MuiChip-deleteIcon': {
                                color: 'error.main',
                                '&:hover': {
                                  color: 'error.dark'
                                }
                              }
                            }}
                          />
                        ))
                      ) : (
                        <Chip
                          label="Hakem Atanmamış"
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {project.referees?.length > 0 ? 'Devam Ediyor' : 'Hakem Bekleniyor'}
                  </TableCell>
                  <TableCell align="right">
                    <LoadingButton
                      loading={isLoading.assignMentor}
                      variant="contained"
                      size="small"
                      onClick={() => handleAssignMentor(project)}
                    >
                      Hakem Ata
                    </LoadingButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, value) => setCurrentPage(value)}
            color="primary"
          />
        </Box>
      </CardContent>
    </Card>
  );

  const handleAddSubCategory = async (e) => {
    e.preventDefault();
    setIsLoading(prev => ({ ...prev, addCategory: true }));
    try {
      await axios.post(`/v1/category/addSubCategory/${selectedParentCategory.id}`, 
        { name: newSubCategoryName }, 
        config
      );
      
      // Alt kategorileri ve ana kategorileri yeniden yükle
      await Promise.all([
        fetchSubCategories(selectedParentCategory.id),
        fetchCategories() // Ana kategorileri de güncelle
      ]);
      
      setNewSubCategoryName('');
      setShowSubCategoryForm(false);
      setSnackbar({
        open: true,
        message: 'Alt kategori başarıyla eklendi',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding sub-category:', error);
      setSnackbar({
        open: true,
        message: 'Alt kategori eklenirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setIsLoading(prev => ({ ...prev, addCategory: false }));
    }
  };

  const fetchSubCategories = async (parentId) => {
    try {
      const response = await axios.get(`/v1/category/getSubCategories/${parentId}`, config);
      const categoryData = response.data.data.find(cat => cat.id === parentId);
      
      if (categoryData) {
        setSubCategories(prev => ({
          ...prev,
          [parentId]: categoryData.subCategories
        }));
      }
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
      setSnackbar({
        open: true,
        message: 'Alt kategoriler yüklenirken bir hata oluştu',
        severity: 'error'
      });
    }
  };

  const toggleCategoryExpand = async (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
      await fetchSubCategories(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleStartEditingSubCategory = (subCategory, parentCategory) => {
    setEditingSubCategory({
      ...subCategory,
      parentId: parentCategory.id
    });
  };

  const handleUpdateSubCategory = async () => {
    setIsLoading(prev => ({ ...prev, updateCategory: true }));
    try {
      await axios.put(`/v1/category/sub-categories/${editingSubCategory.id}`, {
        name: editingSubCategory.name
      }, config);
      
      // Alt kategorileri yeniden yükle
      await fetchSubCategories(editingSubCategory.parentId);
      setEditingSubCategory(null);
      
      setSnackbar({
        open: true,
        message: 'Alt kategori başarıyla güncellendi',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating sub-category:', error);
      setSnackbar({
        open: true,
        message: 'Alt kategori güncellenirken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setIsLoading(prev => ({ ...prev, updateCategory: false }));
    }
  };

  const handleDeleteSubCategory = async (subCategoryId, parentId) => {
    if (window.confirm('Alt kategoriyi silmek istediğinize emin misiniz?')) {
      setIsLoading(prev => ({ ...prev, deleteCategory: true }));
      try {
        await axios.delete(`/v1/category/sub-categories/${subCategoryId}`, config);
        
        // Alt kategorileri ve ana kategorileri yeniden yükle
        await Promise.all([
          fetchSubCategories(parentId),
          fetchCategories()
        ]);
        
        setSnackbar({
          open: true,
          message: 'Alt kategori başarıyla silindi',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting sub-category:', error);
        setSnackbar({
          open: true,
          message: 'Alt kategori bir projeye bağlı olduğu için silinemedi',
          severity: 'error'
        });
      } finally {
        setIsLoading(prev => ({ ...prev, deleteCategory: false }));
      }
    }
  };

  const renderCategories = () => (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Kategori Yönetimi
          </Typography>
          {!showCategoryForm && (
            <Button
              variant="contained"
              onClick={() => setShowCategoryForm(true)}
            >
              Yeni Kategori Ekle
            </Button>
          )}
        </Box>

        {showCategoryForm && (
          <Box component="form" onSubmit={handleAddCategory} sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Kategori Adı"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <LoadingButton
                    loading={isLoading.addCategory}
                    type="submit"
                    variant="contained"
                    color="primary"
                  >
                    Kaydet
                  </LoadingButton>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setShowCategoryForm(false);
                      setNewCategoryName('');
                    }}
                  >
                    İptal
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Kategori Adı</TableCell>
                <TableCell>Alt Kategoriler</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <React.Fragment key={category.id}>
                  <TableRow>
                    <TableCell>
                      {editingCategory?.id === category.id ? (
                        <TextField
                          fullWidth
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory({
                            ...editingCategory,
                            name: e.target.value
                          })}
                        />
                      ) : category.name}
                    </TableCell>
                    <TableCell>
                      {category.hasSubCategories && (
                        <Button
                          size="small"
                          onClick={() => toggleCategoryExpand(category.id)}
                          startIcon={expandedCategories.has(category.id) ? 
                            <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        >
                          {expandedCategories.has(category.id) ? 'Gizle' : 'Göster'}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            setSelectedParentCategory(category);
                            setShowSubCategoryForm(true);
                          }}
                        >
                          Alt Kategori Ekle
                        </Button>
                        {editingCategory?.id === category.id ? (
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <LoadingButton
                              loading={isLoading.updateCategory}
                              size="small"
                              variant="contained"
                              onClick={handleUpdateCategory}
                            >
                              Kaydet
                            </LoadingButton>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => setEditingCategory(null)}
                            >
                              İptal
                            </Button>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <LoadingButton
                              loading={isLoading.deleteCategory}
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              Sil
                            </LoadingButton>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                  
                  {/* Alt kategoriler */}
                  {expandedCategories.has(category.id) && subCategories[category.id]?.map(subCategory => (
                    <TableRow key={subCategory.id} sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell sx={{ pl: 4 }}>
                        {editingSubCategory?.id === subCategory.id ? (
                          <TextField
                            fullWidth
                            value={editingSubCategory.name}
                            onChange={(e) => setEditingSubCategory({
                              ...editingSubCategory,
                              name: e.target.value
                            })}
                            size="small"
                          />
                        ) : (
                          `└─ ${subCategory.name}`
                        )}
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {editingSubCategory?.id === subCategory.id ? (
                            <>
                              <LoadingButton
                                size="small"
                                variant="contained"
                                onClick={handleUpdateSubCategory}
                                loading={isLoading.updateCategory}
                              >
                                Kaydet
                              </LoadingButton>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => setEditingSubCategory(null)}
                              >
                                İptal
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleStartEditingSubCategory(subCategory, category)}
                              >
                                Düzenle
                              </Button>
                              <LoadingButton
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleDeleteSubCategory(subCategory.id, category.id)}
                                loading={isLoading.deleteCategory}
                              >
                                Sil
                              </LoadingButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Alt kategori ekleme formu */}
        <Dialog 
          open={showSubCategoryForm} 
          onClose={() => {
            setShowSubCategoryForm(false);
            setNewSubCategoryName('');
          }}
        >
          <DialogTitle>
            Alt Kategori Ekle: {selectedParentCategory?.name}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Alt Kategori Adı"
              fullWidth
              value={newSubCategoryName}
              onChange={(e) => setNewSubCategoryName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSubCategoryForm(false)}>
              İptal
            </Button>
            <LoadingButton
              loading={isLoading.addCategory}
              onClick={handleAddSubCategory}
              variant="contained"
            >
              Ekle
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );

  const renderMentors = () => (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Hakem Yönetimi
            </Typography>
            {!showMentorForm && (
              <Button
                variant="contained"
                startIcon={<MentorIcon />}
                onClick={() => setShowMentorForm(true)}
              >
                Yeni Hakem Ekle
              </Button>
            )}
          </Box>

          {showMentorForm && (
            <Box component="form" onSubmit={handleAddMentor}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Ad Soyad"
                    name="name"
                    value={newMentorData.name}
                    onChange={handleMentorInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="E-posta"
                    name="mail"
                    type="email"
                    value={newMentorData.mail}
                    onChange={handleMentorInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Uzmanlık Alanı</InputLabel>
                    <Select
                      name="categoryId"
                      value={newMentorData.categoryId}
                      onChange={handleMentorInputChange}
                      label="Uzmanlık Alanı"
                    >
                      {categories.map(category => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                 <TextField
                   fullWidth
                   label="Telefon Numarası"
                   name="phoneNumber"
                   value={newMentorData.phoneNumber}
                   onChange={handleMentorInputChange}
                   onKeyDown={handlePhoneNumberKeyDown} // +90 kısmını koru
                   error={!!error.phoneNumber}
                   helperText={error.phoneNumber}
                   required
                   sx={{ backgroundColor: 'white' }}
                 />
               </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <LoadingButton
                      loading={isLoading.addMentor}
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      Kaydet
                    </LoadingButton>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setShowMentorForm(false);
                        setNewMentorData({ name: '', mail: '', categoryId: '', phoneNumber: '' });
                      }}
                    >
                      İptal
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Hakem Durumları
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ad Soyad</TableCell>
                  <TableCell>E-posta</TableCell>
                  <TableCell>Uzmanlık</TableCell>
                  <TableCell>Aktif Proje Sayısı</TableCell>
                  <TableCell align="right">İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mentors.map((mentor) => (
                  <TableRow key={mentor.id}>
                    <TableCell>{mentor.name}</TableCell>
                    <TableCell>{mentor.email}</TableCell>
                    <TableCell>{mentor.categoryName}</TableCell>
                    <TableCell>{mentor.projectCount}</TableCell>
                    <TableCell align="right">
                      <LoadingButton
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteReferee(mentor.id, mentor.name)}
                        startIcon={<DeleteIcon />}
                      >
                        Sil
                      </LoadingButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog
        open={deleteRefereeDialog.open}
        onClose={() => setDeleteRefereeDialog({ open: false, refereeId: null, refereeName: '' })}
      >
        <DialogTitle>
          Hakem Silme İşlemi
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography color="error" paragraph>
              DİKKAT: Bu işlem geri alınamaz!
            </Typography>
            <Typography>
              {deleteRefereeDialog.refereeName} isimli hakemi silmek istediğinize emin misiniz?
            </Typography>
            <Typography color="warning.main" sx={{ mt: 2 }}>
              Hakeme ait tüm değerlendirmeler kalıcı olarak silinecektir.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteRefereeDialog({ open: false, refereeId: null, refereeName: '' })}
          >
            İptal
          </Button>
          <LoadingButton
            onClick={confirmDeleteReferee}
            color="error"
            variant="contained"
            autoFocus
          >
            Evet, Sil
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );

  const handleDeleteReferee = async (refereeId, refereeName) => {
    setDeleteRefereeDialog({
      open: true,
      refereeId,
      refereeName
    });
  };

  const confirmDeleteReferee = async () => {
    try {
      await axios.delete(`/v1/referee/deleteReferee/${deleteRefereeDialog.refereeId}`, config);
      
      setSnackbar({
        open: true,
        message: 'Hakem başarıyla silindi',
        severity: 'success'
      });
      
      // Hakem listesini güncelle
      fetchMentors();
      
    } catch (error) {
      console.error('Error deleting referee:', error);
      setSnackbar({
        open: true,
        message: 'Hakem projeye bağlı olduğu için silinemedi',
        severity: 'error'
      });
    } finally {
      setDeleteRefereeDialog({ open: false, refereeId: null, refereeName: '' });
    }
  };

  const renderAssignmentDialog = () => (
    <Dialog open={openAssignDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
      <DialogTitle>
        Hakem Ata: {selectedProject?.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {assignmentError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {assignmentError}
            </Alert>
          )}

          {selectedProject?.referees && selectedProject.referees.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Mevcut Hakemler
              </Typography>
              <List>
                {selectedProject.referees.map((referee) => (
                  <ListItem key={referee.id}>
                    <ListItemText 
                      primary={referee.name}
                      secondary={
                        referee.assessments && referee.assessments.length > 0
                          ? "Değerlendirme yapılmış" 
                          : "Değerlendirme bekleniyor"
                      }
                    />
                    <ListItemSecondaryAction>
                      <LoadingButton
                        edge="end"
                        onClick={() => handleRemoveMentor(
                          selectedProject.id, 
                          referee.refereeId, 
                          referee.name
                        )}
                        loading={isLoading.removeMentor}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </LoadingButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          <FormControl fullWidth>
            <InputLabel>Yeni Hakem Seç</InputLabel>
            <Select
              value={selectedMentor}
              onChange={(e) => {
                setSelectedMentor(e.target.value);
                setAssignmentError(null);
              }}
              label="Yeni Hakem Seç"
            >
              {mentors
                .filter(mentor => 
                  !selectedProject?.referees?.some(ref => ref.id === mentor.id)
                )
                .map(mentor => (
                  <MenuItem key={mentor.id} value={mentor.id}>
                    {mentor.name} - {mentor.categoryName}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>İptal</Button>
        <LoadingButton
          onClick={handleSaveAssignment}
          loading={isLoading.assignMentor}
          variant="contained"
          disabled={!selectedMentor || Boolean(assignmentError)}
        >
          Ata
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', mb: 3 }}>
        <Card sx={{ flex: 1, mr: { xs: 0, md: 2 }, mb: { xs: 2, md: 0 } }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
              Yönetici Paneli
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-around' }}>
              <Button
                variant={activeTab === 'dashboard' ? 'contained' : 'text'}
                startIcon={<DashboardIcon />}
                onClick={() => setActiveTab('dashboard')}
                sx={{ mb: { xs: 1, md: 0 } }}
              >
                Anasayfa
              </Button>
              <Button
                variant={activeTab === 'projects' ? 'contained' : 'text'}
                startIcon={<ProjectIcon />}
                onClick={() => setActiveTab('projects')}
                sx={{ mb: { xs: 1, md: 0 } }}
              >
                Proje Atamaları
              </Button>
              <Button
                variant={activeTab === 'mentors' ? 'contained' : 'text'}
                startIcon={<MentorIcon />}
                onClick={() => setActiveTab('mentors')}
                sx={{ mb: { xs: 1, md: 0 } }}
              >
                Hakemler
              </Button>
              <Button
                variant={activeTab === 'categories' ? 'contained' : 'text'}
                startIcon={<ProjectIcon />}
                onClick={() => setActiveTab('categories')}
                sx={{ mb: { xs: 1, md: 0 } }}
              >
                Kategoriler
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'projects' && renderProjects()}
          {activeTab === 'mentors' && renderMentors()}
          {activeTab === 'categories' && renderCategories()}
        </Grid>
      </Grid>
      {renderAssignmentDialog()}
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

export default AdminPage;