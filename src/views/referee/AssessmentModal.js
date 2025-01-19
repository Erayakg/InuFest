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

const AssessmentModal = ({ open, handleClose, refereeId, onSuccess, existingAssessment }) => {
  const [description, setDescription] = useState(existingAssessment?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [originality, setOriginality] = useState(existingAssessment?.originality || 'AVERAGE');
  const [innovation, setInnovation] = useState(existingAssessment?.innovation || 'AVERAGE');
  const [technicalProficiency, setTechnicalProficiency] = useState(existingAssessment?.technicalProficiency || 'AVERAGE');
  const [applicability, setApplicability] = useState(existingAssessment?.applicability || 'AVERAGE');
  const [designFunctionality, setDesignFunctionality] = useState(existingAssessment?.designFunctionality || 'AVERAGE');
  const [impactPotential, setImpactPotential] = useState(existingAssessment?.impactPotential || 'AVERAGE');
  const [presentationCommunication, setPresentationCommunication] = useState(existingAssessment?.presentationCommunication || 'AVERAGE');
  const [sustainability, setSustainability] = useState(existingAssessment?.sustainability || 'AVERAGE');

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

  const [score, setScore] = useState(existingAssessment?.score || calculateAverageScore());

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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authorization token not found');
      }

      const url = existingAssessment ? `/v1/assessments/${existingAssessment.id}` : '/v1/assessments';
      const method = existingAssessment ? 'put' : 'post';

      await axios[method](url, {
        score,
        description,
        projectRefereeId: refereeId,
        originality,
        innovation,
        technicalProficiency,
        applicability,
        designFunctionality,
        impactPotential,
        presentationCommunication,
        sustainability
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      handleClose(true);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Değerlendirme kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDescription('');
    setError(null);
    handleClose();
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
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>Proje Değerlendirmesi</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, mb: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Typography variant="h6" gutterBottom>
            Ortalama Puan: {score.toFixed(2)}
          </Typography>

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
          onClick={handleCancel} 
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
          {loading ? <CircularProgress size={24} /> : 'Değerlendir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssessmentModal;