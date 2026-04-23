import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  useTheme,
  useMediaQuery,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Work as WorkIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import internshipApi from '../services/internshipApi';
import { useAuth } from '../context/AuthContext';
import { resumeApi } from '../services/api';

const steps = ['Basic Information', 'Application Details', 'Resume Selection', 'Review & Submit'];

const InternshipForm = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated() || !user?.id) {
      setError('Please log in to create an internship');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const internshipData = {
        ...formData,
        userId: user.id,
      };

      // Only include resumeId if it's not empty
      if (!internshipData.resumeId) {
        delete internshipData.resumeId;
      }

      await internshipApi.createInternship(internshipData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating internship:', err);
      if (err.response?.status === 401) {
        setError('Please log in again to create an internship');
      } else {
        setError(err.response?.data?.message || 'Failed to submit internship');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchResumes();
    }
  }, [user]);

  const fetchResumes = async () => {
    setLoadingResumes(true);
    try {
      const response = await resumeApi.getUserResumes(user.id);
      setResumes(response.data);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError('Failed to load resumes. Please try again.');
    } finally {
      setLoadingResumes(false);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return formData.company && formData.role;
      case 1:
        return formData.platform && formData.status;
      case 2:
        // Resume selection is optional
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
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
                label="Position/Role"
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
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Platform (LinkedIn, Company Website, etc.)"
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
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Resume (Optional)
              </Typography>
              {loadingResumes ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : resumes.length > 0 ? (
                <FormControl fullWidth>
                  <InputLabel>Resume</InputLabel>
                  <Select
                    name="resumeId"
                    value={formData.resumeId}
                    onChange={handleChange}
                    label="Resume"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  >
                    <MenuItem value="">None</MenuItem>
                    {resumes.map((resume) => (
                      <MenuItem key={resume.id} value={resume.id}>
                        {resume.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <DescriptionIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body1" gutterBottom>
                    No resumes found
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/resumes')}
                    sx={{ mt: 1 }}
                  >
                    Add Resume
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Review Your Application
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Company
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formData.company || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Position
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formData.role || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Platform
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formData.platform || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formData.status || 'N/A'}
                  </Typography>
                </Grid>
                {formData.deadline && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Deadline
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {new Date(formData.deadline).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
                {formData.appliedOn && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Applied On
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {new Date(formData.appliedOn).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
                {formData.resumeId && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Resume
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {resumes.find(r => r.id === formData.resumeId)?.title || 'Selected Resume'}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  if (!isAuthenticated()) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" gutterBottom>
              Please Log In
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              You need to be logged in to add new internships.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={24}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Add New Internship
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your internship application with detailed information
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step Content */}
        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? null : <SaveIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                }}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepValid(activeStep)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default InternshipForm;
