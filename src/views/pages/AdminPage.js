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
    email: '',
    expertise: '',
    phone: ''
  });
  const [projectsWithMentor, setProjectsWithMentor] = useState([]);
  const [projectsWithoutMentor, setProjectsWithoutMentor] = useState([]);
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    fetchMentors();
    fetchAllProjects();
  }, []);

  const fetchAllProjects = async () => {
    try {
      // Fetch both types of projects in parallel
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
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await axios.get('/referee');
      setMentors(response.data.data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
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
      try {
        await axios.put(`/v1/project/admin/assignMentorToProject/admin/${selectedProject.id}/${selectedMentor}`);
        
        // Refresh data after successful assignment
        await Promise.all([
          fetchAllProjects(),
          fetchMentors()
        ]);

        handleCloseDialog();
      } catch (error) {
        console.error('Error assigning mentor:', error);
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
    try {
      const response = await axios.post('/referee/addReferee', newMentorData);
      setMentors([...mentors, response.data.data]);
      setNewMentorData({ name: '', email: '', expertise: '', phone: '' });
      setShowMentorForm(false); // Close the form
    } catch (error) {
      console.error('Error adding mentor:', error);
    }
  };

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

      <Grid item xs={12}>
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
                      name="email"
                      type="email"
                      value={newMentorData.email}
                      onChange={handleMentorInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Uzmanlık Alanı"
                      name="expertise"
                      value={newMentorData.expertise}
                      onChange={handleMentorInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Telefon"
                      name="phone"
                      value={newMentorData.phone}
                      onChange={handleMentorInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                      >
                        Kaydet
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setShowMentorForm(false);
                          setNewMentorData({ name: '', email: '', expertise: '', phone: '' });
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
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAssignMentor(project)}
                      disabled={project.mentor !== null}
                    >
                      Mentör Ata
                    </Button>
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
    <Card>
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
                  <TableCell>{mentor.expertise}</TableCell>
                  <TableCell>{mentor.activeProjects}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
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
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={9}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'projects' && renderProjects()}
          {activeTab === 'mentors' && renderMentors()}
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
                  {mentor.name} ({mentor.expertise}) - Aktif Proje: {mentor.activeProjects}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button 
            onClick={handleSaveAssignment} 
            variant="contained"
            disabled={!selectedMentor}
          >
            Ata
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;