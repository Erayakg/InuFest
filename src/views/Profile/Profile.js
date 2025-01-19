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
    studentNumber: "",
    department: "",
    role: "Öğrenci",
    faculty: "",
    classNumber: "",
  });

  const [editData, setEditData] = React.useState(userData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // LocalStorage'dan kullanıcı ID'sini al
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // Kullanıcı verilerini çek
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('Kullanıcı bilgisi bulunamadı');
        setLoading(false);
        return;
      }

      if (!token) {
        setError('Authorization token not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`/student/getStudentById/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          const profileData = response.data.data;
          const newUserData = {
            username: profileData.username || "",
            email: profileData.email || "",
            phoneNumber: profileData.phoneNumber || "",
            studentNumber: profileData.studentNumber || "",
            department: profileData.deparment || "",
            role: "Öğrenci",
            faculty: profileData.faculty || "",
            classNumber: profileData.classNumber || "",
          };
          
          setUserData(newUserData);
          setEditData(newUserData);
        }
      } catch (err) {
        console.error('Profil verisi çekilirken hata:', err);
        setError('Profil bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, token]);

  const handleEdit = () => {
    setEditData(userData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(userData);
  };

  const handleSave = async () => {
    if (!token) {
      alert('Authorization token not found');
      return;
    }

    try {
      const response = await axios.put(`/student/update/${userId}`, editData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        {/* Profil Kartı */}
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: '16px',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-5px)'
            }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  margin: '0 auto 24px auto',
                  fontSize: '2.5rem',
                  bgcolor: 'primary.main',
                  border: '4px solid #fff',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                {userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {userData.username}
              </Typography>
              <Typography variant="body1" color="primary" gutterBottom sx={{ mb: 1 }}>
                {userData.role}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                {userData.department}
              </Typography>
              {!isEditing && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  sx={{ 
                    mt: 2,
                    borderRadius: '25px',
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}
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
          <Card sx={{ 
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: '16px'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 4,
                borderBottom: '2px solid #f0f0f0',
                pb: 2
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Kişisel Bilgiler
                </Typography>
                {isEditing && (
                  <Box>
                    <IconButton 
                      color="primary" 
                      onClick={handleSave}
                      sx={{ 
                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                        mr: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.2)'
                        }
                      }}
                    >
                      <SaveIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={handleCancel}
                      sx={{ 
                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.2)'
                        }
                      }}
                    >
                      <CancelIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>

              <Grid container spacing={6}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    p: 2,
                    borderRadius: '12px'
                  }}>
                    <BadgeIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="username"
                        label="Ad Soyad"
                        value={editData.username}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff'
                          }
                        }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: '1.1rem' }}>{userData.username}</Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    p: 2,
                    borderRadius: '12px'
                  }}>
                    <BadgeIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="faculty"
                        label="Fakülte"
                        value={editData.faculty}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff'
                          }
                        }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: '1.1rem' }}>{userData.faculty}</Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    p: 2,
                    borderRadius: '12px'
                  }}>
                    <BadgeIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="department"
                        label="Bölüm"
                        value={editData.department}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff'
                          }
                        }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: '1.1rem' }}>{userData.department}</Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    p: 2,
                    borderRadius: '12px'
                  }}>
                    <SchoolIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="studentNumber"
                        label="Öğrenci Numarası"
                        value={editData.studentNumber}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff'
                          }
                        }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: '1.1rem' }}>{userData.studentNumber}</Typography>
                    )}
                  </Box>
                </Grid>

               
                

                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    p: 2,
                    borderRadius: '12px'
                  }}>
                    <PhoneIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="phoneNumber"
                        label="Telefon"
                        value={editData.phoneNumber}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff'
                          }
                        }}
                      />
                      
                      
                    ) : (
                      <Typography sx={{ fontSize: '1.1rem' }}>{userData.phoneNumber}</Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    p: 2,
                    borderRadius: '12px'
                  }}>
                    <EmailIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="email"
                        label="E-posta"
                        value={editData.email}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff'
                          }
                        }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: '1.1rem' }}>{userData.email}</Typography>
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