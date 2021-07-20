import React, { Children, isValidElement, cloneElement, useRef, useState, useCallback, useEffect, useMemo } from 'react';

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

const TransitionGroup = (props, ref) => {
    const { component: Component = 'div', children: childrenProp } = props;
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
        mounted.current = true;
        if (firstRender.current) {
            setChildrenMapping(getInitialChildMapping(props, handleExited));
            firstRender.current = false;
        }
        else {
            setChildrenMapping(prevChildrenMapping => {
                return getNextChildMapping(props, prevChildrenMapping, handleExited);
            });
        }
        return () => {
            mounted.current = false;
        };
    }, [props]);
    const children = useMemo(() => {
        return Object.values(childrenMapping);
    }, [childrenMapping]);
    if (Component === null) {
        return children;
    }
    return (React.createElement(Component, { ref: ref }, children));
};
var TransitionGroup$1 = React.forwardRef(TransitionGroup);

export { TransitionGroup$1 as TransitionGroup };
