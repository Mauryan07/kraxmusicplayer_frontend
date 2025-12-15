import React from 'react';

const Input = ({
                   label,
                   type = 'text',
                   placeholder = '',
                   value,
                   onChange,
                   error = '',
                   disabled = false,
                   required = false,
                   className = '',
                   id,
                   name,
                   autoComplete,
                   ...props
               }) => {
    const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="form-control w-full">
            {label && (
                <label className="label" htmlFor={inputId}>
          <span className="label-text">
            {label}
              {required && <span className="text-error ml-1">*</span>}
          </span>
                </label>
            )}
            <input
                id={inputId}
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                autoComplete={autoComplete}
                className={`input input-bordered w-full ${error ? 'input-error' : ''} ${className}`}
                {...props}
            />
            {error && (
                <label className="label">
                    <span className="label-text-alt text-error">{error}</span>
                </label>
            )}
        </div>
    );
};

export default Input;