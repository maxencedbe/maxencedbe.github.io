import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function MagneticButton({ children, className = "", ...props }) {
    const magnetic = useRef(null);

    useEffect(() => {
        const element = magnetic.current;
        if (!element) return; // Guard clause

        // Constants for the effect strength
        const strength = 0.5; // How much the button moves towards the mouse (0.5 = 50% of distance)
        const textStrength = 0.2; // Optional: inner text could move less/more, but sticking to button for now.

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const { left, top, width, height } = element.getBoundingClientRect();

            // Calculate distance from center of the button
            const x = clientX - (left + width / 2);
            const y = clientY - (top + height / 2);

            // Animation: Move the button towards the mouse
            gsap.to(element, {
                x: x * strength,
                y: y * strength,
                duration: 1,
                ease: "power4.out", // Smooth movement towards mouse
            });
        };

        const handleMouseLeave = () => {
            // Animation: Spring back to center
            gsap.to(element, {
                x: 0,
                y: 0,
                duration: 1.5,
                ease: "elastic.out(1, 0.3)", // Bouncy return
            });
        };

        element.addEventListener("mousemove", handleMouseMove);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            element.removeEventListener("mousemove", handleMouseMove);
            element.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    // We wrap children in a span or div that will be magnetized, 
    // ensuring the props (like className, href for <a>) are passed correctly if this is just a wrapper,
    // OR if this component IS the button.
    // Given current usage in index.astro (<a> tags), it's cleaner if MagneticButton wraps the <a> or IS the <a>.
    // Let's make it a Wrapper. The User code in index.astro iterates over buttons. 
    // It's easier if I use React.cloneElement or just render a div that handles the magnetic effect, 
    // but that might break layout if dot not careful.

    // Better approach: This component renders a <div> (or the element itself) that has the ref.
    // If the user passes children that are <a>, the magnetic effect applies to the wrapper.

    return (
        <div ref={magnetic} className={`magnetic-wrap inline-block ${className}`} {...props}>
            {children}
        </div>
    );
}
