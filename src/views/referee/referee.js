import React, { useState, useEffect } from 'react';
import './referee.css';

const RefereePage = () => {
    const [refereeData, setRefereeData] = useState({
        username: '',
        category: '',
        phoneNumber: '',
        email: ''
    });

    useEffect(() => {
        // API'den hakem bilgilerini al
        fetchRefereeData();
    }, []);

    const fetchRefereeData = async () => {
        try {
            const response = await fetch('/referee', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Eğer authentication token kullanıyorsanız:
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Hakem bilgileri alınamadı');
            }

            const data = await response.json();
            setRefereeData({
                username: data.name,
                category: data.category,
                phoneNumber: data.phoneNumber,
                email: data.mail
            });
        } catch (error) {
            console.error('Hakem bilgileri alınamadı:', error);
        }
    };

    return (
        <div className="referee-container">
            <div className="referee-header">
                <h1>Hakem Profili</h1>
            </div>
            
            <div className="referee-content">
                <div className="referee-info-card">
                    <div className="info-group">
                        <label>İsim:</label>
                        <p>{refereeData.username}</p>
                    </div>
                    
                    <div className="info-group">
                        <label>Kategori:</label>
                        <p>{refereeData.category}</p>
                    </div>
                    
                    <div className="info-group">
                        <label>Telefon:</label>
                        <p>{refereeData.phoneNumber}</p>
                    </div>
                    
                    <div className="info-group">
                        <label>E-posta:</label>
                        <p>{refereeData.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefereePage;
