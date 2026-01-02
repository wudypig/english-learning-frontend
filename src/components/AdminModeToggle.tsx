import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminModeToggle() {
    const { user } = useAuth();
    const { isAdminMode, toggleAdminMode } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();

    if (user?.role !== 'admin') return null;

    const handleToggle = () => {
        toggleAdminMode();
        // Navigate to appropriate page based on mode
        if (!isAdminMode) {
            navigate('/admin/users');
        } else {
            navigate('/');
        }
    };

    return (
        <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${isAdminMode
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
        >
            {isAdminMode ? '👨‍💼 Admin Mode' : '👤 User Mode'}
        </button>
    );
}
