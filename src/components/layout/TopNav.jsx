import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectIsAuthenticated, selectCurrentUser, selectIsAdmin } from '../../features/auth/authSlice';
import { showLoginModal, addToast } from '../../features/ui/uiSlice';
import ThemeToggle from './ThemeToggle';

const TopNav = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const username = useSelector(selectCurrentUser);
    const isAdmin = useSelector(selectIsAdmin);

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/tracks', label: 'Tracks' },
        { to: '/albums', label: 'Albums' },
        { to: '/search', label: 'Search' },
    ];

    const isActiveLink = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname. startsWith(path);
    };

    const handleLogout = () => {
        dispatch(logout());
        dispatch(addToast({ type: 'info', message: 'You have been logged out' }));
    };

    return (
        <div className="navbar bg-base-100 sticky top-0 z-40 border-b border-base-200">
            <div className="navbar-start">
                {/* Mobile menu */}
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        {navLinks.map((link) => (
                            <li key={link.to}>
                                <Link to={link.to} className={isActiveLink(link. to) ? 'active' : ''}>
                                    {link. label}
                                </Link>
                            </li>
                        ))}
                        {isAdmin && (
                            <li>
                                <Link to="/admin" className={isActiveLink('/admin') ? 'active' : ''}>
                                    Admin
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
                {/* Logo */}
                <Link to="/" className="btn btn-ghost text-xl">
                    KraxMusic
                </Link>
            </div>

            {/* Desktop menu */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 gap-1">
                    {navLinks.map((link) => (
                        <li key={link.to}>
                            <Link
                                to={link. to}
                                className={isActiveLink(link.to) ? 'active' :  ''}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    {isAdmin && (
                        <li>
                            <Link to="/admin" className={isActiveLink('/admin') ? 'active' : ''}>
                                Admin
                            </Link>
                        </li>
                    )}
                </ul>
            </div>

            <div className="navbar-end gap-2">
                <ThemeToggle />

                {isAuthenticated ?  (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost gap-2">
                            <div className="avatar placeholder">
                                <div className="bg-primary text-primary-content rounded-full w-8">
                                    <span className="text-xl uppercase">{username?. charAt(0) || 'U'}</span>
                                </div>
                            </div>
                            <span className="hidden sm:inline max-w-24 truncate">{username}</span>
                        </div>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                            <li className="menu-title">
                                <span>Signed in as {username}</span>
                            </li>
                            <li>
                                <button onClick={handleLogout} className="text-error">
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => dispatch(showLoginModal())}>
                        Login
                    </button>
                )}
            </div>
        </div>
    );
};

export default TopNav;