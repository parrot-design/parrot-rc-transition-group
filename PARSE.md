![wallpaper](./wallpaper.jpeg)

<style>
.customStyle{
    padding: 10px; 
    font-size: 1em;
    margin: 1em 0px;
    color: rgb(0, 0, 0);
    border-left: 5px solid rgba(0,189,170,1);
    background: rgb(239, 235, 233);
    line-height:1.5;
}
</style>

<blockquote class='customStyle'>
    <div><i>没有人能不流一滴汗就成功，成功的另一个名字正是努力。</i></div>
    <div style="text-align:right;"><b>——古天乐</b></div> 
</blockquote>

# 一、react-transition-group简介

<blockquote class='customStyle'>
众所周知，在vue中，如果想使用一些动画效果，如vue元素的<a href="https://cn.vuejs.org/v2/guide/transitions.html#%E5%8D%95%E5%85%83%E7%B4%A0-%E7%BB%84%E4%BB%B6%E7%9A%84%E8%BF%87%E6%B8%A1">渐隐渐显</a>，是非常方便的，因为在vue中内置了transition的这样一个组件。<br /><br />
但是在react中，官方并没有内置这样的一个组件，所以导致我们在实现一个简单的过渡效果时就会有些头痛。<br /><br />
而<a href='https://reactcommunity.org/react-transition-group/'>react-transition-group</a>就是官方推荐的实现react过渡效果的组件，不过这个组件并没有给我们提供一些动画效果。它为我们提供了一系列好用的组件，方便我们实时对元素的过渡时期进行监控，如过渡开始回调、过渡结束回调。
</blockquote>

# 二、Transition组件

## 1.简介

<blockquote class='customStyle'>
Transition 组件让您可以使用简单的声明式 API描述随时间从一个组件状态到另一种状态的转换。最常用于动画安装和卸载组件，但也可用于描述就地过渡状态。默认情况下，Transition组件不会改变它呈现的组件的行为，它只跟踪组件的“进入”和“退出”状态。由您来赋予这些状态以意义和效果。
</blockquote>

## 2.不使用过渡组件实现简单过渡效果

```js
import React,{ useState,useEffect,useRef } from 'react';   

const Transition=(props)=>{

    const [mounted,setMounted]=useState(false);

    const [mounted2,setMounted2]=useState(mounted);

    const initialVisible=useRef(false);

    const defaultStyle = {
        transition: `opacity 1000ms ease-in-out`,
        opacity: 0,
    }

    const styles={
        opacity: 1
    }

    const handleTransitionEnd=(e)=>{ 
        if(mounted===true && mounted2===true){
            initialVisible.current=true;
        }else if(mounted===true && mounted2===false ){
            initialVisible.current=false;
            setMounted(false);
        }
    }

    useEffect(() => {
        //如果一开始为false 后来变为true 表示组件刚进入时 即开始过渡
        if(initialVisible.current===false && props.visible===true){
            setMounted(true); 
            setTimeout(()=>{
                setMounted2(true)
            },50) 
        //如果一开始为true 后来变为false 表示组件刚准备结束时 即结束过渡
        }else if(initialVisible.current===true && props.visible===false){
            setMounted2(false);  
        }
    }, [props.visible]);   
      
    return mounted?<div style={{
        ...defaultStyle,
        ...(mounted2?styles:{})
    }} onTransitionEnd={handleTransitionEnd}>{"我只是一个过渡效果"}</div>:null;
}

const Demo1=()=>{

    const [visible,setVisible]=useState(false);

    const handleClick=(flag)=>()=>{
        if(flag){
            setVisible(true);
        }else{
            setVisible(false);
        } 
    }

    return (
        <div>
            <Transition visible={visible} />
            <button onClick={handleClick(true)}>打开</button>
            <button onClick={handleClick(false)}>关闭</button>
        </div>
    )
}

export default Demo1;
```
<blockquote class='customStyle'>
如上图，点击打开`"我只是一个过渡效果"`这行字会渐显，点击关闭会渐隐。其实就是利用了opacity这个css属性并增加transition进行过渡。<br /><br />
有的同学会说你看，这不是也能写出过渡效果吗，这还要什么库啊！<br /><br />但是仔细一看你会发现，就仅仅是一行字的过渡就需要写出这么多的代码，而且这和组件耦合性又太高了，维护起来直接就是一个大灾难，所以官方就提供了这个过渡库。接下来我们使用官方的库来实现一样的效果吧！
</blockquote>

## 3.使用过渡组件Transition

```js
import React, { useState } from 'react';
import { Transition } from 'react-transition-group';

const duration = 1000;

const defaultStyle = {
    transition: `opacity ${duration}ms ease-in-out`, 
    opacity: 0,
}

const transitionStyles = {
    entering: { opacity: 1 },
    entered: { opacity: 1  },
    exiting: { opacity: 0  },
    exited: { opacity: 0  },
}; 

function Demo2() {

    const [visible, setVisible] = useState(false);

    const handleClick=(flag)=>()=>{
        if(flag){
            setVisible(true);
        }else{
            setVisible(false);
        } 
    }

    return (
        <div>

            <Transition in={visible} timeout={duration}>
                {state => { 
                    return <div style={{
                        ...defaultStyle,
                        ...transitionStyles[state]
                    }}>
                        {"我只是一个Tranaasdsition过渡效果"}
                    </div>
                }
                }
            </Transition>

            <button onClick={handleClick(true)}>
                打开
            </button>
            <button onClick={handleClick(false)}>
                关闭
            </button>
        </div>
    );
}

export default Demo2;
```
<blockquote class='customStyle'>
如上所示，这是一个最简单的例子，需要通过in来决定需要过渡组件的过渡状态<br /><br />
Transition组件传入一个函数，函数的返回就是我们需要过渡的组件，第一个参数是过渡的不同状态，我们可以通过不同的状态给组件添加不同的style来实现不同的动画效果，demo很简单，可以自己了解下。<br /><br />
通过Transition组件可以有效的使组件和逻辑低耦合，减少心智负担。
</blockquote>

## 4.使用hooks来实现Transition组件

<blockquote class='customStyle'>
通过看Transition组件的源码我们可以得知这个组件是由class组件来编写的，由于我个人对class组件是比较反感的，而且使用别人的组件不仅要熟悉API而且可能会有坑：比如我们的上个例子中组件在第一次挂载时过渡开始动画就没有效果，这个我也给官方提了issue，官方的人也迟迟没有回应，所以最好的还是自己写一个组件，这样出现坑也能更及时的修复过来。
</blockquote>

### 1.首先定义props类型

```js
interface Timeout{
    appear?:number;
    exit?:number;
    enter?:number;
}
export interface ITransitionProps{
    visible:boolean;
    children:any;
    appear?:boolean;
    disappear?:boolean;
    unmountOnExit?:boolean;
    mountOnEnter?:boolean;
    timeout?:number|Timeout;
    onEnter?:Function; 
    onEntering?:Function;
    onEntered?:Function;
    onExit?:Function;
    onExiting?:Function;
    onExited?:Function;
}
```
<blockquote class='customStyle'>
1.visible表示触发进入或退出状态，与原组件的in是一样，因为不好听，所以改为了辨识度更高的visible。且为必选属性<br />
2.children表示过渡组件子元素也就是需要过渡的元素，这里可以是函数，也可以是一个普通组件，这里为了方便，我们偷懒直接给any,且为必选属性。<br />
3.appear表示在第一次挂载时执执行输入转换,默认为不执行<br />
4.disappear表示在第一次挂载时执不执行输出转换，默认为不执行<br />
5.unmountOnExit表示在完成退出后卸载组件，默认为不退出<br />
6.mountOnEnter表示在开始时才安装组件，默认一直安装<br />
7.timeout表示转换的持续时间，以毫秒为单位。<br />
8.onEnter表示在应用“进入”状态之前触发回调。<br />
9.onEntering表示应用“进入”状态后触发的回调。<br />
10.onEntered表示应用“进入”状态后触发的回调。<br />
11.onExit表示在应用“退出”状态之前触发回调。<br />
12.onExiting表示在应用“退出”状态后触发的回调。<br />
13.onExited表示在应用“退出”状态后触发的回调。<br />
</blockquote>

### 2.定义返回部分

<blockquote class='customStyle'>
通过使用我们发现Transition组件一般是传递一个函数，然后就可以在函数内部获取对应的状态然后赋予组件不一样的样式。其实我们不传递函数也是可以的，不传递函数的话我们就可以用过暴露的一些过渡时机函数来实现。
</blockquote>

```js
import React,{createElement,useMemo,useRef,useEffect,useCallback,useState} from 'react';
import { ITransitionProps } from '.';


export const UNMOUNTED="unmounted";
export const EXITED="exited";
export const ENTERING="entering";
export const ENTERED="entered";
export const EXITING="exiting";

const Transition=React.forwardRef((props:ITransitionProps,ref)=>{

    const {
        visible,
        children,
        ...childProps
    }=props;

    const [status,setStatus]=useState(EXITED);

    const { TransitionComponent }=useMemo(()=>{ 
        let Component; 
        if(typeof children==="function"){
            Component=children(status,childProps);
        }else{
            Component=React.cloneElement(React.Children.only(children),childProps);
        } 
        return {
            TransitionComponent:Component
        }
    },[status,childProps,children]);  

    return TransitionComponent;
});

export default Transition;
```

<blockquote class='customStyle'>
我们不难得出上面这些代码，主要是children来判断应该返回什么样子的组件，依靠status来进行组件的重新渲染。
</blockquote>

### 3.定义初始化时的状态
 
<blockquote class='customStyle'>
根据传递的属性visible等属性需要初始化status。<br />
</blockquote>

```js
const initialStatus=useMemo(()=>{  
        let initialStatus; 
        if(visibleProp){
            if(appear){
                initialStatus=EXITED;
            }else{
                initialStatus=ENTERED;
            }
        }else{ 
            if(disappear){
                initialStatus=ENTERED
            }else{
                if(unmountOnExit||mountOnEnter){
                    initialStatus=UNMOUNTED
                }else{
                    initialStatus=EXITED
                }
            }
            
        } 
        return initialStatus
},[]); 

const [status,setStatus]=useState(initialStatus);
```

<blockquote class='customStyle'>
1.因为appear表示需要在第一次挂载时执行过渡效果，所以我们需要将初始状态改为exited，从而存在exited变为entered的过程，进而有动画存在，否则直接将其设置为entered，即不存在状态的变化。<br />
2.同理，我们可以设置disappear表示是否需要在第一次挂载时执行过渡离开效果，所以我们需要将初始状态改为entered，从而存在entered变为exited的过程，进而产生动画效果，值得注意的是在else里面新增了一个额外的操作，就是当设置unmountOnExit或者mountOnEnter时，初始值设置为unmounted，即表示组件组件未挂载。<br />
</blockquote>

### 4.新增卸载状态的逻辑 

<blockquote class='customStyle'>
当status为unmount时，我们不应该渲染组件，即直接返回null，这里有一点需要注意的地方，return null不能写在hooks函数前面，否则会有意想不到的错误。
</blockquote>

```js
if (status === UNMOUNTED) {
    return null;
} 
```

### 5.获取转换的持续时间，以毫秒为单位。

```js
 const getTimeout=useCallback(()=>{
        let enter,exit;
        if(typeof timeout==="number"){
            enter=exit=timeout
        }else if(typeof timeout==="object"){
            enter=timeout && timeout.enter?timeout.enter:300;
            exit=timeout && timeout.exit?timeout.exit:500;
        }
        return {
            enter,
            exit
        }
},[timeout])
```

### 6.书写更新逻辑

```js
    useEffect(()=>{    
        //当visible由false变为true时 
        if(visibleProp && (status===EXITED)){
            
            onEnter?.(nodeRef.current);
             
            setStatus(ENTERING,()=>{
                onEntering?.(nodeRef.current);

                setTimeout(()=>{
                    setStatus(ENTERED);
                    onEntered?.(nodeRef.current);
                },getTimeout().enter);
            });
        //当visible由true变为false时
        }else if(!visibleProp && status===ENTERED){
            onExit?.(nodeRef.current);

            setStatus(EXITING,()=>{
                onExiting?.(nodeRef.current);

                setTimeout(()=>{
                    setStatus(EXITED);
                    onExited?.(nodeRef.current);
                },getTimeout().exit);
            });
        }else if(visibleProp && status===UNMOUNTED){
            setStatus(EXITED);
        }else if(!visibleProp && status===EXITED && unmountOnExit){
            setStatus(UNMOUNTED);
        } 
    },[visibleProp,status,getTimeout]);
```


<blockquote class='customStyle'>
1.当visible是true并且状态是exited时，表示此时是刚准备过渡，即状态由exited->entering->entered<br />
2.当visible是false并且状态是entered时，表示此时是刚准备离开过渡，即状态由entered->exiting->exited<br />
3.当visible是true并且状态是unmounted时，将状态变为exited,即状态由unmounted->exited->entering->entered<br />
4.当visible是false并且状态是exited时并且参数unmountedOnExit为true时
</blockquote>

### 7.Transition组件hooks版完整源码

```js
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
```

<blockquote class='customStyle'>
总行数只有134行，就已经完成了Transition组件的大部分功能了。经过我们的测试，功能均可使用。
</blockquote>

# 三、TransitionGroup组件

## 1.简介

<blockquote class='customStyle'>
<a href="http://reactcommunity.org/react-transition-group/transition-group/">TransitionGroup</a>组件在一个列表中管理一组转换组件,与转换组件一样，<TransitionGroup>是一个状态机，用于管理组件随时间的挂载和卸载。<br /><br />
当TransitionGroup组件内部的元素被添加或者删除时，transitiongroup会自动传入相对应的props供其使用。<br /><br />
所以该组件不仅是只能用于他内部的Transition等，我们也可以自定义一些组件进行使用。
</blockquote>

## 2.一个简单的demo感受一下

```js
import React, { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
 
function Child(props){
    console.log('Child',props.in);
    return <div>{'child'}</div>
}

function Demo5() {

    const [children, setChildren] = useState([]);
    console.log('Demo5',children);
    
    return (
        <div>
            
            <TransitionGroup>
                {children}
            </TransitionGroup>

            <button onClick={()=>setChildren(oldChild=>([...oldChild,<Child />]))}>
                增加
            </button>
            <button onClick={()=>setChildren(oldChild=>oldChild.slice(1))}>
                减少
            </button>
        </div>
    );
}

export default Demo5;
```

<blockquote class='customStyle'>
当我们增加元素时并没有任何的异常，但是当我们删除元素的时候，元素并没有变化，其实这是这个组件故意而为止，为的就是可以完整的渲染离开动画，那么我们如何清除这个元素呢？只需要执行传入的onExited即可。将其改造成下面这样，就会发现，在点击减少一秒钟后，元素就会消失，所以是不是很神奇？
</blockquote>

```js
function Child(props){ 
    useEffect(()=>{
        if(!props.in){
            setTimeout(()=>{
                props.onExited();
            },1000)
        }
    },[props.in])
    return <div>{'child'}</div>
}
```


## 3.使用hooks来实现TransitionGroup组件

### 1.定义返回值

```js
const TransitionGroup=React.forwardRef((props:ITransitionGroup,ref)=>{

    const { 
        component:Component='div',
        children
    }=props;  

    if(Component===null){
        return children;
    }   

    return (
        <Component ref={ref}>
            {children}
        </Component>
    ) 
})
 
export default React.memo(TransitionGroup);
```

<blockquote class='customStyle'>
1.可以传入component属性来作为过渡列表的包裹组件，默认为一个div。<br /><br />
2.当传入的component为null时，直接返回一个children
</blockquote>

### 2.定义四个变量后期使用

```js
1.const mounted=useRef(false);

2.const firstRender=useRef(true);

3.const [childrenMapping,setChildrenMapping]=useState({});

4.const childProp=useRef<any>(null);
```
<blockquote class='customStyle'>
1.mounted记录组件是否已经挂载完毕，后续会用到。<br /><br />
2.firstRender记录组件是否是第一次渲染，后续会用到。<br /><br />
3.因为我们不可能直接就返回children，我们会使用一个state来进行存储变更children。<br /><br />
4.使用childProp来实时获取真实的children。
</blockquote> 

### 3.初始化逻辑

```js
    useEffect(() => {    
        if(firstRender.current){
            setChildrenMapping(getInitialChildMapping(props,handleExited));
            firstRender.current=false;  
        }else{
           //...
        } 
       
    }, [props]) 

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
```
<blockquote class='customStyle'>
组件刚渲染时传递了visible为true，并且设置了一个key和children对应的一个对象，注意这里key必传，否则会发生意想不到的问题
</blockquote> 

### 4.更新时的逻辑

```js
    useEffect(() => {    
        if(firstRender.current){
            // ......
        }else{
            setChildrenMapping(prevChildrenMapping=>{
                return getNextChildMapping(props,prevChildrenMapping,handleExited)
            })
        }  
    }, [props]) 

    export function getNextChildMapping(nextProps:ITransitionGroup,prevChildMapping:IChildrenMapping,onExited:Function){
    let nextChildMapping=getChildMapping(nextProps.children)
    //合并所有的key
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
```

<blockquote class='customStyle'>
1.首先合并之前的key和传递进来的key。<br /><br />
2.遍历合并后的children并与上个props与更新后的props中的key进行比较，即可以判断出组件此时的状态。<br />
</blockquote> 

### 5.如何销毁不需要的组件

<blockquote class='customStyle'>
假设元素销毁 所需要的离开动画也已经完成了 那dom节点必然是不能继续留着了 那我们可以通过绑定的回调函数来通知其销毁节点
</blockquote> 


```js
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
```

### 6.TransitionGroup组件hooks版完整源码

```js
import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import {
    getChildMapping,
    getInitialChildMapping,
    ITransitionGroup,
    getNextChildMapping,
} from './utils/util';

const TransitionGroup = React.forwardRef((props: ITransitionGroup, ref) => {

    const {
        component: Component = 'div'
    } = props;

    //是否挂载完毕
    const mounted = useRef(false);
    //是否是第一次渲染
    const firstRender = useRef(true);

    const [childrenMapping, setChildrenMapping] = useState({});

    const childProp = useRef<any>(null);

    const handleExited = useCallback((child, node) => {

        let currentChildMapping = getChildMapping(childProp.current);
        //如果还在即返回
        if (child.key in currentChildMapping) return;

        if (child.props.onExited) {
            child.props.onExited(node);
        }

        if (mounted.current) {
            setChildrenMapping((prevChildrenMapping) => {
                let children: any = { ...prevChildrenMapping };
                delete children[child.key];
                return children;
            })
        }
    }, [childProp.current, mounted.current])

    useEffect(() => {
        //实时更新props:children的值
        childProp.current = props.children;
    }, [props])

    useEffect(() => {
        if (firstRender.current) {
            setChildrenMapping(getInitialChildMapping(props, handleExited));
            firstRender.current = false;
        } else {
            setChildrenMapping(prevChildrenMapping => {
                return getNextChildMapping(props, prevChildrenMapping, handleExited)
            })
        }

    }, [props])

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        }
    }, [])

    const children = useMemo(() => {
        return Object.values(childrenMapping) as any;
    }, [childrenMapping]);

    if (Component === null) {
        return children;
    }

    return (
        <Component ref={ref}>
            {children}
        </Component>
    )
})

export default React.memo(TransitionGroup);
```

# 四、未完待续

<blockquote class='customStyle'>
react-transition-group还有其余的几个组件如CSSTransition等如果后面有需要我还会带大家继续完成hooks重构。
</blockquote> 
