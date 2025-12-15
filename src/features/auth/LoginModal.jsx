import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { login, clearAuthError } from './authSlice';
import { hideLoginModal, showRegisterModal } from '../ui/uiSlice';
import { Button, Input } from '../../components/common';

const LoginModal = () => {
    const dispatch = useDispatch();
    const isOpen = useSelector((state) => state.ui.modals.loginOpen);
    const { loading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({ username: '', password: '' });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData({ username: '', password:  '' });
            setFormErrors({});
            dispatch(clearAuthError());
        }
    }, [isOpen, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]:  value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]:  '' }));
        }
    };

    const validate = () => {
        const errors = {};
        if (!formData.username. trim()) errors.username = 'Username is required';
        if (!formData.password) errors.password = 'Password is required';
        setFormErrors(errors);
        return Object. keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            await dispatch(login({
                username: formData.username. trim(),
                password: formData.password,
            })).unwrap();
            dispatch(hideLoginModal());
        } catch (err) {
            // Error handled in thunk
        }
    };

    if (! isOpen) return null;

    return (
        <div className="modal modal-open modal-bottom sm:modal-middle">
            <div className="modal-backdrop bg-black/50" onClick={() => dispatch(hideLoginModal())}></div>
            <div className="modal-box relative">
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => dispatch(hideLoginModal())}
                >
                    ✕
                </button>

                <h3 className="font-bold text-2xl mb-1">Welcome Back</h3>
                <p className="text-base-content/70 mb-6">Sign in to your KraxMusicPlayer account</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Username"
                        name="username"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                        error={formErrors.username}
                        autoComplete="username"
                        required
                    />
                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        error={formErrors.password}
                        autoComplete="current-password"
                        required
                    />

                    {error && (
                        <div className="alert alert-error text-sm py-2">
                            <span>{error}</span>
                        </div>
                    )}

                    <Button type="submit" variant="primary" className="w-full" loading={loading}>
                        Sign In
                    </Button>
                </form>

                <div className="divider text-base-content/50 text-sm my-6">Don't have an account? </div>

                <Button variant="outline" className="w-full" onClick={() => dispatch(showRegisterModal())}>
                    Create Account
                </Button>
            </div>
        </div>
    );
};

export default LoginModal;