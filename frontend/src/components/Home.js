import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={containerStyle}>
            <h1>Welcome to the Home Page!</h1>
            <p>Please choose one of the options below:</p>
            <div style={buttonContainerStyle}>
                <Link to="/upload">
                    <button style={buttonStyle}>Upload</button>
                </Link>
                <Link to="/original">
                    <button style={buttonStyle}>Original</button>
                </Link>
                <Link to="/modified">
                    <button style={buttonStyle}>Modified</button>
                </Link>

            </div>
        </div>
    );
};

// Styles
const containerStyle = {
    textAlign: 'center',
    marginTop: '20px',
};

const buttonContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center align the buttons
};

const buttonStyle = {
    padding: '15px 30px', // Increased padding for bigger buttons
    fontSize: '18px', // Increased font size
    color: '#fff',
    backgroundColor: '#007bff', // Bootstrap primary color
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    margin: '10px 0', // Margin for spacing between buttons
    width: '250px', // Fixed width for consistent button size
};

export default Home;
