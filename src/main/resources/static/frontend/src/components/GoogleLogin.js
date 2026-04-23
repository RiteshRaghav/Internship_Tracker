import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { AuthService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const GoogleLogin = () => {
    const navigate = useNavigate();

    const login = useGoogleLogin({
        onSuccess: async (response) => {
            try {
                // Send the access token to your backend
                const result = await AuthService.googleLogin(response.access_token);
                if (result) {
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Google login error:', error);
            }
        },
        onError: (error) => console.error('Google Login Failed:', error)
    });

    return (
        <Button
            variant="contained"
            onClick={() => login()}
            startIcon={<GoogleIcon />}
            fullWidth
            sx={{
                mt: 2,
                mb: 2,
                backgroundColor: '#fff',
                color: '#757575',
                '&:hover': {
                    backgroundColor: '#f5f5f5',
                },
                textTransform: 'none',
                border: '1px solid #dadce0',
            }}
        >
            Sign in with Google
        </Button>
    );
};

export default GoogleLogin;