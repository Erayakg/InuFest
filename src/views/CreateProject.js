import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Autocomplete,
  Box,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: null,
    members: [],
    projectFile: null,
  });

  const [categories, setCategories] = useState([]);
  const [fileError, setFileError] = useState(null);

  // Validasyon için state'ler
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    categoryId: '',
    members: '',
    projectFile: '',
  });

  // Email validasyonu için regex
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  
  // Öğrenci numarası validasyonu için regex (örnek: 8 haneli numara)
  const studentNumberRegex = /^\d{8}$/;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  // Add loading state for submit button
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/v1/category', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    // Proje adı kontrolü
    if (!formData.name.trim()) {
      tempErrors.name = 'Proje adı zorunludur';
      isValid = false;
    }

    // Açıklama kontrolü
    if (!formData.description.trim()) {
      tempErrors.description = 'Proje açıklaması zorunludur';
      isValid = false;
    }

    // Kategori kontrolü
    if (!formData.categoryId) {
      tempErrors.categoryId = 'Kategori seçimi zorunludur';
      isValid = false;
    }

    // PDF dosyası kontrolü - zorunlu
    if (!formData.projectFile) {
      tempErrors.projectFile = 'Proje dosyası zorunludur';
      setSnackbar({
        open: true,
        message: 'Lütfen bir PDF dosyası yükleyin',
        severity: 'warning'
      });
      isValid = false;
    } else if (formData.projectFile.type !== 'application/pdf') {
      tempErrors.projectFile = 'Sadece PDF dosyası yüklenebilir';
      setSnackbar({
        open: true,
        message: 'Sadece PDF formatında dosya yükleyebilirsiniz',
        severity: 'error'
      });
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Lütfen tüm zorunlu alanları doldurun ve hataları düzeltin');
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const formDataToSend = new FormData();

      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('studentId', userId);

      // Üyeleri JSON string olarak gönder
      if (formData.members && formData.members.length > 0) {
        formDataToSend.append('members', JSON.stringify(formData.members));
      } else {
        formDataToSend.append('members', JSON.stringify([]));
      }

      // Dosya zorunlu olarak ekleniyor
      formDataToSend.append('projectFile', formData.projectFile);

      const response = await axios.post('/v1/project/student/createProject', formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        navigate('/projects');
      }
    } catch (error) {
      setError(
        error.response?.data?.message || 'Proje oluşturulurken bir hata oluştu.'
      );
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setFormData(prev => ({
          ...prev,
          projectFile: file
        }));
        setFileError(null);
      } else {
        setFileError('Sadece PDF dosyaları kabul edilmektedir.');
        e.target.value = '';
      }
    }
  };

  return (
    <Grid container spacing={0}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h3" mb={3}>
              Yeni Proje Oluştur
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Proje Adı */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Proje Adı"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>

                {/* Proje Açıklaması */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Proje Açıklaması"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    error={!!errors.description}
                    helperText={errors.description}
                  />
                </Grid>

                {/* Kategori Seçimi */}
                <Grid item xs={12}>
                  <Autocomplete
                    options={categories}
                    getOptionLabel={(option) => option.name}
                    onChange={(_, newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        categoryId: newValue?.id || null
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Kategori"
                        required
                        error={!!errors.categoryId}
                        helperText={errors.categoryId}
                      />
                    )}
                  />
                </Grid>

                {/* Proje Üyeleri */}
                <Grid item xs={12}>
                  <Typography variant="h6" mb={2}>
                    Proje Üyeleri
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Ad"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Soyad"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Öğrenci Numarası"
                        name="studentNumber"
                        value={formData.studentNumber}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="E-posta"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          if (formData.firstName && formData.lastName && formData.studentNumber && formData.email) {
                            setFormData(prev => ({
                              ...prev,
                              members: [...prev.members, {
                                firstName: formData.firstName,
                                lastName: formData.lastName,
                                studentNumber: formData.studentNumber,
                                email: formData.email
                              }],
                              firstName: "",
                              lastName: "",
                              studentNumber: "",
                              email: ""
                            }));
                          }
                        }}
                        fullWidth
                      >
                        Üye Ekle
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Eklenen Üyeler Listesi */}
                {formData.members.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" mb={2}>
                      Eklenen Üyeler
                    </Typography>
                    {formData.members.map((member, index) => (
                      <Chip
                        key={index}
                        label={`${member.firstName} ${member.lastName} (${member.studentNumber})`}
                        onDelete={() => {
                          setFormData(prev => ({
                            ...prev,
                            members: prev.members.filter((_, i) => i !== index)
                          }));
                        }}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Grid>
                )}

                {/* Dosya Yükleme */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<AttachFileIcon />}
                      error={!!errors.projectFile}
                    >
                      PDF Dosyası Yükle (Zorunlu)
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        required
                      />
                    </Button>
                  </Box>
                  
                  {/* Show selected file name */}
                  {formData.projectFile && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 2,
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1
                    }}>
                      <PictureAsPdfIcon color="error" />
                      <Typography>{formData.projectFile.name}</Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setFormData(prev => ({ ...prev, projectFile: null }));
                          setFileError(null);
                        }}
                        sx={{ ml: 'auto' }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  )}

                  {errors.projectFile && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                      {errors.projectFile}
                    </Typography>
                  )}
                  {fileError && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                      {fileError}
                    </Typography>
                  )}
                </Grid>

                {error && (
                  <Grid item xs={12}>
                    <Typography color="error" align="center">
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Projeyi Oluştur'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default CreateProject;