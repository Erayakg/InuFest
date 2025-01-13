import React, { useState } from "react";
import {
  Grid,
  Box,
  Card,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
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
    // Başarılı giriş sonrası dashboard'a yönlendirme
    navigate("/dashboards/dashboard1");
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
                label="Kullanıcı Adı"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
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
    </Box>
  );
};

export default Login; 