import React, { useState } from "react";
import { Grid, Box, Card, TextField, Button, Typography, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    confirmPassword: "",
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
  const [isLoading, setIsLoading] = useState(false);

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
    if (formData.password !== formData.confirmPassword) newError.confirmPassword = "Şifreler eşleşmiyor";
    if (!formData.email || !/\S+@ogr\.inonu\.edu\.tr$/.test(formData.email)) newError.email = "Geçerli bir öğrenci e-posta adresi girin (@ogr.inonu.edu.tr)";
    if (!formData.phoneNumber || !/^[0-9]{11}$/.test(formData.phoneNumber)) newError.phoneNumber = "Telefon numarası 11 haneli olmalı";
    if (!formData.studentNumber || !/^[0-9]{11}$/.test(formData.studentNumber)) newError.studentNumber = "Öğrenci numarası 11 haneli olmalı";
    if (!formData.faculty) newError.faculty = "Fakülte girişi gerekli";
    if (!formData.department) newError.department = "Bölüm girişi gerekli";
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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Card 
        sx={{ 
          p: 4, 
          maxWidth: 600, 
          width: "100%",
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.95)',
        }}
      >
        <Typography 
          variant="h4" 
          textAlign="center" 
          mb={4}
          sx={{
            color: '#2c3e50',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          Öğrenci Kayıt Formu
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ad-Soyad"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                error={!!error.userName}
                helperText={error.userName}
                required
                sx={{ backgroundColor: 'white' }}
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
                sx={{ backgroundColor: 'white' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Şifre Tekrar"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!error.confirmPassword}
                helperText={error.confirmPassword}
                required
                sx={{ backgroundColor: 'white' }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="E-posta (@ogr.inonu.edu.tr)"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!error.email}
                helperText={error.email}
                required
                sx={{ backgroundColor: 'white' }}
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
                sx={{ backgroundColor: 'white' }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Öğrenci Numarası"
                name="studentNumber"
                value={formData.studentNumber}
                onChange={handleChange}
                error={!!error.studentNumber}
                helperText={error.studentNumber}
                required
                sx={{ backgroundColor: 'white' }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fakülte"
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                error={!!error.faculty}
                helperText={error.faculty}
                required
                sx={{ backgroundColor: 'white' }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bölüm"
                name="department"
                value={formData.department}
                onChange={handleChange}
                error={!!error.department}
                helperText={error.department}
                required
                sx={{ backgroundColor: 'white' }}
              />
            </Grid>

            <Grid item xs={12}>
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
                sx={{ backgroundColor: 'white' }}
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
                fullWidth
                size="large"
                disabled={isLoading}
                sx={{
                  mt: 2,
                  backgroundColor: '#1a73e8',
                  '&:hover': {
                    backgroundColor: '#1557b0',
                  },
                  height: '48px',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '16px',
                  position: 'relative',
                }}
              >
                {isLoading ? (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: 'white',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                ) : (
                  'Kayıt Ol'
                )}
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="text"
                fullWidth
                onClick={() => navigate("/login")}
                sx={{
                  color: '#1a73e8',
                  '&:hover': {
                    backgroundColor: 'rgba(26, 115, 232, 0.04)',
                  },
                }}
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

const LoadingOverlay = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="primary">
        Kaydınız işleniyor, lütfen bekleyin...
      </Typography>
    </Box>
  </Box>
);

export default Register;