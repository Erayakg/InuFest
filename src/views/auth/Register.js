import React, { useState } from "react";
import {
  Grid,
  Box,
  Card,
  TextField,
  Button,
  Typography,
  MenuItem,
  FormControl,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    faculty: "",
    department: "",
    studentNumber: "",
    grade: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // API çağrısı burada yapılacak
    console.log(formData);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Card sx={{ p: 4, maxWidth: 600, width: "100%" }}>
        <Typography variant="h4" textAlign="center" mb={4}>
          Öğrenci Kayıt Formu
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kullanıcı Adı"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Şifre"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="E-posta"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ad"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Soyad"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Fakülte"
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                required
              >
                <MenuItem value="muhendislik">Mühendislik Fakültesi</MenuItem>
                <MenuItem value="fen">Fen Fakültesi</MenuItem>
                <MenuItem value="edebiyat">Edebiyat Fakültesi</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Bölüm"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <MenuItem value="bilgisayar">Bilgisayar Mühendisliği</MenuItem>
                <MenuItem value="elektrik">Elektrik-Elektronik Mühendisliği</MenuItem>
                <MenuItem value="makine">Makine Mühendisliği</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Öğrenci Numarası"
                name="studentNumber"
                value={formData.studentNumber}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Sınıf"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
              >
                <MenuItem value="1">1. Sınıf</MenuItem>
                <MenuItem value="2">2. Sınıf</MenuItem>
                <MenuItem value="3">3. Sınıf</MenuItem>
                <MenuItem value="4">4. Sınıf</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                Kayıt Ol
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="text"
                fullWidth
                onClick={() => navigate("/login")}
              >
                Zaten hesabınız var mı? Giriş yapın
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Box>
  );
};

export default Register; 