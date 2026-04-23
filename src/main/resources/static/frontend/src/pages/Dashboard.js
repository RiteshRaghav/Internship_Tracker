import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  Stack,
  Divider,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Tooltip,
  Avatar,
  LinearProgress,
  Fade,
} from '@mui/material';
import {
  Add as AddIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  CalendarToday as CalendarTodayIcon,
  SearchOff as SearchOffIcon,
} from '@mui/icons-material';
import internshipApi from '../services/internshipApi';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useAuth();
  const [internships, setInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null);

  const fetchInternships = async () => {
    if (!isAuthenticated() || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await internshipApi.getAllInternships(user.id);
      const data = response.data || [];
      setInternships(data);
      setFilteredInternships(data);
    } catch (err) {
      console.error('Error fetching internships:', err);
      if (err.response?.status === 401) {
        setError('Please log in again to view your internships');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch internships');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [user, isAuthenticated]);
  
  useEffect(() => {
    // Filter internships based on search term and status filter
    let filtered = [...internships];
    
    if (searchTerm) {
      filtered = filtered.filter(internship => 
        internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'All') {
      filtered = filtered.filter(internship => internship.status === statusFilter);
    }
    
    setFilteredInternships(filtered);
  }, [internships, searchTerm, statusFilter]);

  const handleAddInternship = () => {
    navigate('/internship/new');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInternships();
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleMenuOpen = (event, internship) => {
    // Prevent event propagation to avoid any parent element clicks
    event.stopPropagation();
    // Set the anchor element for the menu
    setAnchorEl(event.currentTarget);
    // Set the selected internship
    setSelectedInternship(internship);
    console.log('Menu opened for internship:', internship);
  };

  const handleMenuClose = () => {
    // Clear the anchor element
    setAnchorEl(null);
    // Keep the selected internship for a moment to allow handlers to use it
    // Then clear it after a short delay
    setTimeout(() => {
      setSelectedInternship(null);
    }, 100);
    console.log('Menu closed');
  };

  const handleEdit = () => {
    // Prevent any potential race conditions by capturing the current value
    const internship = selectedInternship;
    
    console.log('Selected internship in handleEdit:', internship);
    
    if (internship && internship.id) {
      console.log('Editing internship with ID:', internship.id);
      // Close the menu first
      handleMenuClose();
      // Then navigate to edit page with internship ID using direct browser navigation
      try {
        const editUrl = `/internship/edit/${internship.id}`;
        console.log('Navigating to:', editUrl);
        // Force a full page navigation instead of using React Router
        window.location.href = editUrl;
      } catch (error) {
        console.error('Navigation error:', error);
      }
    } else {
      console.error('No internship selected or missing ID');
      setError('Cannot edit: internship information is missing');
      handleMenuClose();
    }
  };

  const handleDelete = async () => {
    // Prevent any potential race conditions by capturing the current value
    const internship = selectedInternship;
    
    if (internship && internship.id) {
      console.log('Deleting internship:', internship.id);
      // Close the menu first to improve UI responsiveness
      handleMenuClose();
      
      try {
        setLoading(true);
        await internshipApi.deleteInternship(internship.id);
        // Remove from both states
        setInternships(prevInternships => prevInternships.filter(i => i.id !== internship.id));
        setFilteredInternships(prevFiltered => prevFiltered.filter(i => i.id !== internship.id));
        console.log('Internship deleted successfully');
      } catch (err) {
        console.error('Error deleting internship:', err);
        setError('Failed to delete internship: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    } else {
      console.error('No internship selected or missing ID');
      setError('Cannot delete: internship information is missing');
      handleMenuClose();
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    // Prevent any potential race conditions by capturing the current value
    const internship = selectedInternship;
    
    if (internship && internship.id) {
      console.log(`Updating status for internship ${internship.id} to ${newStatus}`);
      // Close the menu first to improve UI responsiveness
      handleMenuClose();
      
      try {
        setLoading(true);
        // Make the API call
        await internshipApi.updateInternshipStatus(internship.id, newStatus);
        
        // Update both internships and filteredInternships arrays
        setInternships(prevInternships => 
          prevInternships.map(i => 
            i.id === internship.id ? { ...i, status: newStatus } : i
          )
        );
        
        // Also update filtered internships to reflect the change immediately
        setFilteredInternships(prevFiltered => {
          // First update the status
          const updated = prevFiltered.map(i => 
            i.id === internship.id ? { ...i, status: newStatus } : i
          );
          
          // Then apply current filters if needed
          if (statusFilter !== 'All' && newStatus !== statusFilter) {
            // If the new status doesn't match the filter, remove it from filtered list
            return updated.filter(i => i.id !== internship.id);
          }
          return updated;
        });
        
        console.log(`Status updated successfully to ${newStatus}`);
      } catch (err) {
        console.error('Error updating status:', err);
        setError('Failed to update status: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    } else {
      console.error('No internship selected or missing ID');
      setError('Cannot update status: internship information is missing');
      handleMenuClose();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return 'warning';
      case 'Interview':
        return 'info';
      case 'Accepted':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Applied':
        return <WorkIcon />;
      case 'Interview':
        return <ScheduleIcon />;
      case 'Accepted':
        return <TrendingUpIcon />;
      case 'Rejected':
        return <BusinessIcon />;
      default:
        return <WorkIcon />;
    }
  };

  // Available status options for filtering
  const statusOptions = ['All', 'Applied', 'Interview', 'Accepted', 'Rejected'];

  // Calculate stats for dashboard
  const stats = [
    {
      title: 'Total Applications',
      value: internships.length,
      icon: <WorkIcon />,
      color: 'primary',
      bgColor: 'rgba(37, 99, 235, 0.1)',
    },
    {
      title: 'Applied',
      value: internships.filter(i => i.status === 'Applied').length,
      icon: <WorkIcon />,
      color: 'warning',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
      title: 'Interviews',
      value: internships.filter(i => i.status === 'Interview').length,
      icon: <ScheduleIcon />,
      color: 'info',
      bgColor: 'rgba(6, 182, 212, 0.1)',
    },
    {
      title: 'Accepted',
      value: internships.filter(i => i.status === 'Accepted').length,
      icon: <TrendingUpIcon />,
      color: 'success',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
  ];

  // Calculate application success rate
  const totalApplications = internships.length;
  const acceptedApplications = internships.filter(i => i.status === 'Accepted').length;
  const successRate = totalApplications > 0 ? (acceptedApplications / totalApplications) * 100 : 0;

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading your internships...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated()) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Fade in={true} timeout={800}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                <WorkIcon fontSize="large" />
              </Avatar>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Welcome to Internship Tracker
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                Please log in to view and manage your internship applications
              </Typography>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/login"
              sx={{ mr: 2, px: 4, py: 1.2 }}
              size="large"
            >
              Log In
            </Button>
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              to="/register"
              sx={{ px: 4, py: 1.2 }}
              size="large"
            >
              Register
            </Button>
          </CardContent>
        </Card>
        </Fade>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      pt: 3, 
      pb: 8 
    }}>
      <Container maxWidth="xl">
      {/* Dashboard Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          right: 0, 
          width: '100%', 
          height: '100%', 
          opacity: 0.1,
          background: 'url(https://www.transparenttextures.com/patterns/cubes.png)'
        }} />
        <Box sx={{ 
          position: 'relative', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          gap: 2
        }}>
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Internship Dashboard
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Track and manage your internship applications
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, md: 0 } }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={handleAddInternship}
              sx={{ 
                borderRadius: 3,
                px: 3,
                py: 1.2,
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              Add New
            </Button>
            <Tooltip title="Refresh data">
              <IconButton 
                onClick={handleRefresh} 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)', 
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 4, 
                height: '100%',
                border: '1px solid',
                borderColor: 'rgba(0, 0, 0, 0.05)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 20px -10px rgba(0, 0, 0, 0.1)',
                  borderColor: `${theme.palette[stat.color].light}40`,
                }
              }}
            >
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: `${theme.palette[stat.color].light}15`,
                  borderRadius: '0 0 0 100%',
                }}
              />
              <CardContent sx={{ position: 'relative', p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box>
                    <Typography 
                      variant="subtitle1" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ fontWeight: 500, fontSize: '0.95rem' }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography 
                      variant="h3" 
                      fontWeight="bold" 
                      color={`${stat.color}.main`}
                      sx={{ mt: 1 }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: `${theme.palette[stat.color].light}25`,
                      color: theme.palette[stat.color].main,
                      width: 56,
                      height: 56,
                      boxShadow: `0 4px 12px ${theme.palette[stat.color].light}40`,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Success Rate Card */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.05)',
          background: `linear-gradient(to right, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper} 85%, ${successRate > 50 ? theme.palette.success.light : successRate > 25 ? theme.palette.warning.light : theme.palette.primary.light}15 100%)`,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, md: 0 } }}>
              <Avatar
                sx={{
                  backgroundColor: `${successRate > 50 ? theme.palette.success.light : successRate > 25 ? theme.palette.warning.light : theme.palette.primary.light}25`,
                  color: successRate > 50 ? theme.palette.success.main : successRate > 25 ? theme.palette.warning.main : theme.palette.primary.main,
                  width: 56,
                  height: 56,
                  mr: 2,
                  boxShadow: `0 4px 12px ${successRate > 50 ? theme.palette.success.light : successRate > 25 ? theme.palette.warning.light : theme.palette.primary.light}40`,
                }}
              >
                <TrendingUpIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  Application Success Rate
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {acceptedApplications} accepted out of {totalApplications} applications
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' }, mb: 1 }}>
              <Typography 
                variant="h2" 
                fontWeight="bold" 
                color={successRate > 50 ? 'success.main' : successRate > 25 ? 'warning.main' : 'primary.main'}
                sx={{ mb: 0.5 }}
              >
                {successRate.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={successRate} 
              sx={{ 
                height: 12, 
                borderRadius: 6, 
                mb: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                  backgroundImage: successRate > 50 
                    ? `linear-gradient(90deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)` 
                    : successRate > 25 
                      ? `linear-gradient(90deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`
                      : `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
                }
              }} 
              color={successRate > 50 ? 'success' : successRate > 25 ? 'warning' : 'primary'}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Search and Filter Bar */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.05)',
          background: theme.palette.background.paper,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1.5 }}>
              Search Internships
            </Typography>
            <TextField
              fullWidth
              placeholder="Search by company or role"
              value={searchTerm}
              onChange={handleSearch}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 3,
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(0, 0, 0, 0.01)',
                    boxShadow: `0 0 0 2px ${theme.palette.primary.light}40`,
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1.5 }}>
              Filter by Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {statusOptions.map((status) => {
                const isSelected = statusFilter === status;
                const chipColor = status === 'All' ? 'default' : 
                                  status === 'Applied' ? 'warning' :
                                  status === 'Interview' ? 'info' :
                                  status === 'Accepted' ? 'success' :
                                  status === 'Rejected' ? 'error' : 'default';
                
                return (
                  <Chip
                    key={status}
                    label={status}
                    onClick={() => handleFilterChange(status)}
                    color={isSelected ? chipColor : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                    icon={isSelected && status !== 'All' ? getStatusIcon(status) : undefined}
                    sx={{ 
                      borderRadius: 3,
                      px: 1,
                      fontWeight: isSelected ? 600 : 400,
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  />
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Applications Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="medium" sx={{
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: '50px',
            height: '4px',
            backgroundColor: theme.palette.primary.main,
            borderRadius: '2px'
          }
        }}>
          Your Applications
          {filteredInternships.length > 0 && (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({filteredInternships.length})
            </Typography>
          )}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {refreshing && <CircularProgress size={24} sx={{ mr: 2 }} />}
        </Box>
      </Box>

      {/* Empty State */}
      {internships.length === 0 ? (
        <Card sx={{ 
          p: 6, 
          textAlign: 'center', 
          borderRadius: 4,
          border: '1px dashed',
          borderColor: 'rgba(0, 0, 0, 0.1)',
          background: `linear-gradient(to bottom right, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}>
          <Box sx={{ mb: 3 }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 2, 
              bgcolor: 'primary.light',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)'
            }}>
              <DashboardIcon fontSize="large" />
            </Avatar>
          </Box>
          <Typography variant="h5" gutterBottom fontWeight="medium">
            No internships found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3, maxWidth: '500px', mx: 'auto' }}>
            Start by adding your first internship application
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddInternship}
            size="large"
            sx={{ 
              px: 4, 
              py: 1.2, 
              borderRadius: 3,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Add Internship
          </Button>
        </Card>
      ) : filteredInternships.length === 0 ? (
        <Card sx={{ 
          p: 4, 
          textAlign: 'center', 
          borderRadius: 4,
          border: '1px dashed',
          borderColor: 'rgba(0, 0, 0, 0.1)',
          background: `linear-gradient(to bottom right, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}>
          <Box sx={{ mb: 2 }}>
            <SearchIcon sx={{ fontSize: 48, color: theme.palette.grey[300], mb: 2 }} />
          </Box>
          <Typography variant="h6" gutterBottom>
            No matching internships
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: '500px', mx: 'auto', mb: 3 }}>
            Try adjusting your search or filter criteria
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
            sx={{ 
              px: 3, 
              py: 1,
              borderRadius: 3,
              '&:hover': {
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              },
              transition: 'all 0.2s ease'
            }}
          >
            Clear Filters
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredInternships.map((internship) => (
            <Grid item xs={12} sm={6} md={4} key={internship.id}>
              <Card 
                elevation={0} 
                sx={{ 
                  borderRadius: 4, 
                  transition: 'all 0.3s ease',
                  border: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.05)',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
                  overflow: 'visible',
                  '&:hover': { 
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.06)',
                    borderColor: 'rgba(0, 0, 0, 0.08)'
                  } 
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        {internship.company}
                      </Typography>
                      <Typography variant="body1" color="text.primary" gutterBottom sx={{ fontWeight: 500 }}>
                        {internship.role}
                      </Typography>
                      {(() => {
                        const resumeTitle = internship.resume?.title || internship.resumeTitle;
                        const resumeUrl = internship.resume?.url || internship.resumeUrl;
                        if (!resumeTitle) return null;
                        return (
                        <Tooltip title={resumeTitle} placement="top" arrow>
                          <Chip
                            size="small"
                            variant="outlined"
                            icon={<DescriptionIcon fontSize="small" />}
                            label={`Resume: ${resumeTitle}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!resumeUrl) return;
                              const url = resumeUrl.startsWith('http') ? resumeUrl : `http://localhost:8080${resumeUrl}`;
                              window.open(url, '_blank');
                            }}
                            sx={{ mt: 0.5, maxWidth: '100%' }}
                          />
                        </Tooltip>
                        );
                      })()}
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuOpen(e, internship)}
                      aria-label="internship-actions-button"
                      aria-controls="internship-actions-menu"
                      aria-haspopup="true"
                      sx={{ 
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                          color: theme.palette.primary.main
                        },
                        zIndex: 1
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Chip
                      icon={getStatusIcon(internship.status)}
                      label={internship.status}
                      color={getStatusColor(internship.status)}
                      size="small"
                      sx={{ 
                        borderRadius: 3,
                        fontWeight: 500,
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarTodayIcon 
                        fontSize="small" 
                        sx={{ 
                          mr: 0.5, 
                          color: theme.palette.text.secondary,
                          opacity: 0.7,
                          fontSize: '0.875rem'
                        }} 
                      />
                      {internship.appliedOn ? new Date(internship.appliedOn).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Menu for internship actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        MenuListProps={{
          'aria-labelledby': 'internship-actions-button',
          dense: true,
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: '180px',
            borderRadius: 2,
            mt: 1,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <MenuItem 
          onClick={handleEdit}
          sx={{
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1.5, color: theme.palette.primary.main }} /> Edit
        </MenuItem>
        <MenuItem 
          onClick={handleDelete}
          sx={{
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1.5, color: theme.palette.error.main }} /> Delete
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1, display: 'block', fontWeight: 500 }}>
          Change Status
        </Typography>
        {statusOptions.filter(status => status !== 'All').map((status) => (
          <MenuItem 
            key={status} 
            onClick={() => {
              // Call handleStatusUpdate with just the new status
              // The function will handle getting the internship ID
              handleStatusUpdate(status);
            }}
            disabled={selectedInternship && selectedInternship.status === status}
            sx={{
              py: 1.5,
              opacity: (selectedInternship && selectedInternship.status === status) ? 0.5 : 1,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <Box sx={{ mr: 1.5, color: theme.palette[getStatusColor(status)].main }}>
              {getStatusIcon(status)}
            </Box>
            <Typography variant="body2">{status}</Typography>
          </MenuItem>
        ))}
      </Menu>
      </Container>
    </Box>
  );
}

export default Dashboard;
