import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { useForkRef, useStateCallback } from '@parrotjs/react-hooks';
import { ITransitionProps } from '.';

export const UNMOUNTED = "unmounted";
export const EXITED = "exited";
export const ENTERING = "entering";
export const ENTERED = "entered";
export const EXITING = "exiting";

function noop() { }

const Transition = React.forwardRef((props: ITransitionProps, ref) => {

    const {
        visible: visibleProp = false,
        children,
        appear = false,
        disappear = false,
        unmountOnExit = false,
        mountOnEnter = false,
        timeout,
        onEnter = noop,
        onEntering = noop,
        onEntered = noop,
        onExit = noop,
        onExiting = noop,
        onExited = noop,
        ...childProps
    } = props;

    const nodeRef = useRef(null);

    const initialStatus = useMemo(() => {
        let initialStatus;
        if (visibleProp) {
            if (appear) {
                initialStatus = EXITED;
            } else {
                initialStatus = ENTERED;
            }
        } else {
            if (disappear) {
                initialStatus = ENTERED
            } else {
                if (unmountOnExit || mountOnEnter) {
                    initialStatus = UNMOUNTED
                } else {
                    initialStatus = EXITED
                }
            }

        }
        return initialStatus
    }, []);

    const getTimeout = useCallback(() => {
        let enter, exit;
        if (typeof timeout === "number") {
            enter = exit = timeout
        } else if (typeof timeout === "object") {
            enter = timeout && timeout.enter ? timeout.enter : 300;
            exit = timeout && timeout.exit ? timeout.exit : 500;
        }
        return {
            enter,
            exit
        }
    }, [timeout])

    const [status, setStatus] = useStateCallback(initialStatus);

    useEffect(() => {
        //当visible由false变为true时 
        if (visibleProp && (status === EXITED)) {

            onEnter?.(nodeRef.current);

            setStatus(ENTERING, () => {
                onEntering?.(nodeRef.current);

                setTimeout(() => {
                    setStatus(ENTERED);
                    onEntered?.(nodeRef.current);
                }, getTimeout().enter);
            });


            //当visible由true变为false时
        } else if (!visibleProp && status === ENTERED) {
            onExit?.(nodeRef.current);

            setStatus(EXITING, () => {
                onExiting?.(nodeRef.current);

                setTimeout(() => {
                    setStatus(EXITED);
                    onExited?.(nodeRef.current);
                }, getTimeout().exit);
            });
        } else if (visibleProp && status === UNMOUNTED) {
            setStatus(EXITED);
        } else if (!visibleProp && status === EXITED && unmountOnExit) {
            setStatus(UNMOUNTED);
        }
    }, [visibleProp, status, getTimeout]);

    const handleRef = useForkRef(nodeRef, ref);

    const { TransitionComponent } = useMemo(() => {
        if (status === UNMOUNTED) {
            return {
                TransitionComponent: null
            };
        }
        let Component;
        if (typeof children === "function") {
            Component = children(status, childProps);
        } else {
            Component = React.cloneElement(React.Children.only(children), childProps);
        }
        return {
            TransitionComponent: Component
        }
    }, [status, childProps, children, handleRef]);

    if (status === UNMOUNTED) {
        return null;
    }

    return React.cloneElement(TransitionComponent, { ref: handleRef });
});

export default Transition;