import { withBoundary } from './ErrorBoundary';
function ConstrainedGeneric<T extends object>(props: { value: T }) {
  return <div>{JSON.stringify(props.value)}</div>;
}

const WrappedConstrainedGeneric = withBoundary(ConstrainedGeneric) as typeof ConstrainedGeneric;
export { WrappedConstrainedGeneric as ConstrainedGeneric };