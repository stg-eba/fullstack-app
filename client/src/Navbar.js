import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './output.css';
import { useAuth } from './AuthContext';


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

            setAuth(null);
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return (
        <nav className="flex items-center justify-between  p-4 shadow">
            <div className="flex gap-6 text-sm">
                <Link to="/" className="bg-gray-600 text-white px-4 py-1 rounded text-sm hover:bg-gray-700">ホームページ</Link>
                <Link to="/users" className="bg-gray-600 text-white px-4 py-1 rounded text-sm hover:bg-gray-700">ユーザーページ</Link>
                <Link to="/tasks" className="bg-gray-600 text-white px-4 py-1 rounded hover:bg-gray-700">タスクモニター</Link>
                <Link to="/todo/list" className="bg-gray-600 text-white px-4 py-1 rounded text-sm hover:bg-gray-700">
                    Todoリスト
                </Link>


            </div>


            <div className="flex items-center gap-4">
                {auth.username && <span className="text-gray-700 text-sm">ようこそ, {auth.username}さん</span>}
                <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-1 rounded text-sm hover:bg-red-700" // text-black -> text-white
                >
                    ログアウト
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
