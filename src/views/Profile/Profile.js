import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Divider,
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
    name: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@example.com",
    phone: "+90 555 123 4567",
    department: "Bilgisayar Mühendisliği",
    studentId: "20201701001",
    role: "Öğrenci",
    avatar: "AY",
  });

  const [editData, setEditData] = React.useState(userData);

  const handleEdit = () => {
    setEditData(userData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(userData);
  };

  const handleSave = () => {
    setUserData(editData);
    setIsEditing(false);
    // Burada API çağrısı yapılacak
    console.log('Güncellenecek veriler:', editData);
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

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
                {userData.avatar}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {userData.name}
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
                        name="name"
                        label="Ad Soyad"
                        value={editData.name}
                        onChange={handleChange}
                      />
                    ) : (
                      <Typography>{userData.name}</Typography>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="studentId"
                        label="Öğrenci Numarası"
                        value={editData.studentId}
                        onChange={handleChange}
                      />
                    ) : (
                      <Typography>{userData.studentId}</Typography>
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
                        name="phone"
                        label="Telefon"
                        value={editData.phone}
                        onChange={handleChange}
                      />
                    ) : (
                      <Typography>{userData.phone}</Typography>
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