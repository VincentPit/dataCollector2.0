import React, { useState, useEffect } from 'react';
import './Counterfact.css'; // Import CSS file for styling

const Counterfact = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(100); // Adjust page size as needed

    useEffect(() => {
        const token = localStorage.getItem('authToken'); // Assuming token is stored in localStorage

        fetch(`http://localhost:8000/api/counterfacts/?page=${currentPage}&page_size=${pageSize}`, {
            headers: {
                'Authorization': `Token ${token}`,
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            setData(data.results); // Adjust according to the response structure
            setTotalPages(data.total_pages); // Set total pages from response
        })
        .catch(error => {
            console.error('Error fetching Counterfact:', error);
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
        <div className="counterfact-container">
            <h1>Counterfact Model Data</h1>
            <div className="counterfact-list">
                {data.map((item, index) => (
                    <div className="counterfact-card" key={index}>
                        <h2 className="card-title">Case ID: {item.case_id}</h2>
                        <div className="card-content">
                            <h3>Pararel Index:</h3>
                            <p>{item.pararel_idx}</p>
                            <h3>Requested Rewrite Prompt:</h3>
                            <p>{item.requested_rewrite__prompt}</p>
                            <h3>Paraphrase Prompts:</h3>
                            <p>{JSON.stringify(item.paraphrase_prompts)}</p>
                            <h3>Neighborhood Prompts:</h3>
                            <p>{JSON.stringify(item.neighborhood_prompts)}</p>
                            <h3>Attribute Prompts:</h3>
                            <p>{JSON.stringify(item.attribute_prompts)}</p>
                            <h3>Generation Prompts:</h3>
                            <p>{JSON.stringify(item.generation_prompts)}</p>
                        </div>
                    </div>
                ))}
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

export default Counterfact;
