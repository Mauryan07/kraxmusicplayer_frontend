import React from 'react';

const StatsCard = ({ title, value, icon, description, loading = false, color = 'primary' }) => {
    const colorClasses = {
        primary:  'bg-primary/10 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        accent: 'bg-accent/10 text-accent',
        info: 'bg-info/10 text-info',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        error: 'bg-error/10 text-error',
    };

    return (
        <div className="stat bg-base-200 rounded-xl">
            <div className={`stat-figure ${colorClasses[color]} p-3 rounded-full`}>
                <span className="text-2xl">{icon}</span>
            </div>
            <div className="stat-title text-base-content/60">{title}</div>
            <div className={`stat-value ${loading ? 'animate-pulse' : ''}`}>
                {loading ? (
                    <div className="h-8 w-20 bg-base-300 rounded"></div>
                ) : (
                    <span className="tabular-nums">{value?. toLocaleString() || 0}</span>
                )}
            </div>
            {description && <div className="stat-desc">{description}</div>}
        </div>
    );
};

export default StatsCard;