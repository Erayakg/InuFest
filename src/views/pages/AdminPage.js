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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as ProjectIcon,
  Person as MentorIcon,
} from '@mui/icons-material';

const AdminPage = () => {
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
    deleteCategory: false
  });

  useEffect(() => {
    fetchMentors();
    fetchAllProjects();
    fetchCategories();
  }, []);

  const fetchAllProjects = async () => {
    setIsLoading(prev => ({ ...prev, fetchData: true }));
    try {
      const [withMentorRes, withoutMentorRes] = await Promise.all([
        axios.get('/v1/project/admin/withReferee'),
        axios.get('/v1/project/admin/withoutReferee')
      ]);

      const withMentor = withMentorRes.data.data.map(project => ({
        id: project.id,
        name: project.name,
        creator: project.creator,
        mentor: project.referee?.name,
        status: 'Devam Ediyor'
      }));

      const withoutMentor = withoutMentorRes.data.data.map(project => ({
        id: project.id,
        name: project.name,
        creator: project.creator,
        mentor: null,
        status: 'Mentör Bekleniyor'
      }));

      setProjectsWithMentor(withMentor);
      setProjectsWithoutMentor(withoutMentor);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, fetchData: false }));
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await axios.get('/referee');
      setMentors(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/category');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAssignMentor = (project) => {
    setSelectedProject(project);
    setSelectedMentor('');
    setOpenAssignDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenAssignDialog(false);
    setSelectedProject(null);
    setSelectedMentor('');
  };

  const handleSaveAssignment = async () => {
    if (selectedMentor && selectedProject) {
      setIsLoading(prev => ({ ...prev, assignMentor: true }));
      try {
        await axios.put(`/v1/project/admin/assignMentorToProject/admin/${selectedProject.id}/${selectedMentor}`);
        await Promise.all([fetchAllProjects(), fetchMentors()]);
        handleCloseDialog();
      } catch (error) {
        console.error('Error assigning mentor:', error);
      } finally {
        setIsLoading(prev => ({ ...prev, assignMentor: false }));
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
      const response = await axios.post('/referee/addReferee', newMentorData);
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
      await axios.post('/category/addcategory', { name: newCategoryName });
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
      await axios.put(`/category/update/${editingCategory.id}`, {
        name: editingCategory.name
      });
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
      await axios.delete(`/category/deletecategory/${categoryId}`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, deleteCategory: false }));
    }
  };

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
              Mentör Bekleyen Projeler
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
              Aktif Mentör
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
          Proje - Mentör Atamaları
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Proje Adı</TableCell>
                <TableCell>Oluşturan</TableCell>
                <TableCell>Mevcut Mentör</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell align="right">İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...projectsWithoutMentor, ...projectsWithMentor].map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.creator}</TableCell>
                  <TableCell>{project.mentor || 'Atanmamış'}</TableCell>
                  <TableCell>{project.status}</TableCell>
                  <TableCell align="right">
                    <LoadingButton
                      loading={isLoading.assignMentor}
                      variant="contained"
                      size="small"
                      onClick={() => handleAssignMentor(project)}
                      disabled={project.mentor !== null}
                    >
                      Mentör Ata
                    </LoadingButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
              Mentör Yönetimi
            </Typography>
            {!showMentorForm && (
              <Button
                variant="contained"
                startIcon={<MentorIcon />}
                onClick={() => setShowMentorForm(true)}
              >
                Yeni Mentör Ekle
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
            Mentör Durumları
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

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Yönetici Paneli
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant={activeTab === 'dashboard' ? 'contained' : 'text'}
                  startIcon={<DashboardIcon />}
                  onClick={() => setActiveTab('dashboard')}
                  fullWidth
                >
                  Dashboard
                </Button>
                <Button
                  variant={activeTab === 'projects' ? 'contained' : 'text'}
                  startIcon={<ProjectIcon />}
                  onClick={() => setActiveTab('projects')}
                  fullWidth
                >
                  Proje Atamaları
                </Button>
                <Button
                  variant={activeTab === 'mentors' ? 'contained' : 'text'}
                  startIcon={<MentorIcon />}
                  onClick={() => setActiveTab('mentors')}
                  fullWidth
                >
                  Mentörler
                </Button>
                <Button
                  variant={activeTab === 'categories' ? 'contained' : 'text'}
                  startIcon={<ProjectIcon />}
                  onClick={() => setActiveTab('categories')}
                  fullWidth
                >
                  Kategoriler
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={9}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'projects' && renderProjects()}
          {activeTab === 'mentors' && renderMentors()}
          {activeTab === 'categories' && renderCategories()}
        </Grid>
      </Grid>

      <Dialog open={openAssignDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          Mentör Ata: {selectedProject?.name}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Mentör Seç</InputLabel>
            <Select
              value={selectedMentor}
              label="Mentör Seç"
              onChange={(e) => setSelectedMentor(e.target.value)}
            >
              {mentors.map(mentor => (
                <MenuItem 
                  key={mentor.id} 
                  value={mentor.id}
                  disabled={mentor.activeProjects >= 3}
                >
                  {mentor.name} {mentor.expertise}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <LoadingButton
            loading={isLoading.assignMentor}
            onClick={handleSaveAssignment}
            variant="contained"
            disabled={!selectedMentor}
          >
            Ata
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;