// ✅ This follows the ESLint rule correctly
import React from 'react';
import {Boundary} from 'react-suspense-boundary';

// Properly wrapped with Boundary
export function GoodComponent() {
    return (
        <Boundary>
            <div>
                <h1>This component is properly wrapped with Boundary</h1>
                <p>No ESLint errors here!</p>
            </div>
        </Boundary>
    );
}

// Default export properly wrapped
export default function App() {
    return (
        <Boundary>
            <div>
                <GoodComponent />
                <p>This app component is properly wrapped</p>
            </div>
        </Boundary>
    );
}

// Arrow function component properly wrapped
export const Header = () => {
    return (
        <Boundary>
            <header>
                <h1>Header with Boundary</h1>
            </header>
        </Boundary>
    );
};

// Conditional component properly wrapped
export const ConditionalComponent = ({isVisible}) => {
    return (
        <Boundary>
            {isVisible ? (
                <div>Visible content</div>
            ) : (
                <div>Hidden content</div>
            )}
        </Boundary>
    );
};

// Complex component with multiple JSX elements
export const ComplexComponent = ({data}) => {
    return (
        <Boundary>
            <div className="complex-component">
                <header>
                    <h1>{data.title}</h1>
                </header>
                <main>
                    {data.items.map(item => (
                        <div key={item.id}>
                            <h2>{item.name}</h2>
                            <p>{item.description}</p>
                        </div>
                    ))}
                </main>
                <footer>
                    <p>Footer content</p>
                </footer>
            </div>
        </Boundary>
    );
};
