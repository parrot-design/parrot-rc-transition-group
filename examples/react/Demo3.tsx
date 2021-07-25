import React, { useState } from 'react';
import { Transition } from 'react-transition-group';

class Child extends React.Component{
    
    constructor(props){
        super(props);
        this.state={
            num:0
        }
    }

    static getDerivedStateFromProps(nextProps,prevState){
        console.log("getDerivedStateFromProps",nextProps,prevState);
        return {
            num:nextProps.num
        }
    }

    render(){

        console.log("renderChild");

        return (
            <div>
                {this.state.num}
            </div>
        )
    }
    
}
 

function Parent() {

    const [num, setNum] = useState(0);

    console.log("renderParent")
 
    return (
        <div>
            <Child num={num}/>
            <button onClick={()=>{setNum(num+1)}}>渲染</button>
        </div>
    );
}

export default Parent;