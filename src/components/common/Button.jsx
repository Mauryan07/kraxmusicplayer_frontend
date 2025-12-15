import React from 'react';

const Button = ({
                    children,
                    variant = 'primary',
                    size = 'md',
                    loading = false,
                    disabled = false,
                    type = 'button',
                    className = '',
                    onClick,
                    ...props
                }) => {
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        accent: 'btn-accent',
        ghost: 'btn-ghost',
        link: 'btn-link',
        error: 'btn-error',
        success: 'btn-success',
        warning: 'btn-warning',
        info: 'btn-info',
        outline: 'btn-outline btn-primary',
    };

    const sizeClasses = {
        xs: 'btn-xs',
        sm:  'btn-sm',
        md:  '',
        lg: 'btn-lg',
    };

    const classes = [
        'btn',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading && <span className="loading loading-spinner loading-sm mr-2"></span>}
            {children}
        </button>
    );
};

export default Button;