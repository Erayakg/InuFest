import React, { useState, useEffect } from "react";
import { Box, Card, TextField, Button, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = location.state; // Get the email from the previous location state
    const [code, setCode] = useState("");
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setIsResendDisabled(false);
        }
    }, [resendTimer]);

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `/v1/verification/verify-email-code?email=${email}&code=${code}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const responseBody = await response.text(); // Yanıtı düz metin olarak al

            if (response.ok) {
                toast.success("Doğrulama başarılı! Şimdi sisteme giriş yapabilirsiniz.", {
                    position: "top-center",
                    onClose: () => navigate("/login")
                });
            } else {
                toast.error("Doğrulama başarısız: " + responseBody, {
                    position: "top-center"
                });
            }
        } catch (error) {
            console.error("Doğrulama sırasında hata:", error);
            toast.error("Doğrulama sırasında bir hata oluştu.", {
                position: "top-center"
            });
        }
    };

    const handleResendCode = async () => {
        setIsResendDisabled(true);
        setResendTimer(300); // Set 5 minutes (300 seconds) cooldown
        try {
            const response = await fetch(`/v1/verification/send-email-code?email=${email}`, {
                method: "POST",
            });
            if (!response.ok) {
                toast.error("Failed to resend verification code.", {
                    position: "top-center"
                });
            } else {
                toast.success("Doğrulama kodu yeniden gönderildi. Lütfen e-postanızı kontrol edin.", {
                    position: "top-center"
                });
            }
        } catch (error) {
            console.error("Error during resending code:", error);
            toast.error("Kodu yeniden gönderirken bir hata oluştu.", {
                position: "top-center"
            });
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
            <Card sx={{ p: 4, maxWidth: 400, width: "100%" }}>
                <Typography variant="h5" textAlign="center" mb={4}>
                    Email Doğrulama
                </Typography>
                <form onSubmit={handleVerify}>
                    <TextField
                        fullWidth
                        label="Doğrulama Kodu"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        sx={{ mt: 2 }}
                    >
                        Doğrula
                    </Button>
                </form>
                <Button
                    variant="text"
                    fullWidth
                    disabled={isResendDisabled}
                    onClick={handleResendCode}
                    sx={{ mt: 2 }}
                >
                    {isResendDisabled ? `Yeniden gönder (${resendTimer} saniye)` : "Kodu yeniden gönder"}
                </Button>
            </Card>
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </Box>
    );
};

export default VerifyEmail;