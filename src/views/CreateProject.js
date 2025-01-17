import axios from 'axios';
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
  IconButton,
} from "@mui/material";
import { useNavigate } from 'react-router-dom';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: null,
    StudentId: [],
    projectFile: null,
  });

  // Options state
  const [categories, setCategories] = useState([]);
  const [students, setStudents] = useState([]);

  // Kullanıcı seçtiği PDF dosyasına dair hataları göstermek için
  const [fileError, setFileError] = useState(null);

  // Kategorileri yükle
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/category', {
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

  // Öğrencileri yükle
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/student/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data.success) {
          setStudents(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    };
    fetchStudents();
  }, []);

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
      // PDF dosyası kontrolü
      if (file.type !== 'application/pdf') {
        setFileError('Lütfen sadece PDF dosyası yükleyin');
        return;
      }
      setFormData(prev => ({
        ...prev,
        projectFile: file
      }));
      setFileError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
  
      // Form verilerini ekle
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('categoryId', formData.categoryId);
  
      // StudentId array'ini formData'ya ekle
      formData.StudentId.forEach((id) => {
        formDataToSend.append('StudentId', id);
      });
      
      // PDF dosyasını ekle, dosyanın varlığını kontrol et
      if (formData.projectFile) {
        console.log('Dosya gönderiliyor:', formData.projectFile);
        formDataToSend.append('projectFile', formData.projectFile);
      } else {
        console.log('Dosya bulunamadı.');
      }
      
      // FormData içeriğini kontrol et
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }
  
      // Axios isteği
      const response = await axios.post('/v1/project/student/createProject', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          // 'Content-Type': 'multipart/form-data' // Axios otomatik ayarlar, eklemeyin
        },
      });
  
      // Başarılı yanıt
      if (response.data.success) {
        console.log('Proje başarıyla oluşturuldu:', response.data);
        navigate('/projects');
      }
    } catch (error) {
      console.error('Proje oluşturma hatası:', error);
      setError(
        error.response?.data?.message || 'Proje oluşturulurken bir hata oluştu. Lütfen tüm alanları kontrol edin.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Grid container spacing={0}>
      <Grid item xs={12} lg={12}>
        <Card>
          <CardContent>
            <Typography variant="h3" mb={3}>
              Yeni Proje Oluştur
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Proje Adı"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>

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
                  />
                </Grid>

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
                        error={!formData.categoryId && error}
                        helperText={!formData.categoryId && error ? 'Kategori seçimi zorunludur' : ''}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={students}
                    getOptionLabel={(option) => `${option.username} (${option.studentNumber})`}
                    onChange={(_, newValue) => {
                      setFormData(prev => ({
                        ...prev,
                        StudentId: newValue?.map(student => student?.id).filter(Boolean) || []
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Öğrenciler"
                        error={!formData.StudentId?.length && error}
                        helperText={!formData.StudentId?.length && error ? 'En az bir öğrenci seçilmelidir' : ''}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="project-file-input"
                  />
                  <label htmlFor="project-file-input">
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                      startIcon={<AttachFileIcon />}
                      sx={{ mt: 2 }}
                    >
                      PDF Dosyası Yükle
                    </Button>
                  </label>
                  
                  {formData.projectFile && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mt: 2,
                      p: 2,
                      bgcolor: '#f5f5f5',
                      borderRadius: 1
                    }}>
                      <PictureAsPdfIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {formData.projectFile.name}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => setFormData(prev => ({ ...prev, projectFile: null }))}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                  
                  {fileError && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      {fileError}
                    </Typography>
                  )}
                </Grid>

                {error && (
                  <Grid item xs={12}>
                    <Typography color="error" align="center" sx={{ mt: 2 }}>
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
                    disabled={loading}
                  >
                    {loading ? 'Kaydediliyor...' : 'Projeyi Kaydet'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default CreateProject;