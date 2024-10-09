import React, { useState, useEffect } from 'react';
import './QA_ZRE.css'; // Import CSS file for styling

const ModifiedQA_ZRE = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(100); // You can set this to whatever you prefer

    useEffect(() => {
        const token = localStorage.getItem('authToken');

        fetch(`http://localhost:8000/api/qa_zre/modified/?page=${currentPage}&page_size=${pageSize}`, {
            headers: {
                'Authorization': `Token ${token}`,
            },
        })
        .then(async (response) => {
            const responseBody = await response.text();
            console.log('Response Body:', responseBody);

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${responseBody}`);
            }

            return JSON.parse(responseBody);
        })
        .then(data => {
            setData(data.results); // Adjust according to the response structure
            setTotalPages(data.num_pages); // Set total pages from response
        })
        .catch(error => {
            console.error('Error fetching Modified QA_ZRE:', error);
            setError(error);
        });
    }, [currentPage, pageSize]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={i === currentPage ? 'active' : ''}
                >
                    {i}
                </button>
            );
        }
        return pageNumbers;
    };

    if (error) {
        return <div className="error-message">Error: {error.message}</div>;
    }

    return (
        <div className="qa-zre-container">
            <h1>Modified QA_ZRE Data</h1>
            <div className="qa-zre-list">
                {!data || !Array.isArray(data) ? (
                    <div>Loading...</div>
                ) : (
                    data.map((item, index) => (
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
                            <h3 className="qa-modified">Is Modified:</h3>
                            <p>{item.is_modified ? 'Yes' : 'No'}</p>
                        </div>
                    ))
                )}
            </div>
            <div className="pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                </button>
                {renderPageNumbers()} {/* Render page numbers */}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
    };
    
export default ModifiedQA_ZRE;
    