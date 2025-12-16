import React, { useRef, useEffect, useState } from "react";
import "../../styles/Marquee.css";

const MarqueeTrackTitle = ({ title = "" }) => {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const [shouldMarquee, setShouldMarquee] = useState(false);

    useEffect(() => {
        const check = () => {
            if (containerRef.current && contentRef.current) {
                setShouldMarquee(contentRef.current.scrollWidth > containerRef.current.offsetWidth);
            } else {
                setShouldMarquee(false);
            }
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, [title]);

    return (
        <div
            ref={containerRef}
            className="marquee-container mx-auto w-full max-w-[90vw] relative"
            style={{ minHeight: '2.5rem' }}
        >
            {/* Left & right fade-overlays for a smooth look */}
            <div className="marquee-fade-left" />
            <div className="marquee-fade-right" />
            <div
                className={
                    shouldMarquee ? "marquee marquee-animate font-semibold text-xl" : "font-semibold text-xl whitespace-nowrap truncate"
                }
                aria-label={title}
                ref={contentRef}
                style={{ minWidth: shouldMarquee ? "200%" : "auto" }}
            >
                {shouldMarquee ? (
                    <>
                        <span>{title}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        <span>{title}</span>
                    </>
                ) : (
                    <span>{title}</span>
                )}
            </div>
        </div>
    );
};

export default MarqueeTrackTitle;