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
  TextField,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Badge as BadgeIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const Profile = () => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [userData, setUserData] = React.useState({
    username: "",
    email: "",
    phoneNumber: "",
    department: "",
    studentNumber: "",
    role: "",
    faculty: "",
    classNumber: "",
  });

  const [editData, setEditData] = React.useState(userData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // LocalStorage'dan kullanıcı ID'sini al
  const userId = localStorage.getItem('userId');

  // Kullanıcı verilerini çek
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('Kullanıcı bilgisi bulunamadı');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/student/getStudentById/${userId}`);
        
        if (response.data.success) {
          const profileData = response.data.data;
          setUserData(profileData);
          setEditData(profileData);
        }
      } catch (err) {
        console.error('Profil verisi çekilirken hata:', err);
        setError('Profil bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleEdit = () => {
    setEditData(userData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(userData);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`/student/update/${userId}`, editData);
      
      if (response.data.success) {
        setUserData(editData);
        setIsEditing(false);
        alert('Profil başarıyla güncellendi');
      }
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      alert('Profil güncellenirken bir hata oluştu');
    }
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  // Kullanıcı ID'si yoksa hata göster
  if (!userId) {
    return <div>Oturum bulunamadı. Lütfen tekrar giriş yapın.</div>;
  }

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Profil Kartı */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  margin: '0 auto 16px auto',
                  fontSize: '2rem',
                  bgcolor: 'primary.main'
                }}
              >
                {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {userData.username}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {userData.role}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {userData.department}
              </Typography>
              {!isEditing && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  sx={{ mt: 2 }}
                  onClick={handleEdit}
                >
                  Profili Düzenle
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Detay Kartı */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Kişisel Bilgiler</Typography>
                {isEditing && (
                  <Box>
                    <IconButton color="primary" onClick={handleSave}>
                      <SaveIcon />
                    </IconButton>
                    <IconButton color="error" onClick={handleCancel}>
                      <CancelIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BadgeIcon sx={{ mr: 2, color: 'primary.main' }} />
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="username"
                        label="Ad Soyad"
                        value={editData.username}
                        onChange={handleChange}
                      />
                    ) : (
                      <Typography>{userData.username}</Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="studentNumber"
                        label="Öğrenci Numarası"
                        value={editData.studentNumber}
                        onChange={handleChange}
                      />
                    ) : (
                      <Typography>{userData.studentNumber}</Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="email"
                        label="E-posta"
                        value={editData.email}
                        onChange={handleChange}
                      />
                    ) : (
                      <Typography>{userData.email}</Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="phoneNumber"
                        label="Telefon"
                        value={editData.phoneNumber}
                        onChange={handleChange}
                      />
                    ) : (
                      <Typography>{userData.phoneNumber}</Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile; 