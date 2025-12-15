import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { register, clearAuthError } from './authSlice';
import { hideRegisterModal, showLoginModal } from '../ui/uiSlice';
import { Button, Input } from '../../components/common';

const RegisterModal = () => {
    const dispatch = useDispatch();
    const isOpen = useSelector((state) => state.ui.modals.registerOpen);
    const { loading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData({ username: '', password: '', confirmPassword: '' });
            setFormErrors({});
            dispatch(clearAuthError());
        }
    }, [isOpen, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]:  value }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const errors = {};
        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        } else if (formData.username. trim().length < 3) {
            errors. username = 'Username must be at least 3 characters';
        }
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password. length < 6) {
            errors. password = 'Password must be at least 6 characters';
        }
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            await dispatch(register({
                username: formData. username.trim(),
                password: formData.password,
            })).unwrap();
            dispatch(hideRegisterModal());
        } catch (err) {
            // Error handled in thunk

        }
    };

    if (! isOpen) return null;

    return (
        <div className="modal modal-open modal-bottom sm: modal-middle">
            <div className="modal-backdrop bg-black/50" onClick={() => dispatch(hideRegisterModal())}></div>
            <div className="modal-box relative">
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={() => dispatch(hideRegisterModal())}
                >
                    ✕
                </button>

                <h3 className="font-bold text-2xl mb-1">Create Account</h3>
                <p className="text-base-content/70 mb-6">Join KraxMusicPlayer and start listening</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Username"
                        name="username"
                        placeholder="Choose a username"
                        value={formData. username}
                        onChange={handleChange}
                        error={formErrors.username}
                        autoComplete="username"
                        required
                    />
                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        value={formData. password}
                        onChange={handleChange}
                        error={formErrors.password}
                        autoComplete="new-password"
                        required
                    />
                    <Input
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={formErrors.confirmPassword}
                        autoComplete="new-password"
                        required
                    />

                    {error && (
                        <div className="alert alert-error text-sm py-2">
                            <span>{error}</span>
                        </div>
                    )}

                    <p className="text-xs text-base-content/50">
                        Password must be at least 6 characters long
                    </p>

                    <Button type="submit" variant="primary" className="w-full" loading={loading}>
                        Create Account
                    </Button>
                </form>

                <div className="divider text-base-content/50 text-sm my-6">Already have an account?</div>

                <Button variant="outline" className="w-full" onClick={() => dispatch(showLoginModal())}>
                    Sign In
                </Button>
            </div>
        </div>
    );
};

export default RegisterModal;