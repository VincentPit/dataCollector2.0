import React, { useState, useEffect } from 'react';
import './QA_ZRE.css'; // Import CSS file for styling

const QA_ZRE = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [pageSize, setPageSize] = useState(100); // Default page size

    const fetchData = async (page) => {
        const token = localStorage.getItem('authToken');

        setLoading(true); // Set loading state to true

        try {
            const response = await fetch(`http://localhost:8000/api/qa_zre/?page=${page}&page_size=${pageSize}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (!response.ok) {
                const responseBody = await response.json();
                throw new Error(`Network response was not ok: ${responseBody}`);
            }

            const responseBody = await response.json();
            setData(responseBody.results); // Assuming results key contains the data
            setTotalPages(Math.ceil(responseBody.count / pageSize)); // Calculate total pages
        } catch (error) {
            console.error('Error fetching QA_ZRE:', error);
            setError(error);
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    useEffect(() => {
        fetchData(currentPage); // Fetch data for the current page
    }, [currentPage, pageSize]); // Fetch data whenever currentPage or pageSize changes

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setCurrentPage(1); // Reset to the first page on page size change
    };

    if (loading) {
        return <div className="loading-message">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error.message}</div>;
    }

    return (
        <div className="qa-zre-container">
            <h1>QA_ZRE Data</h1>
            <div>
                <label htmlFor="page-size">Items per page:</label>
                <select id="page-size" value={pageSize} onChange={handlePageSizeChange}>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                </select>
            </div>
            <div className="qa-zre-list">
                {data.map((item, index) => (
                    <div className="qa-zre-card" key={index}>
                        <h2 className="qa-question">Question:</h2>
                        <p>{item.question}</p>
                        <h3 className="qa-relation">Relation:</h3>
                        <p>{item.relation}</p>
                        <h3 className="qa-subject">Subject:</h3>
                        <p>{item.subject}</p>
                        <h3 className="qa-context">Context:</h3>
                        <p>{item.context}</p>
                        <h3 className="qa-answers">Answers:</h3>
                        <p>{JSON.stringify(item.answers)}</p>
                    </div>
                ))}
            </div>
            <div className="pagination-controls">
                <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                    Previous
                </button>
                <span> Page {currentPage} of {totalPages} </span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default QA_ZRE;
