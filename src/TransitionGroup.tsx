import React, { useRef,useEffect,useCallback,useState,useMemo } from 'react';
import { 
    getChildMapping,
    getInitialChildMapping, 
    ITransitionGroup,
    getNextChildMapping,
    IChildrenProps,
    IChildrensProps
} from './utils/util'; 
 
const TransitionGroup:React.ForwardRefRenderFunction<unknown, ITransitionGroup>=(props,ref)=>{

    const { 
        component:Component='div',
        children:childrenProp
    }=props; 

    //是否挂载完毕
    const mounted=useRef(false);
    //是否是第一次渲染
    const firstRender=useRef(true);

    const [childrenMapping,setChildrenMapping]=useState({});

    const childProp=useRef<any>(null);

    const handleExited=useCallback((child,node)=>{
         
        let currentChildMapping=getChildMapping(childProp.current); 
        //如果还在即返回
        if(child.key in currentChildMapping) return ; 

        if (child.props.onExited) {
            child.props.onExited(node);
        }

        if(mounted.current){
            setChildrenMapping((prevChildrenMapping)=>{
                let children:any={...prevChildrenMapping};
                delete children[child.key];
                return children;
            })
        }  
    },[childProp.current,mounted.current])

    useEffect(() => {
        //实时更新props:children的值
        childProp.current=props.children;
    }, [props])

    useEffect(() => {    
        mounted.current=true;
        if(firstRender.current){
            setChildrenMapping(getInitialChildMapping(props,handleExited));
            firstRender.current=false;  
        }else{
            setChildrenMapping(prevChildrenMapping=>{
                return getNextChildMapping(props,prevChildrenMapping,handleExited)
            })
        } 
        return ()=>{
            mounted.current=false;
        }
    }, [props]) 

    const children=useMemo(()=>{
        return Object.values(childrenMapping) as any;
    },[childrenMapping]);  

    if(Component===null){
        return children;
    }   

    return (
        <Component ref={ref}>
            {children}
        </Component>
    )

}
 
export default React.forwardRef<unknown, ITransitionGroup>(TransitionGroup);
 

