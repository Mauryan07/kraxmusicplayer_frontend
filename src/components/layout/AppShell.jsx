import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TopNav from './TopNav';
import BottomPlayer from './BottomPlayer';
import { ToastList } from '../common';
import { LoginModal, RegisterModal } from '../../features/auth';
import { selectCurrentTrack } from '../../features/player/playerSlice';

const AppShell = () => {
    const currentTrack = useSelector(selectCurrentTrack);
    const hasPlayer = !!currentTrack;

    return (
        <div className="min-h-screen bg-base-100">
            {/* Top Navigation */}
            <TopNav />

            {/* Main Content - Add bottom padding when player is visible */}
            <main className={`container mx-auto px-4 py-6 ${hasPlayer ? 'pb-28 sm:pb-24' : ''}`}>
                <Outlet />
            </main>

            {/* Bottom Player */}
            <BottomPlayer />

            {/* Global Toast Notifications */}
            <ToastList />

            {/* Auth Modals */}
            <LoginModal />
            <RegisterModal />
        </div>
    );
};

export default AppShell;