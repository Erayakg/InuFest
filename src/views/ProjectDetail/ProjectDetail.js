import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Breadcrumbs,
  Link,
  Chip,
  Button,
  Divider,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Category as CategoryIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  PictureAsPdf as PdfIcon,
  Event as EventIcon,
} from '@mui/icons-material';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = React.useState(null);

  React.useEffect(() => {
    // Fake project data
    const fakeProject = {
      id,
      projectName: "Yapay Zeka ile Görüntü İşleme",
      category: "Yapay Zeka",
      applicationType: "Lisans Tezi",
      description: "Bu proje, derin öğrenme teknikleri kullanılarak görüntü işleme ve nesne tanıma üzerine odaklanmaktadır. Projede YOLO ve ResNet gibi modern CNN mimarileri kullanılarak gerçek zamanlı nesne tespiti yapılması hedeflenmektedir.",
      members: [
        { id: 1, label: "Ahmet Yılmaz", role: "Öğrenci" },
        { id: 2, label: "Dr. Mehmet Demir", role: "Danışman" },
        { id: 3, label: "Ayşe Kaya", role: "Öğrenci" }
      ],
      projectFile: "proje_detaylari.pdf",
      applicationDate: "2024-03-15"
    };
    
    setProject(fakeProject);
  }, [id]);

  if (!project) return <div>Yükleniyor...</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="/projects"
          onClick={(e) => {
            e.preventDefault();
            navigate('/projects');
          }}
        >
          Projeler
        </Link>
        <Typography color="text.primary">Proje Detayı</Typography>
      </Breadcrumbs>

      <Grid container spacing={3}>
        {/* Ana Bilgiler Kartı */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                  {project.projectName}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/projects/edit/${id}`)}
                >
                  Düzenle
                </Button>
              </Box>

              <Grid container spacing={3}>
                {/* Kategori */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Kategori
                      </Typography>
                      <Typography variant="body1">
                        {project.category}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Başvuru Tipi */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Başvuru Tipi
                      </Typography>
                      <Typography variant="body1">
                        {project.applicationType}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Başvuru Tarihi */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Başvuru Tarihi
                      </Typography>
                      <Typography variant="body1">
                        {new Date(project.applicationDate).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Proje Açıklaması Kartı */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionIcon color="primary" />
                Proje Açıklaması
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {project.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Proje Üyeleri Kartı */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon color="primary" />
                Proje Üyeleri
              </Typography>
              <Stack spacing={2}>
                {project.members.map((member) => (
                  <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar>{member.label[0]}</Avatar>
                    <Box>
                      <Typography variant="body1">
                        {member.label}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {member.role}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* PDF Dosyası Kartı */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PdfIcon color="primary" />
                Proje Dosyası
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1">
                  {project.projectFile}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PdfIcon />}
                  onClick={() => {
                    console.log('PDF indiriliyor:', project.projectFile);
                  }}
                >
                  İndir
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectDetail; 