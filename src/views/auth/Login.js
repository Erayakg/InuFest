import React, { useState } from "react";
import { Grid, Box, Card, TextField, Button, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mail: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post("http://localhost:8080/v1/auth/login", {
        mail: formData.mail,
        password: formData.password,
      });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.accessToken);
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("userId", response.data.userId);

        navigate("/dashboards/dashboard1");
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setOpen(true); // Pop-up'u aç
      } else {
        setError(err.response?.data?.message || "Mail adresi veya şifre yanlış.");
      }
    }
  };

  const handleDialogClose = async (confirm) => {
    setOpen(false); // Pop-up'u kapat
    if (confirm) {
      try {
        const verificationResponse = await axios.post(
          "http://localhost:8080/v1/verification/send-email-code",
          null,
          { params: { email: formData.mail } }
        );

        if (verificationResponse.status === 200) {
          alert("Doğrulama e-postası gönderildi. Lütfen e-postanızı kontrol edin!");
          navigate("/verify-email", { state: { email: formData.mail } });
        } else {
          setError(verificationResponse.data?.message || "Doğrulama işlemi başarısız oldu.");
        }
      } catch (verificationError) {
        setError(verificationError.response?.data?.message || "E-posta doğrulama hatası oluştu.");
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Card sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h4" textAlign="center" mb={4}>
          Giriş Yap
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="E-posta"
                name="mail"
                value={formData.mail}
                onChange={handleChange}
                required
                type="email"
              />
            </Grid>
            <Grid item xs={12}>
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
            {error && (
              <Grid item xs={12}>
                <Typography color="error" textAlign="center">
                  {error}
                </Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                Giriş Yap
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="text"
                fullWidth
                onClick={() => navigate("/register")}
              >
                Hesabınız yok mu? Kayıt olun
              </Button>
            </Grid>
          </Grid>
        </form>
      </Card>

      <Dialog
        open={open}
        onClose={() => handleDialogClose(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Doğrulama Gerekli"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Sisteme giriş yapmak için mail adresinizi doğrulamanız gerekiyor. Doğrulama e-postası gönderilsin mi?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose(false)} color="primary">
            İptal
          </Button>
          <Button onClick={() => handleDialogClose(true)} color="primary" autoFocus>
            Gönder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;