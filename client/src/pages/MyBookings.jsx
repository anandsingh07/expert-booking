import { useState } from 'react';
import { Search, Calendar, Clock, User } from 'lucide-react';
import { getBookingsByEmail } from '../services/api';

const statusClass = { Pending: 'status-Pending', Confirmed: 'status-Confirmed', Completed: 'status-Completed' };

export default function MyBookings() {
    const [email, setEmail] = useState('');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setError('');
        setSearched(true);
        try {
            const res = await getBookingsByEmail(email);
            setBookings(res.data.data);
        } catch {
            setError('Failed to fetch bookings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="my-bookings-header">
                <h1>My Bookings</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Enter your email to view your booking history.</p>
            </div>

            <form className="email-search-form" onSubmit={handleSearch}>
                <input
                    className="email-input"
                    type="email"
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    <Search size={16} /> {loading ? 'Searching...' : 'Find Bookings'}
                </button>
            </form>

            {error && <div className="error-state">⚠️ {error}</div>}

            {loading && (
                <div className="loading-state">
                    <div className="spinner" /><p>Fetching bookings...</p>
                </div>
            )}

            {!loading && searched && bookings.length === 0 && !error && (
                <div className="empty-state">
                    <Calendar size={48} />
                    <p style={{ marginTop: '1rem' }}>No bookings found for this email.</p>
                </div>
            )}

            {!loading && bookings.length > 0 && (
                <>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Found {bookings.length} booking{bookings.length > 1 ? 's' : ''}
                    </p>
                    <div className="booking-list">
                        {bookings.map(b => (
                            <div className="booking-item" key={b._id}>
                                <img
                                    src={b.expertId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${b.expertId?.name}`}
                                    alt={b.expertId?.name}
                                    className="booking-avatar"
                                />
                                <div className="booking-info">
                                    <div className="booking-expert">{b.expertId?.name}</div>
                                    <div className="booking-meta">
                                        <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.1rem 0.6rem', borderRadius: 100, fontSize: '0.73rem', fontWeight: 600 }}>
                                            {b.expertId?.category}
                                        </span>
                                    </div>
                                    <div className="booking-time">
                                        <Calendar size={13} /> {b.date}
                                        <Clock size={13} style={{ marginLeft: 8 }} /> {b.timeSlot}
                                        <User size={13} style={{ marginLeft: 8 }} /> {b.name}
                                    </div>
                                    {b.notes && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                                            "{b.notes}"
                                        </div>
                                    )}
                                </div>
                                <span className={`status-badge ${statusClass[b.status]}`}>{b.status}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
