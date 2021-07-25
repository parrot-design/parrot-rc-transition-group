import React, { useState,useEffect,useRef } from 'react';
import { TransitionGroup } from 'react-transition-group';

  
function Child(props){

    const mounted=useRef(false);

    useEffect(() => {
      
        mounted.current=true;
        return () => {
            console.log("destory")
            mounted.current=false;
        }
    }, [])

    return <div>{props.num}</div>
}

function Demo6() {
 
    const [num,setNum]=useState(0);
    
    return (
        <div>
             
            <Child num={num} />

            <button onClick={()=>setNum(num+1)}>
                增加
            </button> 
        </div>
    );
}

export default Demo6;