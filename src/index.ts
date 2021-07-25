export { default as TransitionGroup } from './TransitionGroup';
export { default as Transition } from './Transition';

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