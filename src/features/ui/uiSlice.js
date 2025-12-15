import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
};

const initialState = {
    toasts: [],
    modals: {
        loginOpen: false,
        registerOpen: false,
        uploadOpen:  false,
    },
    theme:  getInitialTheme(),
};

let toastId = 0;

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        addToast: (state, action) => {
            const { type = 'info', message } = action.payload;
            state.toasts.push({ id: ++toastId, type, message });
        },
        removeToast: (state, action) => {
            state.toasts = state.toasts.filter((t) => t.id !== action.payload);
        },
        clearAllToasts: (state) => {
            state.toasts = [];
        },
        showLoginModal: (state) => {
            state.modals.loginOpen = true;
            state.modals. registerOpen = false;
        },
        hideLoginModal: (state) => {
            state.modals.loginOpen = false;
        },
        showRegisterModal: (state) => {
            state.modals. registerOpen = true;
            state.modals.loginOpen = false;
        },
        hideRegisterModal: (state) => {
            state.modals.registerOpen = false;
        },
        showUploadModal: (state) => {
            state.modals.uploadOpen = true;
        },
        hideUploadModal: (state) => {
            state.modals. uploadOpen = false;
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
            document.documentElement. setAttribute('data-theme', action.payload);
        },
        toggleTheme: (state) => {
            const newTheme = state.theme === 'light' ?  'dark' :  'light';
            state.theme = newTheme;
            localStorage.setItem('theme', newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
        },
    },
});

export const {
    addToast,
    removeToast,
    clearAllToasts,
    showLoginModal,
    hideLoginModal,
    showRegisterModal,
    hideRegisterModal,
    showUploadModal,
    hideUploadModal,
    setTheme,
    toggleTheme,
} = uiSlice.actions;

export default uiSlice.reducer;