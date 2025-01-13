import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { MultipleValuesAutocomplete } from '../../components/Forms/AutoComplete/MultipleValuesAutocomplete';

const ProjectEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = React.useState(null);
  const [selectedFile, setSelectedFile] = React.useState(null);

  // Örnek üye listesi - API'den gelecek
  const memberOptions = [
    { id: 1, label: "Ahmet Yılmaz" },
    { id: 2, label: "Mehmet Demir" },
    { id: 3, label: "Ayşe Kaya" },
    { id: 4, label: "Fatma Şahin" },
  ];

  React.useEffect(() => {
    // Fake data
    const fakeProject = {
      id: id,
      projectName: "Test Projesi",
      description: "Bu bir test projesi açıklamasıdır.",
      members: [
        { id: 1, label: "Ahmet Yılmaz" },
        { id: 2, label: "Mehmet Demir" }
      ],
      projectFile: "proje_dosyasi.pdf"
    };
    
    setProject(fakeProject);
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Güncellenecek proje bilgileri:', {
      ...project,
      newFile: selectedFile?.name
    });

    navigate('/projects');
  };

  const handleChange = (e) => {
    setProject({
      ...project,
      [e.target.name]: e.target.value
    });
  };

  const handleMemberChange = (event, newValue) => {
    setProject(prev => ({
      ...prev,
      members: newValue
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  if (!project) return <div>Yükleniyor...</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/projects" onClick={(e) => {
          e.preventDefault();
          navigate('/projects');
        }}>
          Projeler
        </Link>
        <Typography color="text.primary">Proje Düzenle</Typography>
      </Breadcrumbs>

      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Proje Düzenle
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Proje Adı"
                  name="projectName"
                  value={project.projectName}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <MultipleValuesAutocomplete
                  options={memberOptions}
                  value={project.members}
                  onChange={handleMemberChange}
                  label="Proje Üyeleri"
                  placeholder="Üye eklemek için yazın..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Proje Açıklaması"
                  name="description"
                  value={project.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid item xs={12}>
                <input
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  id="project-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="project-file">
                  <Button variant="outlined" component="span">
                    PDF Dosyası Yükle
                  </Button>
                </label>
                {selectedFile && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Seçilen dosya: {selectedFile.name}
                  </Typography>
                )}
                {project.projectFile && !selectedFile && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Mevcut dosya: {project.projectFile}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/projects')}
                  >
                    İptal
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                  >
                    Kaydet
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectEdit; 