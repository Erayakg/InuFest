import React, { useState, useEffect } from "react";
import { Grid, Box, Card, TextField, Button, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Slider görselleri
const sliderImages = [
  '/login/login-image.jpg',
  '/login/login-image-2.jpg',
  '/login/login-image3.jpg'
];

const Login = () => {
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [formData, setFormData] = useState({
        mail: "",
        password: "",
    });
    const [error, setError] = useState(null);
    const [open, setOpen] = useState(false);

    // Slider için useEffect
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => 
                prevIndex === sliderImages.length - 1 ? 0 : prevIndex + 1
            );
        }, 3000); // Her 3 saniyede bir görsel değişir

        return () => clearInterval(interval);
    }, []);

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

                navigate("/projects");
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
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#f5f5f5",
            }}
        >
            {/* Logo ve Başlık Container */}
            <Box 
                sx={{
                    width: '100%',
                    maxWidth: '1000px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mt: 3,
                    mb: 4,
                    pl: 3 // Sol padding ekleyerek sola yasladık
                }}
            >
                <Box 
                    component="img"
                    src="/login/logo-inonu.png"
                    alt="Logo"
                    sx={{
                        width: 100,
                        height: 'auto',
                        cursor: 'pointer',
                    }}
                    onClick={() => window.open('https://www.inonu.edu.tr/', '_blank')}
                />
                <Typography 
                    variant="h2" 
                    sx={{ 
                        fontWeight: 'bold',
                        color: '#333'
                    }}
                >
                    İnönü Üniversitesi Teknofest
                </Typography>
            </Box>

            <Grid 
                container 
                maxWidth="1000px" 
                sx={{ 
                    backgroundColor: 'white', 
                    borderRadius: 2, 
                    boxShadow: 3,
                    mx: 3,
                    border: '1px solid #e0e0e0'
                }}
            >
                {/* Sol taraf - Login Formu */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ p: 4 }}>
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
                    </Box>
                </Grid>

                {/* Sağ taraf - Slider */}
                <Grid 
                    item 
                    xs={12} 
                    md={6} 
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        position: 'relative',
                        overflow: 'hidden',
                        height: '500px', // Yüksekliği azalttım
                        p: 2 // Padding ekleyerek beyaz kenarlık oluşturdum
                    }}
                >
                    <Box
                        sx={{
                            height: '100%',
                            width: '100%',
                            position: 'relative',
                            borderRadius: 2,
                            overflow: 'hidden',
                            backgroundColor: 'white'
                        }}
                    >
                        {sliderImages.map((image, index) => (
                            <Box
                                key={index}
                                component="img"
                                src={image}
                                alt={`Login slide ${index + 1}`}
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: 2,
                                    opacity: currentImageIndex === index ? 1 : 0,
                                    transition: 'opacity 0.5s ease-in-out',
                                }}
                            />
                        ))}
                        {/* Slider dots */}
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 20,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: 1,
                                zIndex: 1,
                            }}
                        >
                            {sliderImages.map((_, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: currentImageIndex === index ? 'primary.main' : 'rgba(255, 255, 255, 0.5)',
                                        transition: 'background-color 0.3s',
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                </Grid>
            </Grid>

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