import React, { useState, useEffect } from 'react';
import './Counterfact.css'; // Import CSS for styling

const UnmodifiedCounterfacts = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);  // Initialize page to 1
    const [totalPages, setTotalPages] = useState(1);  // Initialize total pages
    const [pageSize, setPageSize] = useState(100);  // Set a default page size

    useEffect(() => {
        const fetchCounterfacts = async () => {
            const token = localStorage.getItem('authToken');
            setLoading(true); // Set loading to true when fetching data

            try {
                const response = await fetch(`http://localhost:8000/api/counterfacts/unmodified/?page=${page}&page_size=${pageSize}`, {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const result = await response.json();
                setData(result.results);

                // Manually calculate totalPages if num_pages is not present
                const calculatedTotalPages = result.num_pages || Math.ceil(result.count / pageSize);
                setTotalPages(calculatedTotalPages);  // Update totalPages based on response

            } catch (error) {
                setError(error);
            } finally {
                setLoading(false); // Ensure loading stops after fetching
            }
        };

        fetchCounterfacts();
    }, [page, pageSize]);  // Add `pageSize` as a dependency to refetch when page size changes

    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));  // Update page size based on user selection
        setPage(1);  // Reset to page 1 when page size changes
    };

    const renderPageSizeOptions = () => {
        const pageSizes = [50, 100, 200, 500];  // Define available page sizes
        return pageSizes.map(size => (
            <option key={size} value={size}>
                {size} per page
            </option>
        ));
    };

    // Disable the Next button if we're on the last page
    const isNextDisabled = page >= totalPages;
    // Disable the Previous button if we're on the first page
    const isPreviousDisabled = page <= 1;

    // If loading, show loading message
    if (loading) return <div className="loading-message">Loading...</div>;
    // If error occurs, show error message
    if (error) return <div className="error-message">Error: {error.message}</div>;

    return (
        <div className="counterfact-container">
            <h1>Unmodified Counter Facts</h1>
            <div className="page-selection">
                <label htmlFor="page-size-select">Items per page:</label>
                <select id="page-size-select" value={pageSize} onChange={handlePageSizeChange}>
                    {renderPageSizeOptions()}  {/* Render page size dropdown */}
                </select>
            </div>
            <div className="counterfact-list">
                {data.map((item) => (
                    <div className="counterfact-card" key={item.id}>
                        <h2 className="card-title">Case ID: {item.id}</h2>
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
                <button 
                    disabled={isPreviousDisabled} 
                    onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
                >
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button 
                    disabled={isNextDisabled} 
                    onClick={() => setPage((prevPage) => Math.min(prevPage + 1, totalPages))}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default UnmodifiedCounterfacts;
