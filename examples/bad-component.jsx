// ❌ This will trigger the ESLint rule
import React from 'react';

// Missing Boundary wrapper - will trigger error
export function BadComponent() {
    return (
        <div>
            <h1>This component is not wrapped with Boundary</h1>
            <p>ESLint will report an error for this component</p>
        </div>
    );
}

// Another bad example - default export without Boundary
export default function App() {
    return (
        <div>
            <BadComponent />
            <p>This app component also needs Boundary wrapper</p>
        </div>
    );
}

// Arrow function component without Boundary
export const Header = () => {
    return (
        <header>
            <h1>Header without Boundary</h1>
        </header>
    );
};

// Conditional component without Boundary
export const ConditionalComponent = ({isVisible}) => {
    return isVisible ? (
        <div>Visible content</div>
    ) : (
        <div>Hidden content</div>
    );
};
