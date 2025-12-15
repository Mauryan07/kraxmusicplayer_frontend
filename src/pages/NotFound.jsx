import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common';

const NotFound = () => {
    return (
        <div className="hero min-h-[60vh]">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-9xl font-bold text-primary">404</h1>
                    <h2 className="text-3xl font-bold mt-4">Page Not Found</h2>
                    <p className="py-6 text-base-content/70">
                        Oops! The page you're looking for doesn't exist or has been moved.
                    </p>
                    <Link to="/">
                        <Button variant="primary">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            Go Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;