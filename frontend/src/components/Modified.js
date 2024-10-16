import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Original.css';

const Modified = () => {
    const [datasets, setDatasets] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Hook for programmatic navigation

    useEffect(() => {
        const fetchDatasets = async () => {
            const token = localStorage.getItem('token'); // Retrieve token

            // Check if token exists
            if (!token) {
                navigate('/login'); // Redirect to login if token is not found
                return;
            }

            try {
                const response = await axios.get('http://127.0.0.1:8000/api/modified_datasets/', {
                    headers: {
                        Authorization: `Token ${token}`, // Include token in headers
                    },
                });
                console.log(response.data.datasets);
                setDatasets(response.data.datasets);
            } catch (err) {
                // Handle specific error messages based on response
                setError(err.response?.data?.message || 'An error occurred while fetching datasets.');
            }
        };

        fetchDatasets();
    }, [navigate]); // Added navigate to the dependency array

    // Function to handle dataset click
    const handleDatasetClick = (datasetId) => {
        navigate(`/datasets/${datasetId}`); // Navigate to the DatasetItems page with datasetId
    };

    return (
        <div>
            <h1>Stored Datasets</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {datasets.length > 0 ? (
                <ul>
                    {datasets.map((dataset, index) => (
                        <li key={index} onClick={() => handleDatasetClick(dataset)} style={{ cursor: 'pointer', color: 'blue' }}>
                            {dataset} 
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No datasets found.</p>
            )}
            <button onClick={() => navigate('/upload')}>Back to Upload</button>
            <button onClick={() => navigate('/home')}>Back to Home</button>
            <button onClick={() => navigate('/original')}>Back to Original</button>
        </div>
    );
};

export default Modified;
