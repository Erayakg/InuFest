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
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mail: "",
    password: "",
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ 
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('v1/auth/login', {
        mail: formData.mail,
        password: formData.password
      });
      console.log(response.data.data);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.accessToken);
        localStorage.setItem('username', response.data.data.username);
        localStorage.setItem('role', response.data.data.role);
        localStorage.setItem('userId', response.data.data.userId);
        
        navigate("/dashboards/dashboard1");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş yapılırken bir hata oluştu');
      console.error('Login error:', err);
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
    </Box>
  );
};

export default Login; 