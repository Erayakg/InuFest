import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Slider,
  Paper,
  Grid,
  Divider,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import axios from 'axios';

const UpdateAssessmentModal = ({ open, handleClose, assessmentData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Main criteria
  const [teamIntroduction, setTeamIntroduction] = useState(2);
  const [literatureReview, setLiteratureReview] = useState(3);
  const [solution, setSolution] = useState(6);
  const [targetAudience, setTargetAudience] = useState(2);
  const [swotAnalysis, setSwotAnalysis] = useState(5);
  const [references, setReferences] = useState(2);
  const [reportFormat, setReportFormat] = useState(3);

  // Split criteria - Updated to match backend field names
  // Project Summary split into two parts
  const [projectSummaryIntro, setProjectSummaryIntro] = useState(2);
  const [projectSummaryScope, setProjectSummaryScope] = useState(2);
  
  // Problem Analysis split into two parts - Renamed to match backend
  const [problemAnalysisPart, setProblemAnalysisPart] = useState(3);
  const [problemSolution, setProblemSolution] = useState(3);
  
  // Methodology split into two parts - Renamed to match backend
  const [methodologyPart, setMethodologyPart] = useState(3);
  const [applicability, setApplicability] = useState(3);
  
  // Innovation split into two parts
  const [innovationValue, setInnovationValue] = useState(2);
  const [commercialization, setCommercialization] = useState(3);
  
  // Cost and Time split into two parts
  const [costEstimation, setCostEstimation] = useState(3);
  const [timeScheduling, setTimeScheduling] = useState(3);

  useEffect(() => {
    if (assessmentData) {
      // Load main criteria
      setTeamIntroduction(assessmentData.teamIntroduction || 2);
      setLiteratureReview(assessmentData.literatureReview || 3);
      setSolution(assessmentData.solution || 6);
      setTargetAudience(assessmentData.targetAudience || 2);
      setSwotAnalysis(assessmentData.swotAnalysis || 5);
      setReferences(assessmentData.references || 2);
      setReportFormat(assessmentData.reportFormat || 3);
      
      // Load split criteria - Updated field names to match backend
      setProjectSummaryIntro(assessmentData.projectSummaryIntro || 2);
      setProjectSummaryScope(assessmentData.projectSummaryScope || 2);
      
      setProblemAnalysisPart(assessmentData.problemAnalysisPart || 3);
      setProblemSolution(assessmentData.problemSolution || 3);
      
      setMethodologyPart(assessmentData.methodologyPart || 3);
      setApplicability(assessmentData.applicability || 3);
      
      setInnovationValue(assessmentData.innovationValue || 2);
      setCommercialization(assessmentData.commercialization || 3);
      
      setCostEstimation(assessmentData.costEstimation || 3);
      setTimeScheduling(assessmentData.timeScheduling || 3);
    }
  }, [assessmentData]);

  const calculateTotalScore = () => {
    return (
      projectSummaryIntro + projectSummaryScope +
      teamIntroduction +
      literatureReview +
      problemAnalysisPart + problemSolution +
      solution +
      methodologyPart + applicability +
      innovationValue + commercialization +
      costEstimation + timeScheduling +
      targetAudience +
      swotAnalysis +
      references +
      reportFormat
    );
  };
  
  const [score, setScore] = useState(assessmentData?.score || calculateTotalScore());

  useEffect(() => {
    setScore(calculateTotalScore());
  }, [
    projectSummaryIntro, projectSummaryScope,
    teamIntroduction,
    literatureReview,
    problemAnalysisPart, problemSolution,
    solution,
    methodologyPart, applicability,
    innovationValue, commercialization,
    costEstimation, timeScheduling,
    targetAudience,
    swotAnalysis,
    references,
    reportFormat
  ]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const updateData = {
        // Send data according to the new backend model structure
        projectRefereeId: assessmentData.projectRefereeId,
        projectSummaryIntro,
        projectSummaryScope,
        teamIntroduction,
        literatureReview,
        problemAnalysisPart,
        problemSolution,
        solution,
        methodologyPart,
        applicability,
        innovationValue,
        commercialization,
        costEstimation,
        timeScheduling,
        targetAudience,
        swotAnalysis,
        references,
        reportFormat
      };

      console.log('Gönderilen veri:', updateData);

      const response = await axios.put(`/v1/assessments/${assessmentData.id}`, updateData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Sunucu yanıtı:', response.data);

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Değerlendirme güncellenirken hata oluştu:', error);
      console.log('Sunucu hata detayı:', error.response?.data);
      setError(error.response?.data?.message || 'Değerlendirme güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = score / maxScore;
    if (percentage <= 0.3) return '#f44336'; // Red
    if (percentage <= 0.6) return '#ff9800'; // Orange
    if (percentage <= 0.8) return '#2196f3'; // Blue
    return '#4caf50'; // Green
  };

  // Component for rendering scoring interface for a single criterion
  const ScoringInterface = ({ value, setValue, maxScore, label }) => {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        mb: 2,
        position: 'relative',
        pt: 2
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'medium', maxWidth: '75%' }}>
            {label}
          </Typography>
          <Chip
            label={`${value}/${maxScore}`}
            size="small"
            sx={{
              bgcolor: getScoreColor(value, maxScore),
              color: 'white',
              fontWeight: 'bold',
              height: 24,
              minWidth: 45
            }}
          />
        </Box>
        
        <Typography 
          variant="h6" 
          sx={{ 
            position: 'absolute',
            top: -5,
            left: '50%',
            transform: 'translateX(-50%)',
            color: getScoreColor(value, maxScore),
            fontWeight: 'bold',
            bgcolor: 'white',
            px: 1,
            borderRadius: 1,
            boxShadow: '0 0 4px rgba(0,0,0,0.1)',
            zIndex: 2
          }}
        >
          {value}
        </Typography>
        
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'space-between'
        }}>
          <Button
            variant="contained"
            size="small"
            disabled={value <= 0}
            onClick={() => setValue(Math.max(0, value - 1))}
            sx={{
              minWidth: '36px',
              width: '36px',
              height: '36px',
              p: 0,
              borderRadius: '50%',
              bgcolor: '#f5f5f5',
              color: 'text.secondary',
              boxShadow: 1,
              '&:hover': {
                bgcolor: '#e0e0e0'
              },
              '&.Mui-disabled': {
                bgcolor: '#f5f5f5',
                opacity: 0.5
              }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>-</Typography>
          </Button>
          
          <Box sx={{ 
            flex: 1,
            mx: 1.5,
            position: 'relative'
          }}>
            <Box sx={{ 
              width: '100%', 
              height: 8,
              bgcolor: '#eee',
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${(value / maxScore) * 100}%`,
                  background: `linear-gradient(90deg, ${getScoreColor(0, maxScore)} 0%, ${getScoreColor(value, maxScore)} 100%)`,
                  transition: 'width 0.3s ease-out'
                }}
              />
            </Box>
            
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              mt: 0.5
            }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>0</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{maxScore}</Typography>
            </Box>
          </Box>
          
          <Button
            variant="contained"
            size="small"
            disabled={value >= maxScore}
            onClick={() => setValue(Math.min(maxScore, value + 1))}
            sx={{
              minWidth: '36px',
              width: '36px',
              height: '36px',
              p: 0,
              borderRadius: '50%',
              bgcolor: '#f5f5f5',
              color: 'text.secondary',
              boxShadow: 1,
              '&:hover': {
                bgcolor: '#e0e0e0'
              },
              '&.Mui-disabled': {
                bgcolor: '#f5f5f5',
                opacity: 0.5
              }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>+</Typography>
          </Button>
        </Box>
      </Box>
    );
  };

  // Add performance optimizations to the component
  const MemoizedScoringInterface = React.memo(ScoringInterface);

  // List of all criteria
  const criteriaList = [
    {
      id: 1,
      title: 'Proje Özeti / Proje Konu Kapsamı',
      maxScore: 8,
      isComposite: true,
      components: [
        {
          label: 'Proje Özeti (0-4 Puan)',
          value: projectSummaryIntro,
          setValue: setProjectSummaryIntro,
          maxScore: 4
        },
        {
          label: 'Proje Konu Kapsamı (0-4 Puan)',
          value: projectSummaryScope,
          setValue: setProjectSummaryScope,
          maxScore: 4
        }
      ],
      value: projectSummaryIntro + projectSummaryScope
    },
    {
      id: 2,
      title: 'Takım Tanıtımı',
      maxScore: 4,
      value: teamIntroduction,
      setValue: setTeamIntroduction
    },
    {
      id: 3,
      title: 'Literatür Taraması',
      maxScore: 6,
      value: literatureReview,
      setValue: setLiteratureReview
    },
    {
      id: 4,
      title: 'Problem / Sorun',
      maxScore: 12,
      isComposite: true,
      components: [
        {
          label: 'Problem Analizi (0-6 Puan)',
          value: problemAnalysisPart,
          setValue: setProblemAnalysisPart,
          maxScore: 6
        },
        {
          label: 'Çözüm Ürettiği Sorun (0-6 Puan)',
          value: problemSolution,
          setValue: setProblemSolution,
          maxScore: 6
        }
      ],
      value: problemAnalysisPart + problemSolution
    },
    {
      id: 5,
      title: 'Çözüm',
      maxScore: 12,
      value: solution,
      setValue: setSolution
    },
    {
      id: 6,
      title: 'Yöntem ve Uygulanabilirlik',
      maxScore: 12,
      isComposite: true,
      components: [
        {
          label: 'Yöntem (0-6 Puan)',
          value: methodologyPart,
          setValue: setMethodologyPart,
          maxScore: 6
        },
        {
          label: 'Uygulanabilirlik (0-6 Puan)',
          value: applicability,
          setValue: setApplicability,
          maxScore: 6
        }
      ],
      value: methodologyPart + applicability
    },
    {
      id: 7,
      title: 'Yenilikçi (İnovatif) Yönü ve Ticarileştirme Potansiyeli',
      maxScore: 10,
      isComposite: true,
      components: [
        {
          label: 'Yenilikçi (İnovatif) Yönü (0-4 Puan)',
          value: innovationValue,
          setValue: setInnovationValue,
          maxScore: 4
        },
        {
          label: 'Ticarileştirme Potansiyeli (0-6 Puan)',
          value: commercialization,
          setValue: setCommercialization,
          maxScore: 6
        }
      ],
      value: innovationValue + commercialization
    },
    {
      id: 8,
      title: 'Tahmini Maliyet ve Proje Zaman Planlaması',
      maxScore: 12,
      isComposite: true,
      components: [
        {
          label: 'Tahmini Maliyet (0-6 Puan)',
          value: costEstimation,
          setValue: setCostEstimation,
          maxScore: 6
        },
        {
          label: 'Proje Zaman Planlaması (0-6 Puan)',
          value: timeScheduling,
          setValue: setTimeScheduling,
          maxScore: 6
        }
      ],
      value: costEstimation + timeScheduling
    },
    {
      id: 9,
      title: 'Proje Fikrinin Hedef Kitlesi (Kullanıcılar)',
      maxScore: 4,
      value: targetAudience,
      setValue: setTargetAudience
    },
    {
      id: 10,
      title: 'Swot Analizi',
      maxScore: 10,
      value: swotAnalysis,
      setValue: setSwotAnalysis
    },
    {
      id: 11,
      title: 'Referans / Kaynakça',
      maxScore: 4,
      value: references,
      setValue: setReferences
    },
    {
      id: 12,
      title: 'Rapor Düzeni',
      maxScore: 6,
      value: reportFormat,
      setValue: setReportFormat
    }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        py: 2,
        fontSize: '1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        Değerlendirme Güncelle
      </DialogTitle>

      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: 'white',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        py: 1.5,
        px: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Toplam Puan:
        </Typography>
        <Chip 
          label={score} 
          sx={{ 
            bgcolor: getScoreColor(score, 100),
            color: 'white', 
            fontWeight: 'bold',
            fontSize: '1.2rem',
            p: 2,
            height: 'auto'
          }} 
        />
      </Box>
      
      <DialogContent sx={{ p: 3, pt: 2 }}>
        <Box sx={{ mt: 1, mb: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '4px' }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {criteriaList.map((criteria) => (
              <Grid item xs={12} md={6} key={criteria.id}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    height: '100%',
                    borderRadius: '8px',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: criteria.isComposite ? 2 : 1 }}>
                      <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                        {criteria.id}. {criteria.title}
                      </Typography>
                      <Chip 
                        label={`${criteria.value}/${criteria.maxScore}`}
                        size="small"
                        sx={{ 
                          bgcolor: getScoreColor(criteria.value, criteria.maxScore),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>

                    {criteria.isComposite ? (
                      // Render sub-components for composite criteria
                      <Box>
                        <Divider sx={{ mb: 2 }} />
                        {criteria.components.map((component, index) => (
                          <MemoizedScoringInterface 
                            key={index}
                            value={component.value}
                            setValue={component.setValue}
                            maxScore={component.maxScore}
                            label={component.label}
                          />
                        ))}
                      </Box>
                    ) : (
                      // Render single scoring for non-composite criteria
                      <Box sx={{ mt: 2, position: 'relative', pt: 2 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            position: 'absolute',
                            top: -5,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: getScoreColor(criteria.value, criteria.maxScore),
                            fontWeight: 'bold',
                            bgcolor: 'white',
                            px: 1,
                            borderRadius: 1,
                            boxShadow: '0 0 4px rgba(0,0,0,0.1)',
                            zIndex: 2
                          }}
                        >
                          {criteria.value}
                        </Typography>

                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          justifyContent: 'space-between'
                        }}>
                          <Button
                            variant="contained"
                            size="small"
                            disabled={criteria.value <= 0}
                            onClick={() => criteria.setValue(Math.max(0, criteria.value - 1))}
                            sx={{
                              minWidth: '40px',
                              width: '40px',
                              height: '40px',
                              p: 0,
                              borderRadius: '50%',
                              bgcolor: '#f5f5f5',
                              color: 'text.secondary',
                              boxShadow: 1,
                              '&:hover': {
                                bgcolor: '#e0e0e0'
                              },
                              '&.Mui-disabled': {
                                bgcolor: '#f5f5f5',
                                opacity: 0.5
                              }
                            }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>-</Typography>
                          </Button>
                          
                          <Box sx={{ 
                            flex: 1,
                            mx: 1.5,
                            position: 'relative'
                          }}>
                            <Box sx={{ 
                              width: '100%', 
                              height: 8,
                              bgcolor: '#eee',
                              borderRadius: 4,
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  height: '100%',
                                  width: `${(criteria.value / criteria.maxScore) * 100}%`,
                                  background: `linear-gradient(90deg, ${getScoreColor(0, criteria.maxScore)} 0%, ${getScoreColor(criteria.value, criteria.maxScore)} 100%)`,
                                  transition: 'width 0.3s ease-out'
                                }}
                              />
                            </Box>
                            
                            <Box sx={{ 
                              display: 'flex',
                              justifyContent: 'space-between',
                              mt: 0.5
                            }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>0</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{criteria.maxScore}</Typography>
                            </Box>
                          </Box>
                          
                          <Button
                            variant="contained"
                            size="small"
                            disabled={criteria.value >= criteria.maxScore}
                            onClick={() => criteria.setValue(Math.min(criteria.maxScore, criteria.value + 1))}
                            sx={{
                              minWidth: '40px',
                              width: '40px',
                              height: '40px',
                              p: 0,
                              borderRadius: '50%',
                              bgcolor: '#f5f5f5',
                              color: 'text.secondary',
                              boxShadow: 1,
                              '&:hover': {
                                bgcolor: '#e0e0e0'
                              },
                              '&.Mui-disabled': {
                                bgcolor: '#f5f5f5',
                                opacity: 0.5
                              }
                            }}
                          >
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>+</Typography>
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
        <Button 
          onClick={handleClose} 
          color="inherit"
          disabled={loading}
          variant="outlined"
          sx={{ borderRadius: '8px', px: 3 }}
        >
          İptal
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
          sx={{ 
            borderRadius: '8px', 
            px: 3,
            boxShadow: '0 4px 8px rgba(33, 150, 243, 0.3)'
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Güncelle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateAssessmentModal; 