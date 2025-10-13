type WithDrawerInputProps<T extends Record<string, any>> = {
    formConfig: number;
    transForm?: (value: T, props: WithDrawerInputProps<T>) => string;
};

export default function WithDrawerInput<T extends Record<string, any>>(props: WithDrawerInputProps<T>) {
  return <div>1</div>;
}