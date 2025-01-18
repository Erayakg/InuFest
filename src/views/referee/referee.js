import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Box,
    Divider,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Email as EmailIcon,
    Phone as PhoneIcon,
    Category as CategoryIcon,
    Assessment as AssessmentIcon,
    School as SchoolIcon,
    Work as WorkIcon
} from '@mui/icons-material';
import axios from 'axios';

const RefereePage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refereeData, setRefereeData] = useState({
        username: '',
        category: '',
        email: '',
        projectCount: 0,
        totalAssessments: 0,
        recentAssessments: []
    });

    const fetchRefereeData = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId');
            
            // Hakem bilgilerini al
            const refereeResponse = await axios.get(`/referee/referee/${userId}`);
            
            // Değerlendirme bilgilerini al
            const assessmentsResponse = await axios.get(`/v1/project-referees/by-referee/${userId}`);
            
            const referee = refereeResponse.data.data; // data içinden al
            const assessments = assessmentsResponse.data;

            setRefereeData({
                username: referee.name,
                category: referee.categoryName,
                email: referee.email,
                projectCount: referee.projectCount,
                totalAssessments: assessments.length,
                recentAssessments: assessments.map(assessment => ({
                    projectName: assessment.projectName,
                    score: assessment.assessments[0]?.score,
                    description: assessment.assessments[0]?.description,
                    date: new Date().toISOString() // API'den tarih gelmediği için şimdilik current date
                }))
            });
        } catch (error) {
            console.error('Hakem bilgileri alınamadı:', error);
            setError('Hakem bilgileri yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRefereeData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Grid container spacing={3}>
                {/* Profil Kartı */}
                <Grid item xs={12} md={4}>
                    <Card elevation={3}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    margin: '0 auto 16px auto',
                                    bgcolor: theme.palette.primary.main,
                                    fontSize: '2.5rem'
                                }}
                            >
                                {refereeData.username?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="h5" gutterBottom>
                                {refereeData.username}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                                <Chip
                                    icon={<CategoryIcon />}
                                    label={refereeData.category}
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'center' }}>
                                <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography>{refereeData.email}</Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* İstatistik Kartları */}
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={6}>
                            <Card elevation={3}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="primary">
                                        {refereeData.projectCount}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Toplam Proje
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6}>
                            <Card elevation={3}>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" color="primary">
                                        {refereeData.totalAssessments}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Değerlendirme
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Değerlendirmeler Tablosu */}
                <Grid item xs={12} md={8}>
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Değerlendirme Geçmişi
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Proje Adı</TableCell>
                                            <TableCell>Değerlendirme</TableCell>
                                            <TableCell align="right">Puan</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {refereeData.recentAssessments.map((assessment, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {assessment.projectName}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {assessment.description}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={assessment.score}
                                                        size="small"
                                                        color={assessment.score >= 75 ? 'success' : 
                                                               assessment.score >= 60 ? 'warning' : 'error'}
                                                        sx={{ fontWeight: 'bold' }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default RefereePage;
