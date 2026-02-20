import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import ExpertList from './pages/ExpertList';
import ExpertDetail from './pages/ExpertDetail';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<ExpertList />} />
        <Route path="/experts/:id" element={<ExpertDetail />} />
        <Route path="/book/:id" element={<Booking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
      <ToastContainer
        position="top-right"
        theme="dark"
        toastStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      />
    </BrowserRouter>
  );
}
