/**
 * 是否需要更新
 * @param prevVNode
 * @param nextVNode
 */
export function shouldUpdateComponent(prevVNode,nextVNode) {
    const {props:prevProps} = prevVNode;
    const {props:nextProps} = nextVNode;

    if(prevProps === nextProps){
        return false;
    }


    if(!prevProps){
        return !!nextProps;
    }

    if(!nextProps){
        return true;
    }

    return hasPropsChanged(prevProps,nextProps);
}


/**
 * props是否改变
 * @param prevProps
 * @param nextProps
 */
function hasPropsChanged(prevProps,nextProps):boolean{
    const nextKeys = Object.keys(nextProps);

    if(nextKeys.length !== Object.keys(prevProps).length){
        return true;
    }

    for(let i = 0 ; i< nextKeys.length;i++){
        const key = nextKeys[i];
        if(nextProps[key] !== prevProps[key]){
            return true;
        }
    }
    return false;
}