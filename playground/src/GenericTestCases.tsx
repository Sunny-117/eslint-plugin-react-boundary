// Test cases for generic components

import { withBoundary } from "./ErrorBoundary";

// Case 1: Single generic parameter - named export
function SingleGeneric<T>(props: { value: T }) {
  return <div>{JSON.stringify(props.value)}</div>;
}

const WrappedSingleGeneric = withBoundary(SingleGeneric) as typeof SingleGeneric;
export { WrappedSingleGeneric as SingleGeneric };

// Case 2: Multiple generic parameters
function MultiGeneric<T, U extends string>(props: { value: T; label: U }) {
  return <div>{props.label}: {JSON.stringify(props.value)}</div>;
}

const WrappedMultiGeneric = withBoundary(MultiGeneric) as typeof MultiGeneric;
export { WrappedMultiGeneric as MultiGeneric };

// Case 3: Generic with constraints - separate definition and export
function ConstrainedGeneric<T extends object>(props: { data: T }) {
  return <div>{JSON.stringify(props.data)}</div>;
}

const WrappedConstrainedGeneric = withBoundary(ConstrainedGeneric) as typeof ConstrainedGeneric;
export { WrappedConstrainedGeneric as ConstrainedGeneric };

// Case 4: Generic with default type
function GenericWithDefault<T = string>(props: { value: T }) {
  return <div>{JSON.stringify(props.value)}</div>;
}

const WrappedGenericWithDefault = withBoundary(GenericWithDefault) as typeof GenericWithDefault;
export { WrappedGenericWithDefault as GenericWithDefault };

// Case 5: Complex generic
function ComplexGeneric<T extends Record<string, any>, K extends keyof T>(
  props: { data: T; key: K }
) {
  return <div>{JSON.stringify(props.data[props.key])}</div>;
}

const WrappedComplexGeneric = withBoundary(ComplexGeneric) as typeof ComplexGeneric;
export { WrappedComplexGeneric as ComplexGeneric };

// Case 6: Non-generic component (should not have type assertion)
function RegularComponent(props: { message: string }) {
  return <div>{props.message}</div>;
}

const WrappedRegularComponent = withBoundary(RegularComponent);
export { WrappedRegularComponent as RegularComponent };

// Case 7: Generic arrow function component
const GenericArrow = <T,>(props: { value: T }) => {
  return <div>{JSON.stringify(props.value)}</div>;
};

const WrappedGenericArrow = withBoundary(GenericArrow) as typeof GenericArrow;
export { WrappedGenericArrow as GenericArrow };

// Case 8: Default export of generic function
function DefaultGeneric<T extends object>(props: { value: T }) {
  return <div>{JSON.stringify(props.value)}</div>;
}

export default withBoundary(DefaultGeneric) as typeof DefaultGeneric;
