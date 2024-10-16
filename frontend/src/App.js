// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import UploadPage from './components/Upload';
import Original from './components/Origininal';
import DatasetItems from './components/DatasetItems';
import EditItem from './components/EditItem';
import Modified from './components/Modified';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Redirect from root path to login */}
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/upload" 
                        element={
                            <ProtectedRoute>
                                <UploadPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="/original" 
                        element={
                            <ProtectedRoute>
                                <Original />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path="/datasets/:datasetId"
                        element={
                            <ProtectedRoute>
                                <DatasetItems />
                            </ProtectedRoute>
                        }
                    />

                    <Route 
                        path="/datasets/:datasetId/items/:itemId/edit"
                        element={
                            <ProtectedRoute>
                                <EditItem />
                            </ProtectedRoute>
                        }
                    />

<Route 
                        path="/modified"
                        element={
                            <ProtectedRoute>
                                <Modified />
                            </ProtectedRoute>
                        }
                    />



                </Routes>
                
            </Router>
        </AuthProvider>
    );
};

export default App;
