import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  Alert,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Avatar,
  Grid,
  CircularProgress,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  OpenInNew as OpenInNewIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { resumeApi } from '../services/api';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker (using CDN for convenience)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Tiny PDF first-page thumbnail component with graceful fallback
const PdfThumbnail = ({ src, height = 140 }) => {
  const canvasRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      try {
        setError(false);
        const loadingTask = pdfjsLib.getDocument({ url: src });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        const page = await pdf.getPage(1);
        const initialViewport = page.getViewport({ scale: 1.0 });
        const scale = height / initialViewport.height;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch (e) {
        console.warn('PDF preview failed:', e);
        setError(true);
      }
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [src, height]);

  if (error) {
    return (
      <Box sx={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
      }}>
        <DescriptionIcon color="action" />
      </Box>
    );
  }

  return <canvas ref={canvasRef} style={{ width: '100%', height }} />;
};

const ResumeManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    file: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingResumes, setFetchingResumes] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuForId, setMenuForId] = useState(null);
  const [defaultResumeId, setDefaultResumeId] = useState(() => {
    const saved = localStorage.getItem('defaultResumeId');
    return saved ? parseInt(saved, 10) : null;
  });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchResumes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchResumes = async () => {
    setFetchingResumes(true);
    try {
      const response = await resumeApi.getUserResumes(user.id);
      setResumes(response.data);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError('Failed to load resumes. Please try again.');
    } finally {
      setFetchingResumes(false);
    }
  };

  const handleDelete = async (resume) => {
    if (!window.confirm(`Delete resume "${resume.title}"? This will remove the file from the server.`)) {
      return;
    }
    setError('');
    setSuccess('');
    setDeletingId(resume.id);
    try {
      await resumeApi.deleteResume(resume.id, user.id);
      setSuccess('Resume deleted successfully');
      await fetchResumes();
    } catch (err) {
      console.error('Error deleting resume:', err);
      setError(err.response?.data?.message || 'Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFormData(prev => ({
      ...prev,
      file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.file) {
        throw new Error('Please select a PDF file to upload');
      }
      await resumeApi.uploadResume({
        title: formData.title,
        file: formData.file,
        userId: user.id,
      });
      setSuccess('Resume uploaded successfully!');
      setFormData({ title: '', file: null });
      fetchResumes();
    } catch (err) {
      console.error('Error uploading resume:', err);
      setError(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  // Context menu handlers and UI helpers (scoped to ResumeManagement)
  const openMenu = (event, id) => {
    setAnchorEl(event.currentTarget);
    setMenuForId(id);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setMenuForId(null);
  };

  const handleSetDefault = (id) => {
    setDefaultResumeId(id);
    localStorage.setItem('defaultResumeId', String(id));
    setSnack({ open: true, message: 'Set as default resume', severity: 'success' });
    closeMenu();
  };

  const handleDownload = (resume) => {
    try {
      const a = document.createElement('a');
      a.href = `http://localhost:8080${resume.url}`;
      a.download = resume.url?.split('/').pop() || 'resume.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setSnack({ open: true, message: 'Download started', severity: 'success' });
    } catch (e) {
      setSnack({ open: true, message: 'Failed to start download', severity: 'error' });
    }
    closeMenu();
  };

  const handleOpenRename = (resume) => {
    setRenameValue(resume.title);
    setRenameOpen(true);
    closeMenu();
  };

  const handleCloseRename = () => setRenameOpen(false);

  const handleSaveRename = () => {
    // TODO: Wire to backend to persist rename
    setSnack({ open: true, message: 'Rename feature coming soon', severity: 'info' });
    setRenameOpen(false);
  };

  const handleSnackClose = () => setSnack((s) => ({ ...s, open: false }));

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <>
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Resume Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="title"
                label="Resume Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Software Engineer Resume"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ mt: 2.5, py: 1.8, borderRadius: 2 }}
              >
                {formData.file ? 'Change PDF' : 'Select PDF'}
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Upload your resume as a PDF file
              </Typography>
              {formData.file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {formData.file.name}
                </Typography>
              )}
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload Resume'}
          </Button>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Your Resumes
        </Typography>

        {fetchingResumes ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : resumes.length > 0 ? (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {resumes.map((resume) => (
              <Grid item xs={12} sm={6} md={4} key={resume.id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    backdropFilter: 'blur(6px)',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.85), rgba(245,247,250,0.8))',
                    border: '1px solid rgba(0,0,0,0.06)',
                    transition: 'transform 160ms ease, box-shadow 160ms ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
                  }}
               >
                  <Box sx={{
                    height: 140,
                    overflow: 'hidden',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    borderBottom: '1px solid rgba(0,0,0,0.06)'
                  }}>
                    <PdfThumbnail src={`http://localhost:8080${resume.url}`} height={140} />
                  </Box>
                  <CardHeader
                    sx={{
                      '& .MuiCardHeader-content': { overflow: 'hidden' },
                      '& .MuiCardHeader-action': { alignSelf: 'center', marginTop: 0 },
                    }}
                    avatar={
                      <Avatar sx={{
                        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                        boxShadow: 3,
                      }}>
                        <DescriptionIcon fontSize="small" />
                      </Avatar>
                    }
                    title={
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, width: '100%' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: '1 1 auto', minWidth: 0 }} noWrap>
                          {resume.title}
                        </Typography>
                        {defaultResumeId === resume.id && (
                          <Chip size="small" color="primary" icon={<StarIcon />} label="Default" sx={{ height: 22, flexShrink: 0 }} />
                        )}
                      </Stack>
                    }
                    subheader={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip size="small" label="PDF" sx={{ height: 20 }} />
                        <Typography variant="caption" color="text.secondary">
                          Ready to attach
                        </Typography>
                      </Stack>
                    }
                    action={
                      <IconButton onClick={(e) => openMenu(e, resume.id)} aria-label="more">
                        <MoreVertIcon />
                      </IconButton>
                    }
                  />
                  <CardContent sx={{ pt: 0 }}>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {`File: ${resume.url?.split('/').pop() || 'resume.pdf'}`}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Tooltip title="Open PDF in a new tab">
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        startIcon={<OpenInNewIcon />}
                        component="a"
                        href={`http://localhost:8080${resume.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        View
                      </Button>
                    </Tooltip>
                    <Tooltip title="Delete this resume from server">
                      <span style={{ width: '100%' }}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(resume)}
                          disabled={deletingId === resume.id}
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          {deletingId === resume.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </span>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card variant="outlined" sx={{ mt: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Resumes Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload your first resume to get started
              </Typography>
            </CardContent>
          </Card>
        )}
      </Paper>
    </Container>

    {/* Context menu for card actions */}
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
      <MenuItem onClick={() => handleSetDefault(menuForId)}>
        <StarIcon fontSize="small" style={{ marginRight: 8 }} /> Set as Default
      </MenuItem>
      <MenuItem onClick={() => {
        const r = resumes.find(x => x.id === menuForId);
        if (r) handleDownload(r);
      }}>
        <DownloadIcon fontSize="small" style={{ marginRight: 8 }} /> Download
      </MenuItem>
      <MenuItem onClick={() => {
        const r = resumes.find(x => x.id === menuForId);
        if (r) handleOpenRename(r);
      }}>
        <DescriptionIcon fontSize="small" style={{ marginRight: 8 }} /> Rename
      </MenuItem>
    </Menu>

    {/* Rename dialog (placeholder) */}
    <Dialog open={renameOpen} onClose={handleCloseRename} maxWidth="xs" fullWidth>
      <DialogTitle>Rename Resume</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Title"
          type="text"
          fullWidth
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseRename}>Cancel</Button>
        <Button onClick={handleSaveRename} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>

    {/* Snack feedback */}
    <Snackbar
      open={snack.open}
      autoHideDuration={3000}
      onClose={handleSnackClose}
      message={snack.message}
    />
    </>
  );
};

export default ResumeManagement;