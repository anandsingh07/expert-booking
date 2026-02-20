import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Briefcase, DollarSign, Calendar } from 'lucide-react';
import { getExpertById } from '../services/api';
import socket from '../services/socket';

function groupSlotsByDate(slots) {
    return slots.reduce((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {});
}

function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function ExpertDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [expert, setExpert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        setLoading(true);
        getExpertById(id)
            .then(res => { setExpert(res.data.data); setLoading(false); })
            .catch(() => { setError('Failed to load expert.'); setLoading(false); });
    }, [id]);

    // Real-time slot updates
    useEffect(() => {
        const handleSlotUpdate = ({ expertId, date, timeSlot, isBooked }) => {
            if (expertId !== id) return;
            setExpert(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    slots: prev.slots.map(s =>
                        s.date === date && s.time === timeSlot ? { ...s, isBooked } : s
                    ),
                };
            });
            // Clear selection if that slot is now booked
            if (isBooked && selectedSlot?.date === date && selectedSlot?.time === timeSlot) {
                setSelectedSlot(null);
            }
        };
        socket.on('slotUpdate', handleSlotUpdate);
        return () => socket.off('slotUpdate', handleSlotUpdate);
    }, [id, selectedSlot]);

    if (loading) return (
        <div className="loading-state" style={{ minHeight: '60vh' }}>
            <div className="spinner" />
            <p>Loading expert profile...</p>
        </div>
    );
    if (error) return <div className="error-state" style={{ padding: '4rem' }}>⚠️ {error}</div>;
    if (!expert) return null;

    const grouped = groupSlotsByDate(expert.slots || []);

    return (
        <div className="container" style={{ paddingBottom: '4rem', paddingTop: '1.5rem' }}>
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Back to Experts
            </button>

            <div className="detail-hero">
                <div>
                    <img src={expert.avatar} alt={expert.name} className="detail-avatar" />
                    <h1 className="detail-name">{expert.name}</h1>
                    <span className="detail-category">{expert.category}</span>
                    <div className="detail-stats">
                        <div className="stat-pill">
                            <div className="stat-val"><Star size={14} style={{ display: 'inline', color: '#fbbf24', verticalAlign: 'middle' }} /> {expert.rating.toFixed(1)}</div>
                            <div className="stat-label">Rating</div>
                        </div>
                        <div className="stat-pill">
                            <div className="stat-val">{expert.experience}</div>
                            <div className="stat-label">Years Exp.</div>
                        </div>
                        <div className="stat-pill">
                            <div className="stat-val">${expert.hourlyRate}</div>
                            <div className="stat-label">Per Hour</div>
                        </div>
                    </div>
                    <p className="detail-bio">{expert.bio}</p>
                </div>

                <div className="slots-section">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ margin: 0 }}>Available Slots</h2>
                        <span className="realtime-badge"><span className="dot" /> Live Updates</span>
                    </div>

                    {Object.keys(grouped).sort().map(date => (
                        <div className="date-group" key={date}>
                            <div className="date-label">
                                <Calendar size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                                {formatDate(date)}
                            </div>
                            <div className="slots-grid">
                                {grouped[date].map(slot => (
                                    <button
                                        key={slot._id || slot.time}
                                        className={`slot-btn ${slot.isBooked ? 'booked' : ''} ${selectedSlot?.date === slot.date && selectedSlot?.time === slot.time ? 'selected' : ''}`}
                                        disabled={slot.isBooked}
                                        onClick={() => setSelectedSlot({ date: slot.date, time: slot.time })}
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {selectedSlot && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <button
                                className="btn btn-primary"
                                style={{ padding: '0.8rem 2rem', fontSize: '0.95rem', borderRadius: 12 }}
                                onClick={() => navigate(`/book/${id}`, { state: { expert, slot: selectedSlot } })}
                            >
                                Book {selectedSlot.date} at {selectedSlot.time} →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
