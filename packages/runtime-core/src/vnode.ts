import {ShapeFlags} from "@my-vue/shared";
export { createVNode as createElementVNode }
export {createVNode as h};

export function createVNode(type:any,props?:any,children?:string| any[]){
    const vnode = {
        el: null,
        component: null,
        key: props?.key,
        type,
        props: props || {},
        children,
        shapeFlag: getShapeFlag(type)
    };

    if(Array.isArray(children)){
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }else if (typeof children === 'string'){
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    normalizeChildren(vnode,children);
    return vnode;
}


/**
 * 标准化children
 * @param vnode
 * @param children
 */
export function normalizeChildren(vnode, children){
    if(typeof children === 'object'){
        if(!(vnode.shapeFlag & ShapeFlags.ELEMENT)){// 子组件如果不是节点，那就是slots
            vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
        }
    }
}

/**
 * 获取组件类型标记
 * @param type
 */
function getShapeFlag(type:any){
    return typeof type ==='string'? ShapeFlags.ELEMENT: ShapeFlags.STATEFUL_COMPONENT;
}


export const Text = Symbol('Text');
export const Fragment = Symbol('Fragment'); //TODO:

/**
 * 创建普通文本组件
 * @param text
 */
export function createTextVNode(text:string= " "){
    return createVNode(Text,{},text)
}

/**
 * 标准化VNode
 * @param child
 */
export function normalizeVNode(child:unknown){
    if(typeof child ==='string' || typeof  child === 'number'){
        return createVNode(Text,null,String(child));
    }
    return child;
}
