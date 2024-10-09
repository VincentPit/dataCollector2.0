// src/api.js
const API_URL = 'http://localhost:8000/api'; // Update with your backend URL if different

export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return await response.json();
    } catch (error) {
        console.error('Error during registration:', error);
        return { message: 'Registration failed.' };
    }
};

export const loginUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return await response.json();
    } catch (error) {
        console.error('Error during login:', error);
        return { message: 'Login failed.' };
    }
};
