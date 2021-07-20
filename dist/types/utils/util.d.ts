import React from 'react';
/** 单个children元素接口 */
export interface IChildrenProps {
    onExited?: Function;
    visible?: boolean;
    appear?: boolean;
    enter?: boolean;
    exit?: boolean;
    key?: string;
    [propName: string]: any;
}
/** 全部children元素接口 */
export declare type IChildrensProps = React.ReactElement<IChildrenProps> | React.ReactElement<IChildrenProps>[];
/** mapping结构 */
export interface IChildrenMapping {
    [propName: string]: IChildrensProps;
}
/** TransitionGroup组件接口  */
export interface ITransitionGroup {
    component?: any;
    children: IChildrensProps;
    [propName: string]: any;
}
/**
 * @return 返回一个对象映射键到child
 * @param children 传入的children
 * @param mapFn 遍历方法
 */
export declare function getChildMapping(children: IChildrensProps, mapFn?: any): any;
/**
 *
 * @param props group组件属性
 * @param onExited 将孩子节点传入
 * @returns 返回对应的键值对
 */
export declare function getInitialChildMapping(props: ITransitionGroup, onExited?: Function): any;
export declare function mergeChildMappings(prev?: IChildrenMapping, next?: IChildrenMapping): IChildrenMapping;
export declare function getNextChildMapping(nextProps: ITransitionGroup, prevChildMapping: IChildrenMapping, onExited: Function): IChildrenMapping;
