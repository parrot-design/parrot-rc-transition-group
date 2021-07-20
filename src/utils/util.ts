import React, { Children, cloneElement, isValidElement } from 'react';

/** 单个children元素接口 */
export interface IChildrenProps{
    onExited?:Function;
    visible?:boolean;
    appear?:boolean;
    enter?:boolean;
    exit?:boolean;
    key?:string; 

    [propName: string]: any
}

/** 全部children元素接口 */
export type IChildrensProps=React.ReactElement<IChildrenProps> | React.ReactElement<IChildrenProps>[] ;

/** mapping结构 */
export interface IChildrenMapping{
    [propName: string]:IChildrensProps
}

/** TransitionGroup组件接口  */
export interface ITransitionGroup{
    component?:any;
    children:IChildrensProps;

    [propName: string]: any
} 
/**
 * @return 返回一个对象映射键到child
 * @param children 传入的children
 * @param mapFn 遍历方法
 */
export function getChildMapping(children:IChildrensProps,mapFn?:any){
    let mapper=(child:IChildrensProps)=>
    mapFn && isValidElement(child) ? mapFn(child) :child;

    let result=Object.create(null); 
    if(children){
        /** map会给每个没有key的组件加上默认的key */
        Children.map(children,c=>c).forEach((child)=>{ 
            result[child.key!]=mapper(child);
        })
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
function getProp(child:React.ReactElement<IChildrenProps>,prop:string,props:ITransitionGroup){
    return props[prop]!=null?props[prop]:child.props[prop];
}
/**
 * 
 * @param props group组件属性
 * @param onExited 将孩子节点传入
 * @returns 返回对应的键值对
 */
export function getInitialChildMapping(props:ITransitionGroup,onExited?:Function){
    return getChildMapping(props.children,(child:React.ReactElement<IChildrenProps>)=>{
        return cloneElement(child,{
            onExited:onExited!.bind(null,child),
            visible:true,
            appear:getProp(child,'appear',props),
            enter:getProp(child,'enter',props),
            exit:getProp(child,'exit',props)
        })
    })
}

export function mergeChildMappings(prev:IChildrenMapping={},next:IChildrenMapping={}){

    function getValueForKey(key:string){
        return key in next?next[key]:prev[key];
    }

    //存储还剩余的键
    let nextKeysPending=Object.create(null);

    //存储
    let pendingKeys:any[]=[];
     
    for(let prevKey in prev){
        if(prevKey in next){
            if(pendingKeys.length){
                nextKeysPending[prevKey]=pendingKeys;
                pendingKeys=[]
            }
        }else{
            pendingKeys.push(prevKey)
        }
    }  

    let i;
    let childMapping:IChildrenMapping={};
    for(let nextKey in next){
        if (nextKeysPending[nextKey]) {
            for(i=0;i<nextKeysPending[nextKey].length;i++){
                let previngNextKey=nextKeysPending[nextKey][i];
                childMapping[nextKeysPending[nextKey][i]]=getValueForKey(previngNextKey);
            }
        }
        childMapping[nextKey]=getValueForKey(nextKey);
    }
 

    for(i=0;i<pendingKeys.length;i++){
        childMapping[pendingKeys[i]]=getValueForKey(pendingKeys[i]);
    }

    return childMapping;

}

export function getNextChildMapping(nextProps:ITransitionGroup,prevChildMapping:IChildrenMapping,onExited:Function){
    let nextChildMapping=getChildMapping(nextProps.children)
    let children=mergeChildMappings(prevChildMapping,nextChildMapping); 
 
    Object.keys(children).forEach(key=>{
        let child=children[key];

        if(!isValidElement(child)) return ;

        //是之前的
        const hasPrev=key in prevChildMapping;
        //是新加的
        const hasNext=key in nextChildMapping;

        const prevChild=prevChildMapping[key];
        const isLeaving=isValidElement(prevChild) && !prevChild.props.visible;

        //新添加的（entering）
        if(hasNext && (!hasPrev||isLeaving)){
            children[key]=cloneElement(child,{
                onExited:onExited.bind(null,child),
                visible:true,
                exit:getProp(child,'exit',nextProps),
                enter:getProp(child,'enter',nextProps)
            })
        }else if(!hasNext && hasPrev && !isLeaving){
            //离开的（exiting）
            children[key]=cloneElement(child,{visible:false})
        }else if(hasNext && hasPrev && isValidElement(prevChild)){
            //没有变化的
            children[key]=cloneElement(child,{
                onExited:onExited.bind(null,child),
                visible:prevChild.props.visible,
                exit:getProp(child,'exit',nextProps),
                enter:getProp(child,'enter',nextProps)
            })
        }
    })

    return children;
}