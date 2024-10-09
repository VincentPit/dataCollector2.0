import React, { useState, useEffect } from 'react';
import './Counterfact.css'; // Import CSS for styling

const ModifiedCounterfacts = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(100); // Default page size

    useEffect(() => {
        const token = localStorage.getItem('authToken');

        const fetchData = async () => {
            setLoading(true); // Set loading to true when fetching data
            try {
                const response = await fetch(`http://localhost:8000/api/counterfacts/modified/?page=${page}&page_size=${pageSize}`, {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error fetching data: ${response.statusText}`);
                }

                const result = await response.json();
                setData(result.results); // Fetch the data from response

                // Manually calculate totalPages if num_pages is not present
                const calculatedTotalPages = result.num_pages || Math.ceil(result.count / pageSize);
                setTotalPages(calculatedTotalPages); // Set total number of pages
            } catch (error) {
                console.error('Error fetching modified counter facts:', error);
                setError(error);
            } finally {
                setLoading(false); // Set loading to false after fetch completes
            }
        };

        fetchData();
    }, [page, pageSize]);

    if (loading) return <div className="loading-message">Loading...</div>;
    if (error) return <div className="error-message">Error: {error.message}</div>;

    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value)); // Update page size
        setPage(1); // Reset to first page on page size change
    };

    const renderPageSizeOptions = () => {
        const pageSizes = [50, 100, 200, 500]; // Example page sizes
        return pageSizes.map(size => (
            <option key={size} value={size}>
                {size} per page
            </option>
        ));
    };

    return (
        <div className="counterfact-container">
            <h1>Modified Counter Facts</h1>
            <div className="page-selection">
                <label htmlFor="page-size-select">Items per page:</label>
                <select id="page-size-select" value={pageSize} onChange={handlePageSizeChange}>
                    {renderPageSizeOptions()} {/* Render page size options in dropdown */}
                </select>
            </div>
            <div className="counterfact-list">
                {data.map((item, index) => (
                    <div className="counterfact-card" key={index}>
                        <h2 className="card-title">Case ID: {item.id}</h2>
                        <div className="card-content">
                            <h3>Question:</h3>
                            <p>{item.question}</p>
                            <h3>Relation:</h3>
                            <p>{item.relation}</p>
                            <h3>Subject:</h3>
                            <p>{item.subject}</p>
                            <h3>Context:</h3>
                            <p>{item.context}</p>
                            <h3>Answers:</h3>
                            <p>{JSON.stringify(item.answers)}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="pagination">
                <button 
                    disabled={page === 1} 
                    onClick={() => setPage(prevPage => Math.max(prevPage - 1, 1))}
                >
                    Previous
                </button>
                <span> Page {page} of {totalPages} </span>
                <button 
                    disabled={page === totalPages} 
                    onClick={() => setPage(prevPage => Math.min(prevPage + 1, totalPages))}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ModifiedCounterfacts;
