export function ConstrainedGeneric<T extends object>(props: { value: T }) {
  return <div>{JSON.stringify(props.value)}</div>;
}