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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import GradeIcon from "@mui/icons-material/Grade";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AssessmentModal from "./AssessmentModal";

const RefereeProjectList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);

  const [refereeId, setRefereeId] = useState(null);
  const [score, setScore] = useState(null);
  const userId = localStorage.getItem("userId");
  console.log(userId);


  const fetchRefereeProjects = async () => {
    try {
      setLoading(true);
      if (!userId) {
        throw new Error("Kullanıcı bilgisi bulunamadı");
      }

      // Önce projeleri al
      const projectsResponse = await axios.get(`/v1/project/referee/getAllProject/${userId}`);
      
      // Sonra değerlendirmeleri al
      const assessmentsResponse = await axios.get(`/v1/project-referees/by-referee/${userId}`);

      if (projectsResponse.data && projectsResponse.data.data) {
        const projectData = Array.isArray(projectsResponse.data.data) 
          ? projectsResponse.data.data 
          : [projectsResponse.data.data];

        // Değerlendirme puanlarını projelere ekle
        const projectsWithScores = projectData.map(project => {
          const assessment = assessmentsResponse.data.find(
            item => item.projectId === project.id
          );
          return {
            ...project,
            score: assessment?.assessments?.[0]?.score || null,
            refereeId: assessment?.id || null
          };
        });

        setProjects(projectsWithScores);
        console.log(projectsWithScores);
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

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    const dateA = new Date(a.createdDate).getTime();
    const dateB = new Date(b.createdDate).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(sortedProjects.length / rowsPerPage);
  const paginatedProjects = sortedProjects.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
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

  const fetchProjectReferees = async () => {
    try {
      const refereeId = localStorage.getItem('userId');
      if (!refereeId) return;

      const response = await axios.get('/v1/project-referees/by-project');
      
      const refereeData = response.data.map(item => ({
        id: item.id,
        projectId: item.projectId,
        refereeId: item.refereeId,
        assessments: item.assessments
      }));
      
      setProjectReferees(refereeData || []);
      
    } catch (error) {
      console.error('Referee projeleri alınamadı:', error);
    }
  };

  useEffect(() => {
    fetchProjectReferees();
  }, []);

  const handleAssessment = (projectId) => {

    const project = projects.find(p => p.id === projectId);
    setSelectedProjectId(projectId);
    setRefereeId(project.refereeId);

    setAssessmentModalOpen(true);
  };

  const handleAssessmentSuccess = () => {
    fetchRefereeProjects();
    fetchProjectReferees();
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
                <Tooltip title="Değerlendir">
                  <IconButton
                    size="small"
                    onClick={() => handleAssessment(project.id)}
                    color="secondary"
                    disabled={project.score !== null && project.score !== undefined}
                  >
                    <GradeIcon />
                  </IconButton>
                </Tooltip>
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
                  <Tooltip title="Değerlendir">
                    <IconButton
                      size="small"
                      onClick={() => handleAssessment(project.id)}
                      color="secondary"
                      disabled={project.score !== null && project.score !== undefined}
                    >
                      <GradeIcon />
                    </IconButton>
                  </Tooltip>
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
        <InputLabel>Sıralama</InputLabel>
        <Select value={sortOrder} label="Sıralama" onChange={handleSortChange}>
          <MenuItem value="desc">En Yeni</MenuItem>
          <MenuItem value="asc">En Eski</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ 
        ml: isMobile ? 0 : "auto",
        width: isMobile ? "100%" : "auto",
        textAlign: isMobile ? "center" : "right"
      }}>
        <Typography variant="body2" color="textSecondary">
          Toplam: {filteredProjects.length} proje
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
        handleClose={(success) => {
          setAssessmentModalOpen(false);

          setSelectedProjectId(null);
          setRefereeId(null);
        }}
        projectId={selectedProjectId}
        refereeId={refereeId}
        onSuccess={handleAssessmentSuccess}

      />
    </Container>
  );
};

export default RefereeProjectList;
