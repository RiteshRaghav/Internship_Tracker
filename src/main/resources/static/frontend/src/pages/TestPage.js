import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TestPage = () => {
    const { user, login, register, logout } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [branch, setBranch] = useState('');
    const [college, setCollege] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login({ email, password });
            setMessage('Login successful!');
        } catch (error) {
            setMessage(error.message);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await register({
                name,
                email,
                password,
                branch,
                college
            });
            setMessage('Registration successful!');
        } catch (error) {
            setMessage(error.message);
        }
    };

    const handleProtected = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/test/protected', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMessage(response.data);
        } catch (error) {
            setMessage(error.response?.data || error.message);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Test Authentication</h1>
            
            <div style={{ margin: '20px 0' }}>
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ margin: '5px 0' }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ margin: '5px 0' }}
                    />
                    <button type="submit">Login</button>
                </form>
            </div>

            <div style={{ margin: '20px 0' }}>
                <h2>Register</h2>
                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ margin: '5px 0' }}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ margin: '5px 0' }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ margin: '5px 0' }}
                    />
                    <input
                        type="text"
                        placeholder="Branch"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        style={{ margin: '5px 0' }}
                    />
                    <input
                        type="text"
                        placeholder="College"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        style={{ margin: '5px 0' }}
                    />
                    <button type="submit">Register</button>
                </form>
            </div>

            {user && (
                <div>
                    <h2>Protected Endpoint</h2>
                    <button onClick={handleProtected}>Test Protected Endpoint</button>
                    <button onClick={logout} style={{ marginLeft: '10px' }}>Logout</button>
                </div>
            )}

            <div style={{ marginTop: '20px' }}>
                <h3>Message:</h3>
                <p>{message}</p>
            </div>
        </div>
    );
};

export default TestPage;
