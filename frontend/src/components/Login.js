// src/components/Login.js
import React, { useState } from 'react';
import { loginUser } from '../api'; // Ensure this function sends a POST request to your API
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage(''); // Reset message on new login attempt

        try {
            const response = await loginUser({ username, password });

            if (response.token) {
                // Store the token in local storage
                localStorage.setItem('authToken', response.token); // Store token for later use
                login(response.token); // Update the authentication state
                navigate('/home'); // Navigate to home on successful login
            } else {
                setMessage(response.message || 'Login failed!');
            }
        } catch (error) {
            console.error('Login error:', error); // Log error for debugging
            setMessage('An error occurred during login. Please try again.'); // Set error message
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>} {/* Display message if exists */}
        </div>
    );
};

export default Login;
