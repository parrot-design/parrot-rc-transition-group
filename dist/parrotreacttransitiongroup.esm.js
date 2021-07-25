import React, { Children, isValidElement, cloneElement, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useStateCallback, useForkRef } from '@parrotjs/react-hooks';

/**
 * @return 返回一个对象映射键到child
 * @param children 传入的children
 * @param mapFn 遍历方法
 */
function getChildMapping(children, mapFn) {
    let mapper = (child) => mapFn && isValidElement(child) ? mapFn(child) : child;
    let result = Object.create(null);
    if (children) {
        /** map会给每个没有key的组件加上默认的key */
        Children.map(children, c => c).forEach((child) => {
            result[child.key] = mapper(child);
        });
    }
    return result;
}
/**
 *
 * @param child 孩子节点
 * @param prop 属性
 * @param props 组件属性
 * @returns 先取group属性再取子组件属性
 */
function getProp(child, prop, props) {
    return props[prop] != null ? props[prop] : child.props[prop];
}
/**
 *
 * @param props group组件属性
 * @param onExited 将孩子节点传入
 * @returns 返回对应的键值对
 */
function getInitialChildMapping(props, onExited) {
    return getChildMapping(props.children, (child) => {
        return cloneElement(child, {
            onExited: onExited.bind(null, child),
            visible: true,
            appear: getProp(child, 'appear', props),
            enter: getProp(child, 'enter', props),
            exit: getProp(child, 'exit', props)
        });
    });
}
function mergeChildMappings(prev = {}, next = {}) {
    function getValueForKey(key) {
        return key in next ? next[key] : prev[key];
    }
    //存储还剩余的键
    let nextKeysPending = Object.create(null);
    //存储
    let pendingKeys = [];
    for (let prevKey in prev) {
        if (prevKey in next) {
            if (pendingKeys.length) {
                nextKeysPending[prevKey] = pendingKeys;
                pendingKeys = [];
            }
        }
        else {
            pendingKeys.push(prevKey);
        }
    }
    let i;
    let childMapping = {};
    for (let nextKey in next) {
        if (nextKeysPending[nextKey]) {
            for (i = 0; i < nextKeysPending[nextKey].length; i++) {
                let previngNextKey = nextKeysPending[nextKey][i];
                childMapping[nextKeysPending[nextKey][i]] = getValueForKey(previngNextKey);
            }
        }
        childMapping[nextKey] = getValueForKey(nextKey);
    }
    for (i = 0; i < pendingKeys.length; i++) {
        childMapping[pendingKeys[i]] = getValueForKey(pendingKeys[i]);
    }
    return childMapping;
}
function getNextChildMapping(nextProps, prevChildMapping, onExited) {
    let nextChildMapping = getChildMapping(nextProps.children);
    let children = mergeChildMappings(prevChildMapping, nextChildMapping);
    Object.keys(children).forEach(key => {
        let child = children[key];
        if (!isValidElement(child))
            return;
        //是之前的
        const hasPrev = key in prevChildMapping;
        //是新加的
        const hasNext = key in nextChildMapping;
        const prevChild = prevChildMapping[key];
        const isLeaving = isValidElement(prevChild) && !prevChild.props.visible;
        //新添加的（entering）
        if (hasNext && (!hasPrev || isLeaving)) {
            children[key] = cloneElement(child, {
                onExited: onExited.bind(null, child),
                visible: true,
                exit: getProp(child, 'exit', nextProps),
                enter: getProp(child, 'enter', nextProps)
            });
        }
        else if (!hasNext && hasPrev && !isLeaving) {
            //离开的（exiting）
            children[key] = cloneElement(child, { visible: false });
        }
        else if (hasNext && hasPrev && isValidElement(prevChild)) {
            //没有变化的
            children[key] = cloneElement(child, {
                onExited: onExited.bind(null, child),
                visible: prevChild.props.visible,
                exit: getProp(child, 'exit', nextProps),
                enter: getProp(child, 'enter', nextProps)
            });
        }
    });
    return children;
}

const TransitionGroup = React.forwardRef((props, ref) => {
    const { component: Component = 'div' } = props;
    //是否挂载完毕
    const mounted = useRef(false);
    //是否是第一次渲染
    const firstRender = useRef(true);
    const [childrenMapping, setChildrenMapping] = useState({});
    const childProp = useRef(null);
    const handleExited = useCallback((child, node) => {
        let currentChildMapping = getChildMapping(childProp.current);
        //如果还在即返回
        if (child.key in currentChildMapping)
            return;
        if (child.props.onExited) {
            child.props.onExited(node);
        }
        if (mounted.current) {
            setChildrenMapping((prevChildrenMapping) => {
                let children = Object.assign({}, prevChildrenMapping);
                delete children[child.key];
                return children;
            });
        }
    }, [childProp.current, mounted.current]);
    useEffect(() => {
        //实时更新props:children的值
        childProp.current = props.children;
    }, [props]);
    useEffect(() => {
        if (firstRender.current) {
            setChildrenMapping(getInitialChildMapping(props, handleExited));
            firstRender.current = false;
        }
        else {
            setChildrenMapping(prevChildrenMapping => {
                return getNextChildMapping(props, prevChildrenMapping, handleExited);
            });
        }
    }, [props]);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    const children = useMemo(() => {
        return Object.values(childrenMapping);
    }, [childrenMapping]);
    if (Component === null) {
        return children;
    }
    return (React.createElement(Component, { ref: ref }, children));
});
var TransitionGroup$1 = React.memo(TransitionGroup);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

const UNMOUNTED = "unmounted";
const EXITED = "exited";
const ENTERING = "entering";
const ENTERED = "entered";
const EXITING = "exiting";
function noop() { }
const Transition = React.forwardRef((props, ref) => {
    const { visible: visibleProp = false, children, appear = false, disappear = false, unmountOnExit = false, mountOnEnter = false, timeout, onEnter = noop, onEntering = noop, onEntered = noop, onExit = noop, onExiting = noop, onExited = noop } = props, childProps = __rest(props, ["visible", "children", "appear", "disappear", "unmountOnExit", "mountOnEnter", "timeout", "onEnter", "onEntering", "onEntered", "onExit", "onExiting", "onExited"]);
    const nodeRef = useRef(null);
    const initialStatus = useMemo(() => {
        let initialStatus;
        if (visibleProp) {
            if (appear) {
                initialStatus = EXITED;
            }
            else {
                initialStatus = ENTERED;
            }
        }
        else {
            if (disappear) {
                initialStatus = ENTERED;
            }
            else {
                if (unmountOnExit || mountOnEnter) {
                    initialStatus = UNMOUNTED;
                }
                else {
                    initialStatus = EXITED;
                }
            }
        }
        return initialStatus;
    }, []);
    const getTimeout = useCallback(() => {
        let enter, exit;
        if (typeof timeout === "number") {
            enter = exit = timeout;
        }
        else if (typeof timeout === "object") {
            enter = timeout && timeout.enter ? timeout.enter : 300;
            exit = timeout && timeout.exit ? timeout.exit : 500;
        }
        return {
            enter,
            exit
        };
    }, [timeout]);
    const [status, setStatus] = useStateCallback(initialStatus);
    useEffect(() => {
        //当visible由false变为true时 
        if (visibleProp && (status === EXITED)) {
            onEnter === null || onEnter === void 0 ? void 0 : onEnter(nodeRef.current);
            setStatus(ENTERING, () => {
                onEntering === null || onEntering === void 0 ? void 0 : onEntering(nodeRef.current);
                setTimeout(() => {
                    setStatus(ENTERED);
                    onEntered === null || onEntered === void 0 ? void 0 : onEntered(nodeRef.current);
                }, getTimeout().enter);
            });
            //当visible由true变为false时
        }
        else if (!visibleProp && status === ENTERED) {
            onExit === null || onExit === void 0 ? void 0 : onExit(nodeRef.current);
            setStatus(EXITING, () => {
                onExiting === null || onExiting === void 0 ? void 0 : onExiting(nodeRef.current);
                setTimeout(() => {
                    setStatus(EXITED);
                    onExited === null || onExited === void 0 ? void 0 : onExited(nodeRef.current);
                }, getTimeout().exit);
            });
        }
        else if (visibleProp && status === UNMOUNTED) {
            setStatus(EXITED);
        }
        else if (!visibleProp && status === EXITED && unmountOnExit) {
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
        }
        else {
            Component = React.cloneElement(React.Children.only(children), childProps);
        }
        return {
            TransitionComponent: Component
        };
    }, [status, childProps, children, handleRef]);
    if (status === UNMOUNTED) {
        return null;
    }
    return React.cloneElement(TransitionComponent, { ref: handleRef });
});

export { Transition, TransitionGroup$1 as TransitionGroup };
