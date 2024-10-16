import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditItem = () => {
    const { datasetId, itemId } = useParams();
    const [item, setItem] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchItem = async () => {
        const token = localStorage.getItem('token');
        setIsLoading(true);

        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/datasets/${datasetId}/items/${itemId}/`, {
                headers: { Authorization: `Token ${token}` },
            });
            setItem(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch item.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setItem((prevItem) => ({
            ...prevItem,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            // Using GET to send updated item data
            await axios.get(`http://127.0.0.1:8000/api/datasets/${datasetId}/items/edit/${itemId}/`, {
                headers: { Authorization: `Token ${token}` },
                params: item, // Pass item data as query parameters
            });
            navigate(`/datasets/${datasetId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating item.');
        }
    };

    useEffect(() => {
        fetchItem();
    }, [datasetId, itemId]);

    if (isLoading) return <p>Loading item...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h1>Edit Item {itemId}</h1>
            <form onSubmit={handleSubmit}>
                {item && Object.entries(item).map(([key, value]) => (
                    key !== 'id' && (
                        <div key={key} style={{ marginBottom: '15px' }}>
                            <label htmlFor={key}>{key}:</label>
                            <textarea
                                id={key}
                                name={key}
                                value={value}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', height: '100px', resize: 'vertical' }}
                            />
                        </div>
                    )
                ))}
                <button type="submit">Save Changes</button>
            </form>
            <button onClick={() => navigate(`/datasets/${datasetId}`)} style={{ marginTop: '20px' }}>
                Cancel
            </button>
        </div>
    );
};

export default EditItem;
