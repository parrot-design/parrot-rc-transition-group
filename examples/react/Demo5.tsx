import React, { useState,useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';

 
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

function Demo5() {

    const [children, setChildren] = useState([]); 
    
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