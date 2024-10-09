import React, { useState, useEffect } from 'react';
import './Counterfact.css';
import CounterfactHistory from './CounterfactHistory';

const UnmodifiedCounterfacts = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(100);
    const [selectedCounterfactId, setSelectedCounterfactId] = useState(null);
    const [editableData, setEditableData] = useState({}); // Store editable state for individual items

    const handleOpenHistory = (id) => {
        if (id) {
            setSelectedCounterfactId(id);
        } else {
            console.error("Invalid ID provided for history:", id);
        }
    };

    useEffect(() => {
        const fetchCounterfacts = async () => {
            const token = localStorage.getItem('authToken');
            setLoading(true);

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
                const calculatedTotalPages = result.num_pages || Math.ceil(result.count / pageSize);
                setTotalPages(calculatedTotalPages);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchCounterfacts();
    }, [page, pageSize]);

    const handlePageSizeChange = (event) => {
        setPageSize(Number(event.target.value));
        setPage(1);
    };

    const handleEditClick = (item) => {
        // Toggle editing for the clicked item
        if (selectedCounterfactId === item.case_id) {
            setSelectedCounterfactId(null); // Deselect if it's already selected
            setEditableData((prev) => ({ ...prev, [item.case_id]: undefined })); // Clear editable data for this item
        } else {
            setSelectedCounterfactId(item.case_id);
            // Clone the item to set it as editable
            setEditableData((prev) => ({ 
                ...prev, 
                [item.case_id]: { 
                    ...item, // clone item to avoid mutating original data
                } 
            }));
        }
    };

    const handleInputChange = (event, itemId) => {
        const { name, value } = event.target;
        setEditableData((prevData) => ({
            ...prevData,
            [itemId]: { 
                ...prevData[itemId], // Spread existing item data
                [name]: value, // Update only the changed field
            }, 
        }));
    };

    const handleSave = async (itemId) => {
        if (!itemId) {
            console.error("No itemId provided for saving:", itemId);
            return;
        }

        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`http://localhost:8000/api/counterfacts/${itemId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editableData[itemId]), // Use the specific item's editable data
            });

            if (!response.ok) {
                throw new Error('Failed to update record');
            }

            setData((prevData) =>
                prevData.map((item) => (item.case_id === itemId ? { ...editableData[itemId] } : item)) // Clone the updated item
            );
            setEditableData((prevData) => ({ ...prevData, [itemId]: undefined })); // Clear editable data for this item
            setSelectedCounterfactId(null); // Reset the selected ID after saving
        } catch (error) {
            console.error(error);
            setError(error);
        }
    };

    const renderPageSizeOptions = () => {
        const pageSizes = [50, 100, 200, 500];
        return pageSizes.map((size) => (
            <option key={size} value={size}>
                {size} per page
            </option>
        ));
    };

    const isNextDisabled = page >= totalPages;
    const isPreviousDisabled = page <= 1;

    if (loading) return <div className="loading-message">Loading...</div>;
    if (error) return <div className="error-message">Error: {error.message}</div>;

    return (
        <div className="counterfact-container">
            <h1>Unmodified Counter Facts</h1>
            <div className="page-selection">
                <label htmlFor="page-size-select">Items per page:</label>
                <select id="page-size-select" value={pageSize} onChange={handlePageSizeChange}>
                    {renderPageSizeOptions()}
                </select>
            </div>
            <div className="counterfact-list">
                {data.map((item) => (
                    <div 
                        className="counterfact-card" 
                        key={item.case_id} 
                        onClick={() => handleEditClick(item)}  
                    >
                        <h2 className="card-title">Case ID: {item.case_id}</h2>
                        <div className="card-content">
                            <h3>Pararel Index:</h3>
                            <input 
                                type="text" 
                                name="pararel_idx" 
                                value={editableData[item.case_id]?.pararel_idx || item.pararel_idx} 
                                onChange={(e) => handleInputChange(e, item.case_id)}
                                readOnly={!selectedCounterfactId || selectedCounterfactId !== item.case_id} // Make read-only if not selected
                            />
                            <h3>Requested Rewrite Prompt:</h3>
                            <input 
                                type="text" 
                                name="requested_rewrite__prompt" 
                                value={editableData[item.case_id]?.requested_rewrite__prompt || item.requested_rewrite__prompt} 
                                onChange={(e) => handleInputChange(e, item.case_id)}
                                readOnly={!selectedCounterfactId || selectedCounterfactId !== item.case_id} // Make read-only if not selected
                            />
                            <h3>Paraphrase Prompts:</h3>
                            <input 
                                type="text" 
                                name="paraphrase_prompts" 
                                value={editableData[item.case_id]?.paraphrase_prompts || item.paraphrase_prompts} 
                                onChange={(e) => handleInputChange(e, item.case_id)}
                                readOnly={!selectedCounterfactId || selectedCounterfactId !== item.case_id} // Make read-only if not selected
                            />
                            <h3>Neighborhood Prompts:</h3>
                            <input 
                                type="text" 
                                name="neighborhood_prompts" 
                                value={editableData[item.case_id]?.neighborhood_prompts || item.neighborhood_prompts} 
                                onChange={(e) => handleInputChange(e, item.case_id)}
                                readOnly={!selectedCounterfactId || selectedCounterfactId !== item.case_id} // Make read-only if not selected
                            />
                            <h3>Attribute Prompts:</h3>
                            <input 
                                type="text" 
                                name="attribute_prompts" 
                                value={editableData[item.case_id]?.attribute_prompts || item.attribute_prompts} 
                                onChange={(e) => handleInputChange(e, item.case_id)}
                                readOnly={!selectedCounterfactId || selectedCounterfactId !== item.case_id} // Make read-only if not selected
                            />
                            <h3>Generation Prompts:</h3>
                            <input 
                                type="text" 
                                name="generation_prompts" 
                                value={editableData[item.case_id]?.generation_prompts || item.generation_prompts} 
                                onChange={(e) => handleInputChange(e, item.case_id)}
                                readOnly={!selectedCounterfactId || selectedCounterfactId !== item.case_id} // Make read-only if not selected
                            />
                            {selectedCounterfactId === item.case_id && (
                                <button onClick={() => handleSave(item.case_id)}>Save</button>
                            )}
                        </div>
                        <button onClick={() => handleOpenHistory(item.case_id)}>View History</button>
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
            {selectedCounterfactId && (
                <CounterfactHistory id={selectedCounterfactId} />
            )}
        </div>
    );
};

export default UnmodifiedCounterfacts;
