import {initProps} from './componentProps'
import {initSlots} from "./componentSlots";
import {emit} from './componentEmits';

import {publicInstanceProxyHandlers} from "./componentPublicInstance";
import {proxyRefs, shallowReadonly, shallowReadonlyMap} from "@my-vue/reactivity";
import {_} from "vitest/dist/types-0373403c";

let currentInstance = {};
let compile ;

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

        const setupContext = createSetupContext(instance);

        const setupResult = setup?.(shallowReadonly(instance.props), setupContext);
        setCurrentInstance(instance);

        handleSetupResult(instance,setupResult);
    }else{

    }
}

function createSetupContext(instance){
    console.log('my-vue3: create setupContext');

    return {
        attrs: instance.attrs,
        slots: instance.slots,
        emit: instance.emit,
        expose: ()=>{} // TODO: 导入一些变量到instance中
    }
}

function handleSetupResult(instance,setupResult){
    if(typeof setupResult === 'function'){
        instance.render = setupResult;
    }else if (typeof setupResult ==='object'){
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}

function finishComponentSetup(instance){
    const Component = instance.tyep;

    if(!instance.render){
        if(compile && !Component.render){
            const template = Component.template ;
            // 如果有模版编译工具，编译模版成render函数
            Component.render = compile(template);
        }
    }

    instance.render = Component.render;

    applyOptions();
}


/**
 * 兼容Vue2 opiton api
 */
function applyOptions(){
}

export function setCurrentInstance(instance){
    currentInstance = instance;
}

export function getCurrentInstance() :any{
    return currentInstance;
}

export function registerRuntimeCompiler(_compile){
    compile = _compile;
}