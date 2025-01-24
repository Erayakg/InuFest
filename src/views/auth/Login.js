import React, { useState, useEffect } from "react";
import { Grid, Box, Card, TextField, Button, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress, Alert, Snackbar } from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// Slider görselleriW
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
    const [isLoading, setIsLoading] = useState(false);
    const [showResetCode, setShowResetCode] = useState(false);
    const [resetCode, setResetCode] = useState("");
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [newPasswordData, setNewPasswordData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
    const [verifyCodeLoading, setVerifyCodeLoading] = useState(false);
    const [isSendingVerification, setIsSendingVerification] = useState(false);

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
        setIsLoading(true);
        try {
            const response = await axios.post("/v1/auth/login", {
                mail: formData.mail,
                password: formData.password,
            });

            if (response.status === 200) {
                localStorage.setItem("token", response.data.accessToken);
                localStorage.setItem("username", response.data.username);
                localStorage.setItem("role", response.data.role);
                localStorage.setItem("userId", response.data.userId);

                // Redirect based on role
                const role = response.data.role;
                if (role === "ROLE_ADMIN") {
                    navigate("/admin");
                } else if (role === "ROLE_STUDENT") {
                    navigate("/projects");
                } else if (role === "ROLE_REFEREE") {
                    navigate("/referee-projects");
                }
            }
        } catch (err) {
            if (err.response?.status === 403) {
                setOpen(true);
            } else {
                setError(err.response?.data?.message || "Mail adresi veya şifre yanlış.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDialogClose = async (confirm) => {
        setOpen(false); // Pop-up'u kapat
        if (confirm) {
            setIsSendingVerification(true); // Start spinner
            try {
                const verificationResponse = await axios.post(
                    "/v1/verification/send-email-code",
                    null,
                    { params: { email: formData.mail } }
                );

                if (verificationResponse.status === 200) {
                    // Directly navigate to the verify email page
                    navigate("/verify-email", { state: { email: formData.mail } });
                } else {
                    setError(verificationResponse.data?.message || "Doğrulama işlemi başarısız oldu.");
                }
            } catch (verificationError) {
                setError(verificationError.response?.data?.message || "E-posta doğrulama hatası oluştu.");
            } finally {
                setIsSendingVerification(false); // Ensure spinner stops
            }
        }
    };

    const handleForgotPassword = async () => {
        if (!formData.mail) {
            setError("Lütfen e-posta adresinizi girin.");
            return;
        }

        setForgotPasswordLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                `/v1/verification/send-reset-code`,
                null,
                { params: { email: formData.mail } }
            );

            if (response.status === 200) {
                setShowResetCode(true);
                setSuccessMessage("Şifre sıfırlama kodu e-posta adresinize gönderildi.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Şifre sıfırlama kodu gönderilemedi.");
        } finally {
            setForgotPasswordLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resetCode) {
            setError("Lütfen doğrulama kodunu girin.");
            return;
        }

        setVerifyCodeLoading(true);
        try {
            const response = await axios.post(
                `/v1/verification/verify-reset-code`,
                null,
                {
                    params: {
                        email: formData.mail,
                        code: resetCode
                    }
                }
            );

            if (response.status === 200) {
                setShowResetCode(false);
                setShowPasswordReset(true);
                setError(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Doğrulama kodu geçersiz.");
        } finally {
            setVerifyCodeLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        setNewPasswordData({
            ...newPasswordData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmitNewPassword = async () => {
        // Validate passwords
        if (newPasswordData.password !== newPasswordData.confirmPassword) {
            setError("Şifreler eşleşmiyor!");
            return;
        }

        if (newPasswordData.password.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır!");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(
                `/v1/verification/reset-password?email=${encodeURIComponent(formData.mail)}&code=${encodeURIComponent(resetCode)}&newPassword=${encodeURIComponent(newPasswordData.password)}`,
                '', // Boş body
                {
                    headers: {
                        'accept': '*/*'
                    }
                }
            );

            if (response.status === 200) {
                alert("Şifreniz başarıyla değiştirildi! Lütfen yeni şifrenizle giriş yapın.");
                // Reset states and show login form
                setShowPasswordReset(false);
                setShowResetCode(false);
                setNewPasswordData({ password: '', confirmPassword: '' });
                setResetCode('');
            }
        } catch (err) {
            setError(err.response?.data?.message || "Şifre değiştirme işlemi başarısız oldu.");
        } finally {
            setIsLoading(false);
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
                position: "relative" // Added for overlay positioning
            }}
        >
            {isSendingVerification && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        zIndex: 1000
                    }}
                >
                    <CircularProgress size={60} />
                </Box>
            )}

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
                                        disabled={forgotPasswordLoading}
                                    />
                                </Grid>

                                {!showPasswordReset && !showResetCode && (
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
                                )}

                                {showResetCode && !showPasswordReset && (
                                    <>
                                        {successMessage && (
                                            <Grid item xs={12}>
                                                <Alert 
                                                    severity="success"
                                                    sx={{ 
                                                        bgcolor: 'success.light',
                                                        color: 'success.dark',
                                                        '& .MuiAlert-icon': {
                                                            color: 'success.dark'
                                                        }
                                                    }}
                                                >
                                                    {successMessage}
                                                </Alert>
                                            </Grid>
                                        )}
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Doğrulama Kodu"
                                                value={resetCode}
                                                onChange={(e) => setResetCode(e.target.value)}
                                                disabled={verifyCodeLoading}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={handleResetPassword}
                                                disabled={verifyCodeLoading}
                                            >
                                                {verifyCodeLoading ? (
                                                    <CircularProgress size={24} color="inherit" />
                                                ) : (
                                                    "Doğrula"
                                                )}
                                            </Button>
                                        </Grid>
                                    </>
                                )}

                                {showPasswordReset && (
                                    <>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Yeni Şifre"
                                                name="password"
                                                type="password"
                                                value={newPasswordData.password}
                                                onChange={handlePasswordChange}
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Yeni Şifre Tekrar"
                                                name="confirmPassword"
                                                type="password"
                                                value={newPasswordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                required
                                            />
                                        </Grid>
                                    </>
                                )}

                                {error && (
                                    <Grid item xs={12}>
                                        <Typography color="error" textAlign="center">
                                            {error}
                                        </Typography>
                                    </Grid>
                                )}

                                {!showPasswordReset && !showResetCode && (
                                    <>
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <Button
                                                    variant="text"
                                                    onClick={handleForgotPassword}
                                                    disabled={forgotPasswordLoading}
                                                >
                                                    {forgotPasswordLoading ? (
                                                        <CircularProgress size={24} color="inherit" />
                                                    ) : (
                                                        "Şifremi Unuttum"
                                                    )}
                                                </Button>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                fullWidth
                                                size="large"
                                                disabled={forgotPasswordLoading}
                                            >
                                                {forgotPasswordLoading ? (
                                                    <CircularProgress size={24} color="inherit" />
                                                ) : (
                                                    "Giriş Yap"
                                                )}
                                            </Button>
                                        </Grid>
                                    </>
                                )}

                            

                                {showPasswordReset && (
                                    <Grid item xs={12}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={handleSubmitNewPassword}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <CircularProgress size={24} color="inherit" />
                                            ) : (
                                                "Şifreyi Değiştir"
                                            )}
                                        </Button>
                                    </Grid>
                                )}

                                {!showPasswordReset && !showResetCode && (
                                    <Grid item xs={12}>
                                        <Button
                                            variant="text"
                                            fullWidth
                                            onClick={() => navigate("/register")}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <CircularProgress size={24} />
                                            ) : (
                                                "Hesabınız yok mu? Kayıt olun"
                                            )}
                                        </Button>
                                    </Grid>
                                )}
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
                    <Button 
                        onClick={() => handleDialogClose(true)} 
                        color="primary" 
                        autoFocus
                        disabled={isSendingVerification}
                    >
                        {isSendingVerification ? <CircularProgress size={24} color="inherit" /> : "Gönder"}
                    </Button>
                </DialogActions>
            </Dialog>

          
        </Box>
    );
};

export default Login;