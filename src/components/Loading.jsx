import React from "react";

/**
 * A simple animated bar loading spinner component using SVG and inline CSS animation.
 * The color of the spinner is controlled by the 'currentColor' property,
 * which can be set via the 'className' prop (e.g., 'text-blue-500').
 * * @param {number} size - The width and height of the spinner in pixels (default is 24).
 * @param {string} className - Tailwind CSS classes for color and other styling.
 */
const LoadingSpinner = ({ size = 100, className = "text-white", ...props }) => {
  return (
    <svg
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      className={className} // Apply external classes for color/styling
      {...props}
    >
      <title>Loading...</title>
      {/* Inline CSS for the animation. This is kept inside the SVG 
        for a self-contained component.
      */}
      <style>{`
        .spinner-bar {
          animation: spinner-bars-animation .8s linear infinite;
          animation-delay: -.8s;
          transform-origin: center;
        }
        .spinner-bars-2 {
          animation-delay: -.65s;
        }
        .spinner-bars-3 {
          animation-delay: -0.5s;
        }
        @keyframes spinner-bars-animation {
          0% {
            y: 1px;
            height: 22px;
            opacity: 1;
          }
          93.75% {
            y: 5px;
            height: 14px;
            opacity: 0.4;
          }
          100% {
            y: 1px;
            height: 22px;
            opacity: 1;
          }
        }
      `}</style>

      {/* Bar 1 */}
      <rect
        className="spinner-bar"
        fill="currentColor"
        height="22"
        width="6"
        x="1"
        y="1"
        rx="1" // Added rounded corners for modern look
      />

      {/* Bar 2 */}
      <rect
        className="spinner-bar spinner-bars-2"
        fill="currentColor"
        height="22"
        width="6"
        x="9"
        y="1"
        rx="1"
      />

      {/* Bar 3 */}
      <rect
        className="spinner-bar spinner-bars-3"
        fill="currentColor"
        height="22"
        width="6"
        x="17"
        y="1"
        rx="1"
      />
    </svg>
  );
};

export default LoadingSpinner;
