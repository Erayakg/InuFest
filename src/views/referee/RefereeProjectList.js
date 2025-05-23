import React, { useState, useEffect } from "react";
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
  useMediaQuery,
  CircularProgress,
  Grid,
  Container,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import GradeIcon from "@mui/icons-material/Grade";
import DeleteIcon from '@mui/icons-material/Delete';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AssessmentModal from "./AssessmentModal";
import UpdateAssessmentModal from './UpdateAssessmentModal';

const RefereeProjectList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateSortOrder, setDateSortOrder] = useState(null);
  const [scoreSortOrder, setScoreSortOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [refereeId, setRefereeId] = useState(null);
  const [score, setScore] = useState(null);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [assessmentData, setAssessmentData] = useState(null);
  const [assessmentFilter, setAssessmentFilter] = useState("all");

  const fetchRefereeProjects = async () => {
    try {
      setLoading(true);
      if (!userId) {
        throw new Error("Kullanıcı bilgisi bulunamadı");
      }
      if (!token) {
        throw new Error("Authorization token not found");
      }

      const projectsResponse = await axios.get(`/v1/project/referee/getAllProject/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const assessmentsResponse = await axios.get(`/v1/project-referees/by-referee/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (projectsResponse.data && projectsResponse.data.data) {
        const projectData = Array.isArray(projectsResponse.data.data) 
          ? projectsResponse.data.data 
          : [projectsResponse.data.data];

        const projectsWithScores = projectData.map(project => {
          const assessment = assessmentsResponse.data.find(
            item => item.projectId === project.id
          );
          return {
            ...project,
            score: assessment?.assessments?.[0]?.score || null,
            refereeId: assessment?.id || null,
            assessmentId: assessment?.assessments?.[0]?.id || null
          };
        });

        setProjects(projectsWithScores);
        console.log("Projects with assessments:", projectsWithScores);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Error fetching referee projects:", err);
      setError(err.response?.data?.message || "Projeler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefereeProjects();
  }, []);

  const filteredAndSortedProjects = React.useMemo(() => {
    return [...projects]
      .filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter(project => {
        if (assessmentFilter === "all") return true;
        if (assessmentFilter === "assessed") return project.score !== null;
        if (assessmentFilter === "unassessed") return project.score === null;
        return true;
      })
      .sort((a, b) => {
        if (scoreSortOrder) {
          const scoreA = a.score || 0;
          const scoreB = b.score || 0;
          
          if (scoreA !== scoreB) {
            return scoreSortOrder === "highest" ? scoreB - scoreA : scoreA - scoreB;
          }
        }
        
        if (dateSortOrder) {
          const dateA = new Date(a.createdDate).getTime();
          const dateB = new Date(b.createdDate).getTime();
          return dateSortOrder === "desc" ? dateB - dateA : dateA - dateB;
        }
        
        return 0; // No sorting if no order is selected
      });
  }, [projects, searchQuery, assessmentFilter, scoreSortOrder, dateSortOrder]);

  const totalPages = Math.ceil(filteredAndSortedProjects.length / rowsPerPage);
  const paginatedProjects = filteredAndSortedProjects.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleDateSortChange = (event) => {
    setDateSortOrder(event.target.value);
  };

  const handleScoreSortChange = (event) => {
    setScoreSortOrder(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleView = (id) => {
    navigate(`/projectDetails/${id}`);
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Tarih bilgisi yok";
    const date = new Date(dateString);
    return date.toLocaleString("tr-TR").replace(",", " -");
  };

  const handleAssessment = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      showNotification('Proje bulunamadı', 'error');
      return;
    }
    
    if (project.score !== null && project.assessmentId) {
      // Mevcut değerlendirme varsa güncelleme modalını aç
      try {
        const response = await axios.get(`/v1/assessments/${project.assessmentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setAssessmentData(response.data);
        setUpdateModalOpen(true);
      } catch (error) {
        console.error('Değerlendirme detayları alınırken hata oluştu:', error);
        showNotification('Değerlendirme detayları alınırken bir hata oluştu', 'error');
      }
    } else {
      // Yeni değerlendirme için normal modalı aç
      setSelectedProjectId(projectId);
      setRefereeId(project.refereeId);
      setAssessmentModalOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleDeleteAssessment = async (projectId) => {
    try {
      if (!window.confirm('Değerlendirmeyi silmek istediğinizden emin misiniz?')) {
        return;
      }

      const project = projects.find(p => p.id === projectId);
      await axios.delete(`/v1/assessments/${project.assessmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      showNotification('Değerlendirme başarıyla silindi');
      await fetchRefereeProjects();
    } catch (error) {
      console.error('Değerlendirme silinirken hata oluştu:', error);
      showNotification('Değerlendirme silinirken bir hata oluştu', 'error');
    }
  };

  const handleAssessmentSuccess = () => {
    fetchRefereeProjects();
  };

  const handleUpdateSuccess = () => {
    fetchRefereeProjects();
    setUpdateModalOpen(false);
    setAssessmentData(null);
    showNotification('Değerlendirme başarıyla güncellendi', 'success');
  };

  const handleAssessmentFilterChange = (event) => {
    setAssessmentFilter(event.target.value);
    setPage(1);
  };

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {paginatedProjects.map((project) => (
        <Grid item xs={12} key={project.id}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {project.name}
              </Typography>
              <Chip 
                label={project.category?.name || "Kategori Yok"} 
                size="small" 
                color="primary"
                variant="outlined"
                sx={{ mb: 1 }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {truncateText(project.description, 100)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <PersonIcon color="primary" fontSize="small" />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.primary.main,
                  fontWeight: "medium"
                }}
              >
                {project.student?.username || "Kaptan bilgisi yok"}
              </Typography>
            </Box>

            <Box sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              borderTop: 1,
              borderColor: "divider",
              pt: 2,
              mt: 1
            }}>
              <Typography variant="caption" color="textSecondary">
                {formatDate(project.createdDate)}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                <Tooltip title="Detayları Görüntüle">
                  <IconButton
                    size="small"
                    onClick={() => handleView(project.id)}
                    color="primary"
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={project.score ? "Değerlendirmeyi Güncelle" : "Değerlendir"}>
                  <IconButton
                    size="small"
                    onClick={() => handleAssessment(project.id)}
                    color="secondary"
                  >
                    <GradeIcon />
                  </IconButton>
                </Tooltip>
                {project.score !== null && (
                  <Tooltip title="Değerlendirmeyi Sil">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteAssessment(project.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderDesktopView = () => (
    <TableContainer 
      component={Paper} 
      variant="outlined"
      sx={{ 
        maxHeight: "calc(100vh - 300px)",
        overflowX: "hidden"
      }}
    >
      <Table sx={{ 
        tableLayout: "fixed",
        minWidth: "100%"
      }}>
        <TableHead>
          <TableRow>
            <TableCell width="20%" sx={{ fontWeight: "bold" }}>Proje Adı</TableCell>
            <TableCell width="25%" sx={{ fontWeight: "bold" }}>Açıklama</TableCell>
            <TableCell width="15%" sx={{ fontWeight: "bold" }}>Kategori</TableCell>
            <TableCell width="15%" sx={{ fontWeight: "bold" }}>Takım Kaptanı</TableCell>
            <TableCell width="15%" sx={{ fontWeight: "bold" }}>Değerlendirme Puanı</TableCell>
            <TableCell width="10%" align="center" sx={{ fontWeight: "bold" }}>İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedProjects.map((project) => (
            <TableRow 
              key={project.id} 
              hover
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell sx={{ 
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                <Tooltip title={project.name}>
                  <Typography noWrap>{project.name}</Typography>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ 
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                <Tooltip title={project.description || ""}>
                  <Typography noWrap>{truncateText(project.description, 40)}</Typography>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Chip 
                  label={project.category?.name || "Kategori Yok"} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    maxWidth: "100%",
                    '.MuiChip-label': {
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }
                  }}
                />
              </TableCell>
              <TableCell sx={{ 
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonIcon color="primary" fontSize="small" />
                  <Tooltip title={project.student?.username || "Kaptan bilgisi yok"}>
                    <Typography 
                      noWrap 
                      sx={{ 
                        color: theme.palette.primary.main,
                        flex: 1
                      }}
                    >
                      {project.student?.username || "Kaptan bilgisi yok"}
                    </Typography>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell align="center">
                {project.score ? (
                  <Typography variant="body2" color="primary">
                    {project.score}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Değerlendirilmedi
                  </Typography>
                )}
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                  <Tooltip title="Detayları Görüntüle">
                    <IconButton
                      size="small"
                      onClick={() => handleView(project.id)}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={project.score ? "Değerlendirmeyi Güncelle" : "Değerlendir"}>
                    <IconButton
                      size="small"
                      onClick={() => handleAssessment(project.id)}
                      color="secondary"
                    >
                      <GradeIcon />
                    </IconButton>
                  </Tooltip>
                  {project.score !== null && (
                    <Tooltip title="Değerlendirmeyi Sil">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteAssessment(project.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderControls = () => (
    <Box sx={{ 
      mb: 3, 
      display: "flex", 
      gap: 2, 
      flexWrap: "wrap", 
      alignItems: "center",
      flexDirection: isMobile ? "column" : "row",
      width: isMobile ? "100%" : "auto"
    }}>
      <TextField
        label="Proje Ara"
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ 
          minWidth: isMobile ? "100%" : 200 
        }}
      />
      <FormControl 
        size="small" 
        sx={{ 
          minWidth: isMobile ? "100%" : 200 
        }}
      >
        <InputLabel>Tarih Sıralaması</InputLabel>
        <Select
          value={dateSortOrder}
          label="Tarih Sıralaması"
          onChange={handleDateSortChange}
        >
          <MenuItem value="desc">En Yeni</MenuItem>
          <MenuItem value="asc">En Eski</MenuItem>
        </Select>
      </FormControl>
      <FormControl 
        size="small" 
        sx={{ 
          minWidth: isMobile ? "100%" : 200 
        }}
      >
        <InputLabel>Puan Sıralaması</InputLabel>
        <Select
          value={scoreSortOrder}
          label="Puan Sıralaması"
          onChange={handleScoreSortChange}
        >
          <MenuItem value="highest">En Yüksek</MenuItem>
          <MenuItem value="lowest">En Düşük</MenuItem>
        </Select>
      </FormControl>
      <FormControl 
        size="small" 
        sx={{ 
          minWidth: isMobile ? "100%" : 200 
        }}
      >
        <InputLabel>Değerlendirme Durumu</InputLabel>
        <Select
          value={assessmentFilter}
          label="Değerlendirme Durumu"
          onChange={handleAssessmentFilterChange}
        >
          <MenuItem value="all">Tümü</MenuItem>
          <MenuItem value="assessed">Değerlendirilmiş</MenuItem>
          <MenuItem value="unassessed">Değerlendirilmemiş</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ 
        ml: isMobile ? 0 : "auto",
        width: isMobile ? "100%" : "auto",
        textAlign: isMobile ? "center" : "right"
      }}>
        <Typography variant="body2" color="textSecondary">
          Toplam: {filteredAndSortedProjects.length} proje
        </Typography>
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" align="center">{error}</Typography>
      </Box>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography align="center" variant="h6" color="textSecondary">
              Atanmış proje bulunmamaktadır.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                mb: 4,
                fontSize: isMobile ? "1.5rem" : "2rem" 
              }}
            >
              Üzerime Atanan Projeler
            </Typography>
            
            {renderControls()}
            
            {isMobile ? renderMobileView() : renderDesktopView()}

            <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                size={isMobile ? "small" : "medium"}
              />
            </Box>
          </CardContent>
        </Card>
        <AssessmentModal
          open={assessmentModalOpen}
          handleClose={() => {
            setAssessmentModalOpen(false);
            setSelectedProjectId(null);
            setRefereeId(null);
          }}
          projectId={selectedProjectId}
          refereeId={refereeId}
          onSuccess={handleAssessmentSuccess}
        />
        <UpdateAssessmentModal
          open={updateModalOpen}
          handleClose={() => {
            setUpdateModalOpen(false);
            setAssessmentData(null);
          }}
          assessmentData={assessmentData}
          onSuccess={handleUpdateSuccess}
        />
      </Container>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RefereeProjectList;
