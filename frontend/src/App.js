// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import QA_ZRE from './components/QA_ZRE';
import ModifiedQA_ZRE from './components/ModifiedQA_ZRE';
import UnmodifiedQA_ZRE from './components/UnmodifiedQA_ZRE';
import Counterfact from './components/Counterfact';
import UnmodifiedCounterfacts from './components/UnmodifiedCounterfact';  
import ModifiedCounterfacts from './components/ModifiedCounterfact';  
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './AuthContext';

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
                        path="/qa_zre"
                        element={
                            <ProtectedRoute>
                                <QA_ZRE />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/unmodified-qa-zre" 
                        element={
                            <ProtectedRoute>
                                <UnmodifiedQA_ZRE />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/modified-qa-zre" 
                        element={
                            <ProtectedRoute>
                                <ModifiedQA_ZRE />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/counterfact"
                        element={
                            <ProtectedRoute>
                                <Counterfact />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/unmodified-counterfacts" 
                        element={
                            <ProtectedRoute>
                                <UnmodifiedCounterfacts />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/modified-counterfacts" 
                        element={
                            <ProtectedRoute>
                                <ModifiedCounterfacts />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
