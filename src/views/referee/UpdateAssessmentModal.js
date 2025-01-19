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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel
} from '@mui/material';
import axios from 'axios';

const UpdateAssessmentModal = ({ open, handleClose, assessmentData, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [originality, setOriginality] = useState('AVERAGE');
  const [innovation, setInnovation] = useState('AVERAGE');
  const [technicalProficiency, setTechnicalProficiency] = useState('AVERAGE');
  const [applicability, setApplicability] = useState('AVERAGE');
  const [designFunctionality, setDesignFunctionality] = useState('AVERAGE');
  const [impactPotential, setImpactPotential] = useState('AVERAGE');
  const [presentationCommunication, setPresentationCommunication] = useState('AVERAGE');
  const [sustainability, setSustainability] = useState('AVERAGE');

  useEffect(() => {
    if (assessmentData) {
      setDescription(assessmentData.description || '');
      setOriginality(assessmentData.originality || 'AVERAGE');
      setInnovation(assessmentData.innovation || 'AVERAGE');
      setTechnicalProficiency(assessmentData.technicalProficiency || 'AVERAGE');
      setApplicability(assessmentData.applicability || 'AVERAGE');
      setDesignFunctionality(assessmentData.designFunctionality || 'AVERAGE');
      setImpactPotential(assessmentData.impactPotential || 'AVERAGE');
      setPresentationCommunication(assessmentData.presentationCommunication || 'AVERAGE');
      setSustainability(assessmentData.sustainability || 'AVERAGE');
    }
  }, [assessmentData]);



  const ratingValues = {
    VERY_BAD: 0,
    BAD: 25,
    AVERAGE: 50,
    GOOD: 75,
    VERY_GOOD: 100
  };
  
  const calculateAverageScore = () => {
    const totalScore = [
      originality,
      innovation,
      technicalProficiency,
      applicability,
      designFunctionality,
      impactPotential,
      presentationCommunication,
      sustainability
    ].reduce((acc, criterion) => acc + ratingValues[criterion], 0);

    return totalScore / 8;
  };
  
 /* const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Lütfen bir değerlendirme açıklaması yazın.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.put(`/v1/assessments/${assessmentData.id}`, {
        score,
        description,
        projectRefereeId: assessmentData.projectRefereeId,
        originality,
        innovation,
        technicalProficiency,
        applicability,
        designFunctionality,
        impactPotential,
        presentationCommunication,
        sustainability
      });
      handleClose(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Değerlendirme kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };*/
  const [score, setScore] = useState(assessmentData?.score || calculateAverageScore());

  useEffect(() => {
    setScore(calculateAverageScore());
  }, [originality, innovation, technicalProficiency, applicability, designFunctionality, impactPotential, presentationCommunication, sustainability]);



  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Lütfen bir değerlendirme açıklaması yazın.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData = {
        score: score,
        description: description,
        projectRefereeId: assessmentData.projectRefereeId,
        originality: originality,
        innovation: innovation,
        technicalProficiency: technicalProficiency,
        applicability: applicability,
        designFunctionality: designFunctionality,
        impactPotential: impactPotential,
        presentationCommunication: presentationCommunication,
        sustainability: sustainability
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

  const ratingOptions = [
    { label: 'Çok Kötü', value: 'VERY_BAD' },
    { label: 'Kötü', value: 'BAD' },
    { label: 'Fena Değil', value: 'AVERAGE' },
    { label: 'İyi', value: 'GOOD' },
    { label: 'Çok İyi', value: 'VERY_GOOD' }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>Değerlendirme Güncelle</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, mb: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Değerlendirme Açıklaması"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Projeyle ilgili değerlendirmenizi yazın..."
            error={error && !description.trim()}
            helperText={error && !description.trim() ? "Açıklama zorunludur" : ""}
            sx={{ mb: 3 }}
          />

          {[
            { label: 'Orijinallik', value: originality, setter: setOriginality },
            { label: 'Yenilik', value: innovation, setter: setInnovation },
            { label: 'Teknik Yeterlilik', value: technicalProficiency, setter: setTechnicalProficiency },
            { label: 'Uygulanabilirlik', value: applicability, setter: setApplicability },
            { label: 'Tasarım ve İşlevsellik', value: designFunctionality, setter: setDesignFunctionality },
            { label: 'Etkileşim Potansiyeli', value: impactPotential, setter: setImpactPotential },
            { label: 'Sunum ve İletişim', value: presentationCommunication, setter: setPresentationCommunication },
            { label: 'Sürdürülebilirlik', value: sustainability, setter: setSustainability }
          ].map((criteria, index) => (
            <FormControl component="fieldset" key={index} sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ fontWeight: 'bold' }}>{criteria.label}</FormLabel>
              <RadioGroup
                row
                value={criteria.value}
                onChange={(e) => criteria.setter(e.target.value)}
              >
                {ratingOptions.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio color="primary" />}
                    label={option.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose} 
          color="inherit"
          disabled={loading}
        >
          İptal
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Güncelle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateAssessmentModal; 