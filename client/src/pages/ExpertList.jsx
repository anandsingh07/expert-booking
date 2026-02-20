import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Briefcase, Clock, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { getExperts } from '../services/api';

const CATEGORIES = ['All', 'Technology', 'Finance', 'Design', 'Healthcare', 'Marketing'];

export default function ExpertList() {
    const navigate = useNavigate();
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => { setPage(1); }, [category]);

    const fetchExperts = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getExperts({ search: debouncedSearch, category, page, limit: 6 });
            setExperts(res.data.data);
            setPagination(res.data.pagination);
        } catch {
            setError('Failed to load experts. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, category, page]);

    useEffect(() => { fetchExperts(); }, [fetchExperts]);

    return (
        <div>
            <div className="hero">
                <div className="container">
                    <h1>Connect with the<br /><span>World's Best Experts</span></h1>
                    <p>Book 1-on-1 sessions with top professionals across technology, finance, design, and more.</p>
                </div>
            </div>

            <div className="container" style={{ paddingBottom: '3rem' }}>
                <div className="search-filter">
                    <div className="search-wrap">
                        <Search size={18} />
                        <input
                            className="search-input"
                            placeholder="Search experts by name..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Filter size={18} style={{ color: 'var(--text-muted)', alignSelf: 'center' }} />
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`btn ${category === cat ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading && (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Loading experts...</p>
                    </div>
                )}

                {error && <div className="error-state">⚠️ {error}</div>}

                {!loading && !error && experts.length === 0 && (
                    <div className="empty-state">
                        <Search size={48} />
                        <p>No experts found. Try a different search.</p>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <div className="experts-grid">
                            {experts.map(expert => (
                                <div className="expert-card" key={expert._id} onClick={() => navigate(`/experts/${expert._id}`)}>
                                    <div className="card-header">
                                        <img
                                            src={expert.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${expert.name}`}
                                            alt={expert.name}
                                            className="avatar"
                                        />
                                        <div>
                                            <div className="card-name">{expert.name}</div>
                                            <span className="card-category">{expert.category}</span>
                                        </div>
                                    </div>
                                    <div className="card-meta">
                                        <span><Star size={13} className="star" /> {expert.rating.toFixed(1)}</span>
                                        <span><Briefcase size={13} /> {expert.experience} yrs</span>
                                    </div>
                                    <p className="card-bio">{expert.bio}</p>
                                    <div className="card-rate">
                                        <span className="rate-val">${expert.hourlyRate}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/hr</span></span>
                                        <button className="btn btn-primary btn-sm">
                                            <Clock size={13} /> Book Session
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {pagination.pages > 1 && (
                            <div className="pagination">
                                <button
                                    className="page-btn"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        className={`page-btn ${page === p ? 'active' : ''}`}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    className="page-btn"
                                    disabled={page === pagination.pages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
