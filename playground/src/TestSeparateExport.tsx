import { Boundary } from 'react-suspense-boundary';

// Test case 1: Function defined first, then default export (with Boundary)
function GoodComponent() {
  return (
    <Boundary>
      <div>This should pass</div>
    </Boundary>
  );
}

export default GoodComponent;

// Test case 2: Function defined first, then named export (without Boundary) - should trigger error
// function BadComponent() {
//   return <div>This should trigger an error</div>;
// }

// export { BadComponent };

// Test case 3: Arrow function defined first, then named export (without Boundary) - should trigger error
// const AnotherBadComponent = () => {
//   return <span>This should also trigger an error</span>;
// }

// export { AnotherBadComponent };
