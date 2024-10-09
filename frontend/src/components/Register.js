import React, { useState } from 'react';
import { registerUser } from '../api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleRegister = async (e) => {
        e.preventDefault();
        const response = await registerUser({ username, password });
        
        if (response.message === 'User created successfully!') {
            setMessage(response.message);
            // Navigate to login page after successful registration
            setTimeout(() => {
                navigate('/login'); // Use navigate to go to the login page
            }, 2000); // Optional: Wait for 2 seconds before redirecting
        } else {
            setMessage(response.message || 'Registration failed!');
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
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
                <button type="submit">Register</button>
            </form>
            {message && <p>{message}</p>}
            {/* Option to go back to login */}
            {message === 'User already exists!' && (
                <p>
                    Already have an account? <button onClick={() => navigate('/login')}>Login here</button>
                </p>
            )}
        </div>
    );
};

export default Register;
