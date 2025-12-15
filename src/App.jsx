import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, selectAuthInitialized } from './features/auth/authSlice';
import { setTheme } from './features/ui/uiSlice';
import { setUnauthorizedHandler } from './api/httpClient';
import { logout } from './features/auth/authSlice';
import { showLoginModal, addToast } from './features/ui/uiSlice';
import { AppShell } from './components/layout';
import { Loader } from './components/common';
import {
    Home,
    Tracks,
    Albums,
    AlbumDetail,
    Search,
    Admin,
    NotFound,
} from './pages';

const App = () => {
    const dispatch = useDispatch();
    const authInitialized = useSelector(selectAuthInitialized);

    useEffect(() => {
        // Initialize theme from localStorage
        const savedTheme = localStorage. getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        dispatch(setTheme(savedTheme));

        // Check for existing session
        const token = localStorage.getItem('basicToken');
        if (token) {
            dispatch(fetchMe());
        } else {
            // Mark as initialized even without token
            dispatch({ type: 'auth/fetchMe/rejected' });
        }

        // Set up 401 handler for httpClient
        setUnauthorizedHandler(() => {
            dispatch(logout());
            dispatch(addToast({
                type: 'error',
                message:  'Session expired — please login again',
            }));
            dispatch(showLoginModal());
        });
    }, [dispatch]);

    // Show loader while checking auth status
    if (! authInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-100">
                <Loader size="lg" text="Loading..." />
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<AppShell />}>
                <Route index element={<Home />} />
                <Route path="tracks" element={<Tracks />} />
                <Route path="albums" element={<Albums />} />
                <Route path="albums/:id" element={<AlbumDetail />} />
                <Route path="search" element={<Search />} />
                <Route path="admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
};

export default App;