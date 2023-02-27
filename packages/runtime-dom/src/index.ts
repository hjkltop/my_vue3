import {isOn} from '@my-vue/shared';
import {createRenderer} from "@my-vue/runtime-core";


function createElement(type){
    console.log('CreateElement', type);
    return document.createElement(type);
}


function createText(text){
    return document.createTextNode(text);
}

function setText(node,text){
    node.nodeValue= text;
}

function setElementText(el,text){
    console.log('SetElementText', el, text);
    el.textContent = text;
}


function patchProp(el,key,preValue,nextValue){
    console.log(`@my-vue: PatchProp 设置属性:${key} 值:${nextValue}`);
    console.log(`@my-vue: key: ${key} 之前的值是:${preValue}`);

    if(isOn(key)){
        const invokers = el._vei || (el._vei = {}); // 调用者
        const existingInvoker = invokers[key];
        if(nextValue && existingInvoker ){
            existingInvoker.value = nextValue;
        }else{
            const eventName = key.slice(2).toLowerCase();
            if(nextValue){
                const invoker = (invokers[key] = nextValue);
                el.addEventListener(eventName,invoker);
            }else{
                el.removeEventListener(eventName,existingInvoker);
            }
            invokers[key] = undefined;
        }

    }else{
        if(nextValue === null || nextValue === ''){
            el.removeAttribute(key);
        }else{
            el.setAttribute(key,nextValue);
        }
    }

}


function insert(child ,parent, anchor = null){
    console.log('@my-vue: Insert');
    parent.insertBefore(child,anchor);
}

function remove(child){
    const parent = child.parentNode;
    if(parent){
        parent.removeChild(child);
    }
}

let renderer;

/**
 * 单例
 */
function ensureRenderer(){
    return (renderer || (renderer = createRenderer({
        createElement,
        createText,
        setText,
        setElementText,
        patchProp,
        insert,
        remove
    })));
}

export const createApp= (...args)=>{
    return ensureRenderer().createApp(...args);
}

export * from '@my-vue/runtime-core';