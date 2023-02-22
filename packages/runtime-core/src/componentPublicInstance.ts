import {hasOwn} from "@my-vue/shared";


const publicPropertiesMap = {
    $el : (i)=> i.vnode.el,
    $emit: (i) => i.emit,
    $slots: (i)=> i.slots,
    $props: i => i.props
}


/**
 * 包装实例
 */
export const publicInstanceProxyHandlers = {
    get({_:instance}, key){
        const {setupState,props} = instance;

        if(key?.[0] !== '$'){
            if(hasOwn(setupState,key)){
                return setupState[key];
            }else if(hasOwn(props,key)){
                return props[key]
            }
        }

        const publicGetter = publicPropertiesMap[key];

        if(publicGetter){
            return publicGetter[instance];
        }
    },
    set({_:instance},key,value){
        const {setupState} = instance;

        if(hasOwn(setupState,key)){
            setupState[key] = value;
        }
        return true;
    }
}


