import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Work as WorkIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import internshipApi from '../services/internshipApi';
import { resumeApi } from '../services/api';

const EditInternship = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const params = useParams();
  const { id } = params;
  console.log('EditInternship - URL params:', params);
  console.log('EditInternship - ID param:', id);
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    platform: '',
    deadline: '',
    appliedOn: '',
    status: 'Applied',
    resumeId: '',
  });
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    const fetchInternship = async () => {
      try {
        setFetchingData(true);
        console.log('Fetching internship with ID:', id);
        const response = await internshipApi.getInternship(id);
        console.log('Internship API response:', response);
        const internship = response.data;
        console.log('Internship data:', internship);
        setFormData({
          company: internship.company || '',
          role: internship.role || '',
          platform: internship.platform || '',
          deadline: internship.deadline || '',
          appliedOn: internship.appliedOn || '',
          status: internship.status || 'Applied',
          resumeId: internship.resume?.id || '',
        });
      } catch (err) {
        console.error('Error fetching internship:', err);
        setError('Failed to load internship details');
      } finally {
        setFetchingData(false);
      }
    };

    const fetchResumes = async () => {
      if (user?.id) {
        setLoadingResumes(true);
        try {
          const response = await resumeApi.getUserResumes(user.id);
          setResumes(response.data);
        } catch (err) {
          console.error('Error fetching resumes:', err);
          setError('Failed to load resumes');
        } finally {
          setLoadingResumes(false);
        }
      }
    };

    fetchInternship();
    fetchResumes();
  }, [id, navigate, isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare data for update
      const internshipData = {
        ...formData,
        userId: user.id,
      };
      
      // Only include resumeId if it's not empty
      if (!internshipData.resumeId) {
        delete internshipData.resumeId;
      }

      await internshipApi.updateInternship(id, internshipData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error updating internship:', err);
      setError(err.response?.data?.message || 'Failed to update internship');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return null; // Redirect handled in useEffect
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Edit Internship
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Update your internship application details
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {fetchingData ? (
          <Typography>Loading internship details...</Typography>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <LanguageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  >
                    <MenuItem value="Applied">Applied</MenuItem>
                    <MenuItem value="Interview">Interview</MenuItem>
                    <MenuItem value="Accepted">Accepted</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Applied On"
                  name="appliedOn"
                  type="date"
                  value={formData.appliedOn}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Resume (Optional)</InputLabel>
                  {loadingResumes ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      <Typography variant="body2">Loading resumes...</Typography>
                    </Box>
                  ) : (
                    <Select
                      name="resumeId"
                      value={formData.resumeId}
                      onChange={handleChange}
                      label="Resume (Optional)"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                      <MenuItem value="">None</MenuItem>
                      {resumes.map((resume) => (
                        <MenuItem key={resume.id} value={resume.id}>
                          {resume.title}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </FormControl>
                {resumes.length === 0 && !loadingResumes && (
                  <Box sx={{ mt: 1 }}>
                    <Button
                      size="small"
                      startIcon={<DescriptionIcon />}
                      onClick={() => navigate('/resumes')}
                    >
                      Add Resume
                    </Button>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: isMobile ? 'center' : 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard')}
                    sx={{ 
                      px: 3, 
                      py: 1.2,
                      borderRadius: 2,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ 
                      px: 4, 
                      py: 1.2,
                      borderRadius: 2,
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Internship'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default EditInternship;