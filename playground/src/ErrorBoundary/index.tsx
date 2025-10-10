/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-boundary/require-with-boundary */
/* eslint-disable new-cap */

import React, {forwardRef} from 'react';
import {
    ErrorBoundary as SuspenseErrorBoundary,
    useBoundaryConfig,
} from 'react-suspense-boundary';

type SuspenseErrorBoundaryProps = React.ComponentProps<typeof SuspenseErrorBoundary>;

type AppErrorBoundaryProps = Omit<SuspenseErrorBoundaryProps, 'renderError'> & {
  renderError?: SuspenseErrorBoundaryProps['renderError'];
};

const DefaultRenderError = () => {
    return null;
};

export const ErrorBoundary: React.FC<AppErrorBoundaryProps> = props => {
    const {renderError = DefaultRenderError, children, ...rest} = props;
    return (
        <SuspenseErrorBoundary renderError={renderError} {...rest}>
            {children}
        </SuspenseErrorBoundary>
    );
};

// 封装类型，外部可选传 renderError 和 pendingFallback
type AppWithBoundaryConfig = Omit<SuspenseErrorBoundaryProps, 'renderError'> & {
    renderError?: SuspenseErrorBoundaryProps['renderError'];
};

export function withBoundary<P extends object>(
    Component: React.ComponentType<P>,
    config?: AppWithBoundaryConfig
) {
    const WithBoundary = forwardRef<any, P>((props, ref) => {
        const {onErrorCaught: onErrorCaught_} = useBoundaryConfig();
        const onErrorCaught = (error: Error, info: any) => {
        };
        return (
            <SuspenseErrorBoundary
                {...config}
                onErrorCaught={onErrorCaught}
                renderError={(error, options) => {
                    return config?.renderError ? config.renderError(error, options) : DefaultRenderError();
                }}
            >
                {/* 安全地传递 ref - 只有当组件接受 ref 时才传递 */}
                {ref ? (
                    <Component {...props} ref={ref} />
                ) : (
                    <Component {...props} />
                )}

            </SuspenseErrorBoundary>
        );
    });

    return WithBoundary;
}
