import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AuthService } from '../services/authService';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setDevToken('');
    try {
      const res = await AuthService.requestPasswordReset(email);
      setSuccess(res?.message || 'If the email exists, a reset link has been sent.');
      if (res?.token) setDevToken(res.token);
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={0} sx={{ mt: 8, p: 4, borderRadius: 4, border: '1px solid rgba(0,0,0,0.05)' }}>
        <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Forgot Password
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Enter your email to receive password reset instructions.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {devToken && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Dev token (no email service configured): {devToken}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            required
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mb: 2 }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          <Button component={RouterLink} to="/login" fullWidth variant="text">
            Back to Sign In
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ForgotPassword;
