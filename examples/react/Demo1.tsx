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