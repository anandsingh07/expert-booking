import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, User, Mail, Phone, FileText, ArrowLeft } from 'lucide-react';
import { createBooking, getExpertById } from '../services/api';

function validate(form) {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email';
    if (!form.phone.trim()) errors.phone = 'Phone is required';
    else if (!/^[\d\s\+\-\(\)]{7,15}$/.test(form.phone)) errors.phone = 'Invalid phone number';
    return errors;
}

export default function Booking() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const stateSlot = location.state?.slot;
    const stateExpert = location.state?.expert;

    const [expert, setExpert] = useState(stateExpert || null);
    const [slot] = useState(stateSlot || null);
    const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [serverError, setServerError] = useState('');

    useEffect(() => {
        if (!expert) {
            getExpertById(id).then(r => setExpert(r.data.data)).catch(() => { });
        }
    }, [id, expert]);

    if (!slot) {
        return (
            <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No slot selected.</p>
                <button className="btn btn-primary" onClick={() => navigate(`/experts/${id}`)}>
                    Go back to Expert
                </button>
            </div>
        );
    }

    const handleChange = e => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const v = validate(form);
        if (Object.keys(v).length > 0) { setErrors(v); return; }

        setLoading(true);
        setServerError('');
        try {
            await createBooking({
                expertId: id,
                name: form.name,
                email: form.email,
                phone: form.phone,
                date: slot.date,
                timeSlot: slot.time,
                notes: form.notes,
            });
            setSuccess(true);
        } catch (err) {
            setServerError(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container" style={{ paddingTop: '3rem' }}>
                <div className="booking-card">
                    <div className="success-card">
                        <div className="success-icon">
                            <CheckCircle size={40} color="var(--success)" />
                        </div>
                        <h2>Booking Confirmed! 🎉</h2>
                        <p>
                            Your session with <strong>{expert?.name}</strong> has been booked for{' '}
                            <strong>{slot.date} at {slot.time}</strong>.<br />
                            A confirmation will be sent to <strong>{form.email}</strong>.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>
                                View My Bookings
                            </button>
                            <button className="btn btn-outline" onClick={() => navigate('/')}>
                                Browse More Experts
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> Back
            </button>

            <div className="booking-card">
                <h2>Complete Your Booking</h2>
                <p className="booking-subtitle">
                    Session with {expert?.name} • {slot.date} at {slot.time}
                </p>

                <div className="selected-slot-info">
                    <Calendar size={20} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{slot.date} at {slot.time}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1-hour session • ${expert?.hourlyRate}/hr</div>
                    </div>
                </div>

                {serverError && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '0.9rem 1.2rem', marginBottom: '1rem', color: 'var(--error)', fontSize: '0.9rem' }}>
                        ⚠️ {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label" htmlFor="name"><User size={13} style={{ display: 'inline', marginRight: 4 }} /> Full Name</label>
                            <input id="name" name="name" className={`form-input ${errors.name ? 'error' : ''}`} placeholder="John Doe" value={form.name} onChange={handleChange} />
                            {errors.name && <span className="form-error">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="phone"><Phone size={13} style={{ display: 'inline', marginRight: 4 }} /> Phone Number</label>
                            <input id="phone" name="phone" className={`form-input ${errors.phone ? 'error' : ''}`} placeholder="+91 9876543210" value={form.phone} onChange={handleChange} />
                            {errors.phone && <span className="form-error">{errors.phone}</span>}
                        </div>
                        <div className="form-group full">
                            <label className="form-label" htmlFor="email"><Mail size={13} style={{ display: 'inline', marginRight: 4 }} /> Email Address</label>
                            <input id="email" name="email" type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="john@example.com" value={form.email} onChange={handleChange} />
                            {errors.email && <span className="form-error">{errors.email}</span>}
                        </div>
                        <div className="form-group full">
                            <label className="form-label" htmlFor="notes"><FileText size={13} style={{ display: 'inline', marginRight: 4 }} /> Notes (Optional)</label>
                            <textarea id="notes" name="notes" className="form-input" rows={3} placeholder="Topics you'd like to discuss..." value={form.notes} onChange={handleChange} style={{ resize: 'vertical' }} />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Booking...' : 'Confirm Booking →'}
                    </button>
                </form>
            </div>
        </div>
    );
}
