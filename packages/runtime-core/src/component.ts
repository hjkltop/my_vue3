import {initProps} from './componentProps'
import {initSlots} from "./componentSlots";
import {emit} from './componentEmits';

import {publicInstanceProxyHandlers} from "./componentPublicInstance";
import {proxyRefs, shallowReadonlyMap} from "@my-vue/reactivity";

export function createComponentInstance(vnode ,parent){

    const instance = {
        type: vnode.type,
        vnode,
        next: null, // 需要更新的vnode，
        props:{},
        parent,
        provides: parent? parent.provides : {},
        proxy:null,
        isMounted: false,
        attrs:{},
        slots:{},
        ctx:{}, // context
        setupState: {},
        emit: ()=>{}
    }

    instance.ctx = {
        _: instance
    };

    instance.emit = emit.bind(null,instance) as any;

    return instance;
}

export function setupComponent(instance){
    const {props ,children} = instance.vnode;
    initProps(instance,props);
    initSlots(instance,children);


    setupStatefulComponent(instance);
}


function setupStatefulComponent(instance) {
    console.log('my-vue: 创建proxy')

    instance.proxy = new Proxy(instance.ctx, publicInstanceProxyHandlers);

    const Component = instance.type;

    const {setup} = Component;

    if(setup){
        setCurrentInstance(instance);
    }


}