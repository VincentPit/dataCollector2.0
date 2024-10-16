import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const DatasetItems = () => {
    const { datasetId } = useParams();
    const [items, setItems] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchId, setSearchId] = useState('');
    const [searchedItem, setSearchedItem] = useState(null);
    const [pageSize, setPageSize] = useState(10);
    const navigate = useNavigate();

    const fetchItems = async (page = 1, size = pageSize) => {
        const token = localStorage.getItem('token');
        setIsLoading(true);

        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/datasets/${datasetId}/items/`, {
                headers: {
                    Authorization: `Token ${token}`,
                },
                params: {
                    page: page,
                    page_size: size,
                },
            });

            setItems(response.data.items);
            setCurrentPage(response.data.current_page);
            setTotalPages(response.data.total_pages);
            setSearchedItem(null);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while fetching dataset items.');
        } finally {
            setIsLoading(false);
        }
    };

    const searchItemById = async () => {
        const token = localStorage.getItem('token');
        setIsLoading(true);

        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/datasets/${datasetId}/items/${searchId}/`, {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            setSearchedItem(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Item not found.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems(currentPage, pageSize);
    }, [datasetId, currentPage, pageSize]);

    return (
        <div>
            <h1>Items in Dataset {datasetId}</h1>
            {isLoading && <p>Loading items...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Search Section */}
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Enter Item ID to Search"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                />
                <button onClick={searchItemById}>Search</button>
            </div>

            {/* Display the searched item if found */}
            {searchedItem ? (
                <div>
                    <h2>Searched Item</h2>
                    <div style={{ border: '1px solid #ccc', margin: '5px', padding: '10px' }}>
                        {Object.entries(searchedItem).map(([key, value]) => (
                            <div key={key}>
                                <strong>{key}:</strong> {value}
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setSearchedItem(null)}>Clear Search</button>
                </div>
            ) : (
                <>
                    {/* Pagination and Items Display */}
                    {items.length > 0 ? (
                        <ul>
                            {items.map((item) => (
                                <li key={item.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/datasets/${datasetId}/items/${item.id}/edit`)}>
                                    <div style={{ border: '1px solid #ccc', margin: '5px', padding: '10px' }}>
                                        {Object.entries(item).map(([key, value]) => (
                                            <div key={key}>
                                                <strong>{key}:</strong> {value}
                                            </div>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No items found in this dataset.</p>
                    )}

                    {/* Page Size Selection */}
                    <div style={{ marginBottom: '20px' }}>
                        <label htmlFor="pageSize">Items per page: </label>
                        <select
                            id="pageSize"
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>

                    {/* Pagination Controls */}
                    <div style={{ marginTop: '20px' }}>
                        {currentPage > 1 && (
                            <button onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                        )}
                        <span style={{ margin: '0 10px' }}>Page {currentPage} of {totalPages}</span>
                        {currentPage < totalPages && (
                            <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                        )}
                    </div>
                </>
            )}

            <button onClick={() => navigate('/original')} style={{ marginTop: '20px' }}>Back to Datasets</button>
        </div>
    );
};

export default DatasetItems;
