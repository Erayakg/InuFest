import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Slider,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const AssessmentModal = ({ open, handleClose, refereeId, onSuccess }) => {
  const [score, setScore] = useState(70);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Lütfen bir değerlendirme açıklaması yazın.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post('/v1/assessments/createAssessment', {
        score,
        description,
        projectRefereeId: refereeId
      });
      console.log(score,description,refereeId);

      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Değerlendirme kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setScore(70);
    setDescription('');
    setError(null);
    handleClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Proje Değerlendirmesi</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Typography gutterBottom>
            Puan: {score}
          </Typography>
          <Slider
            value={score}
            onChange={(_, newValue) => setScore(newValue)}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={0}
            max={100}
            sx={{ mb: 3 }}
          />

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
          />
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