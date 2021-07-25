import React, { useState } from 'react';
import { Transition } from '../../src';

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

function Demo4() {

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

            <Transition onEnter={node => node.offsetHeight} visible={visible} timeout={duration} appear unmountOnExit>
                {state => { 
                    //console.log("state",transitionStyles[state])
                    console.log("state",state)
                
                    return <div style={{
                        ...defaultStyle,
                        ...transitionStyles[state]
                    }}>
                        {"我只是一个Tranaasdsition过渡a效果"}
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

export default Demo4;