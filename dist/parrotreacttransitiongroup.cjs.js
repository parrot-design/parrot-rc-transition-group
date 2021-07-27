'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var reactHooks = require('@parrotjs/react-hooks');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

/**
 * @return 返回一个对象映射键到child
 * @param children 传入的children
 * @param mapFn 遍历方法
 */
function getChildMapping(children, mapFn) {
    let mapper = (child) => mapFn && React.isValidElement(child) ? mapFn(child) : child;
    let result = Object.create(null);
    if (children) {
        /** map会给每个没有key的组件加上默认的key */
        React.Children.map(children, c => c).forEach((child) => {
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
        return React.cloneElement(child, {
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
        if (!React.isValidElement(child))
            return;
        //是之前的
        const hasPrev = key in prevChildMapping;
        //是新加的
        const hasNext = key in nextChildMapping;
        const prevChild = prevChildMapping[key];
        const isLeaving = React.isValidElement(prevChild) && !prevChild.props.visible;
        //新添加的（entering）
        if (hasNext && (!hasPrev || isLeaving)) {
            children[key] = React.cloneElement(child, {
                onExited: onExited.bind(null, child),
                visible: true,
                exit: getProp(child, 'exit', nextProps),
                enter: getProp(child, 'enter', nextProps)
            });
        }
        else if (!hasNext && hasPrev && !isLeaving) {
            //离开的（exiting）
            children[key] = React.cloneElement(child, { visible: false });
        }
        else if (hasNext && hasPrev && React.isValidElement(prevChild)) {
            //没有变化的
            children[key] = React.cloneElement(child, {
                onExited: onExited.bind(null, child),
                visible: prevChild.props.visible,
                exit: getProp(child, 'exit', nextProps),
                enter: getProp(child, 'enter', nextProps)
            });
        }
    });
    return children;
}

const TransitionGroup = React__default['default'].forwardRef((props, ref) => {
    const { component: Component = 'div' } = props;
    //是否挂载完毕
    const mounted = React.useRef(false);
    //是否是第一次渲染
    const firstRender = React.useRef(true);
    const [childrenMapping, setChildrenMapping] = React.useState({});
    const childProp = React.useRef(null);
    const handleExited = React.useCallback((child, node) => {
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
    React.useEffect(() => {
        //实时更新props:children的值
        childProp.current = props.children;
    }, [props]);
    React.useEffect(() => {
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
    React.useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    const children = React.useMemo(() => {
        return Object.values(childrenMapping);
    }, [childrenMapping]);
    if (Component === null) {
        return children;
    }
    return (React__default['default'].createElement(Component, { ref: ref }, children));
});
var TransitionGroup$1 = React__default['default'].memo(TransitionGroup);

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
const Transition = React__default['default'].forwardRef((props, ref) => {
    const { visible: visibleProp = false, children, appear = false, disappear = false, unmountOnExit = false, mountOnEnter = false, timeout, onEnter = noop, onEntering = noop, onEntered = noop, onExit = noop, onExiting = noop, onExited = noop } = props, childProps = __rest(props, ["visible", "children", "appear", "disappear", "unmountOnExit", "mountOnEnter", "timeout", "onEnter", "onEntering", "onEntered", "onExit", "onExiting", "onExited"]);
    const nodeRef = React.useRef(null);
    const initialStatus = React.useMemo(() => {
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
    const getTimeout = React.useCallback(() => {
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
    const [status, setStatus] = reactHooks.useStateCallback(initialStatus);
    React.useEffect(() => {
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
    const handleRef = reactHooks.useForkRef(nodeRef, ref, children.ref);
    const { TransitionComponent } = React.useMemo(() => {
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
            Component = React__default['default'].cloneElement(React__default['default'].Children.only(children), childProps);
        }
        return {
            TransitionComponent: Component
        };
    }, [status, childProps, children]);
    if (status === UNMOUNTED) {
        return null;
    }
    return React__default['default'].cloneElement(TransitionComponent, { ref: handleRef });
});

exports.Transition = Transition;
exports.TransitionGroup = TransitionGroup$1;
