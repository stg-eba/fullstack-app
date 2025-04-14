import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './output.css';
import { useAuth } from './AuthContext';

const role = 'USER';

const Navbar = () => {
    const navigate = useNavigate();
    const { setAuth } = useAuth();
    const { auth } = useAuth();

    if (!auth) return null;
    const handleLogout = async () => {
        try {
            await fetch('http://localhost:3000/logout', {
                method: 'POST',
                credentials: 'include',
            });

            setAuth(null); // Clear auth state
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <nav className="flex items-center justify-between  p-4 shadow">
            <div className="flex gap-6 text-sm">
                <Link to="/common" className="bg-gray-600 text-white px-4 py-1 rounded text-sm hover:bg-gray-700">Home page</Link>
                {role === 'USER' && (
                    <Link to="/users" className="bg-gray-600 text-white px-4 py-1 rounded text-sm hover:bg-gray-700">User Page</Link>
                )}
                <div className="flex items-center gap-2">
                    <Link to="/user/list" className="bg-gray-600 text-white px-4 py-1 rounded text-sm hover:bg-gray-700">
                        Task list
                    </Link>

                </div>
            </div>


            <button
                onClick={handleLogout}
                className="bg-red-600 text-black px-4 py-1 rounded text-sm hover:bg-red-500"
            >
                Logout
            </button>
        </nav>
    );
};

export default Navbar;
