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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as ProjectIcon,
  Person as MentorIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const AdminPage = () => {
  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [showMentorForm, setShowMentorForm] = useState(false);
  const [newMentorData, setNewMentorData] = useState({
    name: '',
    mail: '',
    categoryId: '',
    phoneNumber: ''
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
              assessment: referee.assessment
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
      const response = await axios.get('/referee', config);
      setMentors(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/category', config);
      setCategories(response.data.data);
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
    console.log('Removing mentor with params:', { projectId, refereeId, refereeName });
    
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
    setNewMentorData({
      ...newMentorData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddMentor = async (e) => {
    e.preventDefault();
    setIsLoading(prev => ({ ...prev, addMentor: true }));
    try {
      const response = await axios.post('/referee/addReferee', newMentorData, config);
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
      await axios.post('/category/addCategory', { name: newCategoryName }, config);
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
      await axios.put('/category/updateCategory', {
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
      await axios.delete(`/category/deleteCategory/${categoryId}`, config);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
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
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ width: 60, height: 60, margin: '0 auto 16px auto', bgcolor: 'success.main' }}>
              <ProjectIcon />
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {projectsWithoutMentor.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Hakem Bekleyen Projeler
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ width: 60, height: 60, margin: '0 auto 16px auto', bgcolor: 'warning.main' }}>
              <MentorIcon />
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {mentors.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Aktif Hakem
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Avatar sx={{ width: 60, height: 60, margin: '0 auto 16px auto', bgcolor: 'primary.main' }}>
              <ProjectIcon />
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {projectsWithMentor.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
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
        <Typography variant="h6" gutterBottom>
          Proje - Hakem Atamaları
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            label="Proje Ara"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ width: '40%' }}
          />
          <FormControl variant="outlined" sx={{ width: '40%' }}>
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
                            color={referee.assessment ? "success" : "primary"}
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
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
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
                  <TableCell align="right">
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
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setEditingCategory(category)}
                        >
                          Düzenle
                        </Button>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Telefon"
                    name="phoneNumber"
                    value={newMentorData.phoneNumber}
                    onChange={handleMentorInputChange}
                    required
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
                  <TableCell>Uzmanlık</TableCell>
                  <TableCell>Aktif Proje Sayısı</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mentors.map((mentor) => (
                  <TableRow key={mentor.id}>
                    <TableCell>{mentor.name}</TableCell>
                    <TableCell>{mentor.categoryName}</TableCell>
                    <TableCell>{mentor.projectCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );

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
                        referee.assessment 
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Card sx={{ flex: 1, mr: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Yönetici Paneli
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
              <Button
                variant={activeTab === 'dashboard' ? 'contained' : 'text'}
                startIcon={<DashboardIcon />}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant={activeTab === 'projects' ? 'contained' : 'text'}
                startIcon={<ProjectIcon />}
                onClick={() => setActiveTab('projects')}
              >
                Proje Atamaları
              </Button>
              <Button
                variant={activeTab === 'mentors' ? 'contained' : 'text'}
                startIcon={<MentorIcon />}
                onClick={() => setActiveTab('mentors')}
              >
                Hakemler
              </Button>
              <Button
                variant={activeTab === 'categories' ? 'contained' : 'text'}
                startIcon={<ProjectIcon />}
                onClick={() => setActiveTab('categories')}
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