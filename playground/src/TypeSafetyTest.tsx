// Test to verify that our generic component fixes maintain type safety

import { withBoundary } from 'react-suspense-boundary';
import React from 'react';

// This is a generic component that should be fixed by our ESLint rule
function GenericFormEditor<T extends object>(props: {
  value: T;
  onChange: (value: T) => void;
  validator?: (value: T) => boolean;
}) {
  return (
    <div>
      <pre>{JSON.stringify(props.value, null, 2)}</pre>
      <button onClick={() => props.onChange(props.value)}>
        Update
      </button>
    </div>
  );
}

const WrappedGenericFormEditor = withBoundary(GenericFormEditor) as typeof GenericFormEditor;
export { WrappedGenericFormEditor as GenericFormEditor };

// Usage example to test type safety
function App() {
  const [user, setUser] = React.useState({ name: 'John', age: 30 });
  const [product, setProduct] = React.useState({ title: 'Product', price: 100 });

  return (
    <div>
      {/* This should work with proper typing */}
      <GenericFormEditor
        value={user}
        onChange={setUser}
        validator={(u) => u.name.length > 0} // TypeScript should know u is { name: string, age: number }
      />
      
      {/* This should also work with different type */}
      <GenericFormEditor
        value={product}
        onChange={setProduct}
        validator={(p) => p.price > 0} // TypeScript should know p is { title: string, price: number }
      />
    </div>
  );
}

const WrappedApp = withBoundary(App);
export { WrappedApp as App };
