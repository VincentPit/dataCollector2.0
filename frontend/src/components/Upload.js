import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UploadPage = () => {
    const [link, setLink] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [isLinkValid, setIsLinkValid] = useState(false); // New state to track link validity
    const navigate = useNavigate(); // Initialize navigate


    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login'); // Redirect to login if not authenticated
        }
    }, [navigate]);


    const handleLinkChange = (e) => {
        setLink(e.target.value);
        setError('');
        setSuccessMessage('');
        setIsLinkValid(false); // Reset validity when link changes
    };

    const validateLink = (url) => {
        const urlPattern = new RegExp('^(https?://)');
        const jsonPattern = /\.json$/;
        return urlPattern.test(url) && jsonPattern.test(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateLink(link)) {
            setError('Please provide a valid JSON file URL.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/upload/validate/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('token')}`, // Include token in request
                },
                body: JSON.stringify({ link }),
            });

            if (response.ok) {
                setIsLinkValid(true); // Set link validity to true
                setSuccessMessage('The link is valid! Click "Start Download" to begin the download.');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to validate the link.');
                setIsLinkValid(false); // Set link validity to false
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!isLinkValid) {
            setError('Please validate the link before downloading.');
            return;
        }

        setIsDownloading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/upload/download/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('token')}`, // Include token in request
                },
                body: JSON.stringify({ link }),
            });

            if (response.ok) {
                setSuccessMessage('Download started successfully!');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to start download.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div style={containerStyle}>
            <h1>Upload JSON File via Link</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={link}
                    onChange={handleLinkChange}
                    placeholder="Enter link to JSON file"
                    style={inputStyle}
                />
                <button type="submit" style={buttonStyle} disabled={isLoading}>
                    {isLoading ? 'Validating...' : 'Validate Link'}
                </button>
            </form>
            <button
                style={buttonStyle}
                onClick={handleDownload}
                disabled={isDownloading || !isLinkValid}
            >
                {isDownloading ? 'Downloading...' : 'Start Download'}
            </button>
            <button onClick={() => navigate('/home')}>Back to Home</button>
            {error && <p style={errorStyle}>{error}</p>}
            {successMessage && <p style={successStyle}>{successMessage}</p>}
        </div>
    );
};

// Styles
const containerStyle = {
    textAlign: 'center',
    marginTop: '20px',
};

const inputStyle = {
    padding: '10px',
    fontSize: '16px',
    width: '300px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    margin: '20px 0',
};

const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#28a745',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
};

const errorStyle = {
    color: 'red',
};

const successStyle = {
    color: 'green',
};

export default UploadPage;
