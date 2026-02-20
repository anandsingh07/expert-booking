import { NavLink } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="container navbar-inner">
                <NavLink to="/" className="nav-logo">
                    <Zap size={22} fill="currentColor" /> ExpertHub
                </NavLink>
                <div className="nav-links">
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                        Experts
                    </NavLink>
                    <NavLink to="/my-bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        My Bookings
                    </NavLink>
                </div>
            </div>
        </nav>
    );
}
