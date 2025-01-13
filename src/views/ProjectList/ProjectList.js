import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from 'react-router-dom';

// Örnek veri - API'den gelecek
const projects = [
  {
    id: 1,
    projectName: "Akıllı Ev Sistemleri",
    projectType: "Teknofest türkiye",
    projectDescription: "IoT tabanlı akıllı ev otomasyonu",
    supervisor: "Dr. Ahmet Yılmaz",
    applicationDate: "2024-01-15",
    status: "Devam Ediyor",
    students: ["Ali Yılmaz", "Ayşe Demir"],
    category: "Akıllı Şehirler",
  },
  {
    id: 2,
    projectName: "Yapay Zeka ile Görüntü İşleme",
    projectType: "Teknofest KKTC",
    projectDescription: "Derin öğrenme ile nesne tanıma sistemi",
    supervisor: "Dr. Mehmet Kaya",
    applicationDate: "2024-02-01",
    status: "Tamamlandı",
    students: ["Mehmet Şahin"],
    category: "Yapay Zeka",
  },
];

const ProjectList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleEdit = (id) => {
    navigate(`/projects/edit/${id}`);
  };

  const handleDelete = (id) => {
    console.log("Delete project:", id);
  };

  const handleView = (id) => {
    navigate(`/projects/detail/${id}`);
  };

  // Mobil görünüm için kart komponenti
  const MobileProjectCard = ({ project }) => (
    <Card sx={{ mb: 2, p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {project.projectName}
        </Typography>
        <Chip
          label={project.status}
          color={project.status === "Tamamlandı" ? "success" : "warning"}
          size="small"
          sx={{ mb: 1 }}
        />
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Typography variant="caption" color="textSecondary">
            Proje Tipi
          </Typography>
          <Typography variant="body2">{project.projectType}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="textSecondary">
            Kategori
          </Typography>
          <Typography variant="body2">
            <Chip label={project.category} size="small" color="primary" />
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="textSecondary">
            Danışman
          </Typography>
          <Typography variant="body2">{project.supervisor}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="textSecondary">
            Öğrenciler
          </Typography>
          <Typography variant="body2">{project.students.join(", ")}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="textSecondary">
            Başvuru Tarihi
          </Typography>
          <Typography variant="body2">
            {new Date(project.applicationDate).toLocaleDateString()}
          </Typography>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <IconButton size="small" onClick={() => handleView(project.id)} color="primary">
          <VisibilityIcon />
        </IconButton>
        <IconButton size="small" onClick={() => handleEdit(project.id)} color="primary">
          <EditIcon />
        </IconButton>
        <IconButton size="small" onClick={() => handleDelete(project.id)} color="error">
          <DeleteIcon />
        </IconButton>
      </Box>
    </Card>
  );

  return (
    <Box>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h3" mb={3}>
            Projeler
          </Typography>
          
          {isMobile ? (
            // Mobil görünüm
            <Box>
              {projects.map((project) => (
                <MobileProjectCard key={project.id} project={project} />
              ))}
            </Box>
          ) : (
            // Masaüstü görünüm (tablo güncellendi)
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="project table">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Proje Adı</strong></TableCell>
                    <TableCell><strong>Proje Tipi</strong></TableCell>
                    <TableCell><strong>Danışman</strong></TableCell>
                    <TableCell><strong>Öğrenciler</strong></TableCell>
                    <TableCell><strong>Başvuru Tarihi</strong></TableCell>
                    <TableCell><strong>Durum</strong></TableCell>
                    <TableCell><strong>Kategori</strong></TableCell>
                    <TableCell><strong>İşlemler</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow
                      key={project.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>{project.projectName}</TableCell>
                      <TableCell>{project.projectType}</TableCell>
                      <TableCell>{project.supervisor}</TableCell>
                      <TableCell>{project.students.join(", ")}</TableCell>
                      <TableCell>{new Date(project.applicationDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={project.status}
                          color={project.status === "Tamamlandı" ? "success" : "warning"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.category}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Görüntüle">
                          <IconButton
                            size="small"
                            onClick={() => handleView(project.id)}
                            color="primary"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Düzenle">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(project.id)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(project.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProjectList; 