import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <div className="min-h-screen bg-f1-bg">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard/:sessionKey" element={<DashboardPage />} />
      </Routes>
    </div>
  );
}
