import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Chip,
  CircularProgress,
  Container,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Person as PersonIcon,
  Category as CategoryIcon,
  Assignment as AssignmentIcon,
  ViewList as ViewListIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RefereePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refereeData, setRefereeData] = useState({
    id: null,
    name: '',
    categoryName: '',
    projectCount: 0,
    email: ''
  });

  useEffect(() => {
    fetchRefereeData();
  }, []);

  const fetchRefereeData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const response = await axios.get(`/referee/referee/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setRefereeData(response.data.data);
        console.log(response.data.data);
      }
    } catch (error) {
      console.error('Hakem bilgileri alınamadı:', error);
      setError('Bilgiler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profil Kartı */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    bgcolor: 'primary.main'
                  }}
                >
                  <PersonIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {refereeData.name}
                </Typography>
              </Box>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="E-posta"
                    secondary={refereeData.email}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CategoryIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Kategori"
                    secondary={refereeData.categoryName}
                  />
                </ListItem>

                
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* İstatistikler ve Eylemler */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Proje Sayısı Kartı */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'primary.light' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <AssignmentIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4">
                        {refereeData.projectCount}
                      </Typography>
                      <Typography variant="subtitle1">
                        Toplam Proje
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Hızlı Erişim Kartı */}
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Hızlı Erişim
                  </Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Button
                      variant="contained"
                      startIcon={<ViewListIcon />}
                      onClick={() => navigate('/referee/projects')}
                    >
                      Projeleri Görüntüle
                    </Button>
                    
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RefereePage;