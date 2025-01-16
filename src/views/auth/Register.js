import React, { useState } from "react";
import { Grid, Box, Card, TextField, Button, Typography, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    email: "",
    studentNumber: "",
    faculty: "",
    department: "",
    classNumber: "",
    phoneNumber: "",
  });
  const [error, setError] = useState({});
  const [open, setOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newError = {};
    if (!formData.userName) newError.userName = "Kullanıcı adı gerekli";
    if (!formData.password || formData.password.length < 6) newError.password = "Şifre en az 6 karakter olmalı";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newError.email = "Geçerli bir e-posta girin";
    if (!formData.phoneNumber || !/^[0-9]{11}$/.test(formData.phoneNumber)) newError.phoneNumber = "Telefon numarası 11 haneli olmalı";
    if (!formData.studentNumber || !/^[0-9]{11}$/.test(formData.studentNumber)) newError.studentNumber = "Öğrenci numarası 11 haneli olmalı";
    if (!formData.faculty) newError.faculty = "Fakülte seçimi gerekli";
    if (!formData.department) newError.department = "Bölüm seçimi gerekli";
    if (!formData.classNumber) newError.classNumber = "Sınıf seçimi gerekli";
    return newError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newError = validate();
    if (Object.keys(newError).length > 0) {
      setError(newError);
      return;
    }
    setError({});

    try {
      const response = await fetch("http://localhost:8080/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const sendCodeResponse = await fetch(`http://localhost:8080/v1/verification/send-email-code?email=${formData.email}`, {
          method: "POST",
        });

        if (sendCodeResponse.ok) {
          navigate("/verify-email", { state: { email: formData.email } });
        } else {
          setPopupMessage("Doğrulama kodu gönderilemedi.");
          setOpen(true);
        }
      } else {
        setPopupMessage("Kayıt başarısız: " + (data.message || "Bilinmeyen bir hata oluştu."));
        setOpen(true);
      }
    } catch (error) {
      console.error("Kayıt işlemi sırasında hata oluştu:", error);
      setPopupMessage("Kayıt işlemi sırasında hata oluştu.");
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
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
                label="Ad-Soyad"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                error={!!error.userName}
                helperText={error.userName}
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
                error={!!error.password}
                helperText={error.password}
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
                error={!!error.email}
                helperText={error.email}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Telefon Numarası"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={!!error.phoneNumber}
                helperText={error.phoneNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Öğrenci Numarası"
                name="studentNumber"
                value={formData.studentNumber}
                onChange={handleChange}
                error={!!error.studentNumber}
                helperText={error.studentNumber}
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
                error={!!error.faculty}
                helperText={error.faculty}
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
                error={!!error.department}
                helperText={error.department}
                required
              >
                <MenuItem value="bilgisayar">Bilgisayar Mühendisliği</MenuItem>
                <MenuItem value="elektrik">Elektrik-Elektronik Mühendisliği</MenuItem>
                <MenuItem value="makine">Makine Mühendisliği</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Sınıf"
                name="classNumber"
                value={formData.classNumber}
                onChange={handleChange}
                error={!!error.classNumber}
                helperText={error.classNumber}
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

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Hata"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {popupMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Register;