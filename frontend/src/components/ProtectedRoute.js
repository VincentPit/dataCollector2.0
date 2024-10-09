import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Assuming this is your custom authentication context

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    
    // If the user is authenticated, render the child components
    // If not, redirect to the login page
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
