import React from 'react';
//import { TransitionGroup }from 'react-transition-group';
import TransitionGroup from '../../src/TransitionGroup'
 

const Ripple = (props:any) => {

    const { timeout, num,onExited,visible:inProp } = props;

    const testref=React.useRef(null);
     
    React.useEffect(() => { 
        const timeoutId = setTimeout(()=>{
            console.log("onExited")
            onExited(testref.current)
        }, 10000);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [timeout,onExited])

    return (
        <div ref={testref}>测试{num}</div>
    )
}

const Demo = () => {

    const num = React.useRef(1);

    const [children, setChildren] = React.useState([<Ripple num={num.current} key={num.current} />])

    const handleAdd = () => {
        setChildren(oldChildren => {
            num.current += 1;
            return [
                ...oldChildren,
                <Ripple num={num.current} key={num.current} />
            ]
        })
    }

    const handleDelete=()=>{
        setChildren(oldChildren => { 
            return oldChildren.slice(1)
        })
    }

    console.log("render")

    return (
        <div>
            <TransitionGroup component={null} exit >
                {children}
            </TransitionGroup>

            <button onClick={handleAdd}>添加</button>
            <button onClick={handleDelete}>删除</button>
        </div>
    )
}

export default Demo;