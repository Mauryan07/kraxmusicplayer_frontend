import React from 'react';

const Loader = ({
                    size = 'md',
                    variant = 'spinner',
                    className = '',
                    fullScreen = false,
                    text = '',
                }) => {
    const sizeClasses = {
        xs:  'loading-xs',
        sm: 'loading-sm',
        md: 'loading-md',
        lg: 'loading-lg',
    };

    const variantClasses = {
        spinner: 'loading-spinner',
        dots: 'loading-dots',
        ring: 'loading-ring',
        ball: 'loading-ball',
        bars: 'loading-bars',
        infinity: 'loading-infinity',
    };

    const loaderElement = (
        <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <span
          className={`loading ${variantClasses[variant]} ${sizeClasses[size]} text-primary`}
      ></span>
            {text && <span className="text-sm text-base-content/70">{text}</span>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-base-100/80 backdrop-blur-sm z-50">
                {loaderElement}
            </div>
        );
    }

    return loaderElement;
};

export default Loader;