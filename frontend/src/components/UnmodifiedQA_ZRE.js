import React, { useState, useEffect } from 'react';
import './QA_ZRE.css'; // Import CSS file for styling

const UnmodifiedQA_ZRE = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // New loading state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(100); // Default page size

    useEffect(() => {
        const token = localStorage.getItem('authToken');

        const fetchData = async () => {
            setLoading(true); // Set loading to true when fetch starts
            try {
                const response = await fetch(`http://localhost:8000/api/qa_zre/unmodified/?page=${currentPage}&page_size=${pageSize}`, {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`Network response was not ok: ${errorBody}`);
                }

                const responseBody = await response.json();
                console.log('Response Body:', responseBody);

                setData(responseBody.results || []); // Set results to an empty array if undefined
                setTotalPages(Math.ceil(responseBody.count / pageSize) || 0); // Calculate total pages based on count

                // Debugging logs
                console.log('Data fetched:', responseBody.results);
                console.log('Current Page:', currentPage);
                console.log('Total Pages:', totalPages);
            } catch (error) {
                console.error('Error fetching Unmodified QA_ZRE:', error);
                setError(error);
            } finally {
                setLoading(false); // Set loading to false after fetch completes
            }
        };

        fetchData();
    }, [currentPage, pageSize]);

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

    const handlePageChange = (event) => {
        setCurrentPage(Number(event.target.value)); // Update currentPage from dropdown
    };

    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value)); // Update pageSize from dropdown
        setCurrentPage(1); // Reset to first page on page size change
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(
                <option key={i} value={i}>
                    Page {i}
                </option>
            );
        }
        return pageNumbers;
    };

    const renderPageSizeOptions = () => {
        const pageSizes = [50, 100, 200, 500]; // Example page sizes
        return pageSizes.map(size => (
            <option key={size} value={size}>
                {size} per page
            </option>
        ));
    };

    if (loading) {
        return <div className="loading-message">Loading...</div>; // Loading message
    }

    if (error) {
        return <div className="error-message">Error: {error.message}</div>;
    }

    return (
        <div className="qa-zre-container">
            <h1>Unmodified QA_ZRE Data</h1>

            <div className="page-selection">
                <label htmlFor="page-size-select">Items per page:</label>
                <select id="page-size-select" value={pageSize} onChange={handlePageSizeChange}>
                    {renderPageSizeOptions()} {/* Render page size options in dropdown */}
                </select>
            </div>

            <div className="page-selection">
                <label htmlFor="page-select">Select Page:</label>
                <select id="page-select" value={currentPage} onChange={handlePageChange}>
                    {renderPageNumbers()} {/* Render page numbers in dropdown */}
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
                <button onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default UnmodifiedQA_ZRE;
