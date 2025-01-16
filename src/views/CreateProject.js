import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Autocomplete,
} from "@mui/material";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

  const [fileError, setFileError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError(null);

    if (file) {
      if (file.type === 'application/pdf') {
        if (file.size <= 5 * 1024 * 1024) {
          setFormData(prev => ({
            ...prev,
            projectFile: file
          }));
        } else {
          setFileError('Dosya boyutu 5MB\'dan küçük olmalıdır');
          e.target.value = null;
        }
      } else {
        setFileError('Sadece PDF dosyası yükleyebilirsiniz');
        e.target.value = null;
      }
    }
  };
  const handleSubmit = async (e) => {

    e.preventDefault();
  
    if (!formData.name || !formData.description || !formData.categoryId || !formData.StudentId?.length) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
  
      // FormData oluşturun ve tüm verileri ekleyin
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('categoryId', formData.categoryId.toString());
      formData.StudentId.forEach(id => formDataToSend.append('StudentId', id.toString()));
  
      if (formData.projectFile) {
        formDataToSend.append('projectFile', formData.projectFile);
      }
  
      const response = await fetch('/v1/project/student/createProject', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data'// Content-Type manuel eklenmemeli
        },
        body: formDataToSend
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hata: ${errorText}`);
      }
  
      const data = await response.json();
      console.log('Başarılı:', data);
      navigate('/projects');
    } catch (error) {
      console.error('Hata:', error);
      setError(error.message || 'Bir hata oluştu');
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
                  <Button
                    variant="contained"
                    component="label"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    PDF Dosyası Yükle
                    <input
                      type="file"
                      hidden
                      onChange={handleFileChange}
                      accept="application/pdf"
                    />
                  </Button>
                  {formData.projectFile && (
                    <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                      Seçilen dosya: {formData.projectFile.name}
                    </Typography>
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