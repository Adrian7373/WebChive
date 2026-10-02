import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/Dashboard';
import ReaderPage from './pages/Reader';

export default function App() {
    return (
        <div className="max-w-4xl mx-auto p-6">

            <Routes>

                <Route path="/" element={<DashboardPage />} />
                <Route path="/read/:id" element={<ReaderPage />} />

            </Routes>

        </div>
    );
}