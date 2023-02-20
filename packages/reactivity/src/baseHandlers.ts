import {isObject} from "@my-vue/shared";

import {reactive,readonly, ReactiveFlags, reactiveMap, readonlyMap, shallowReadonlyMap,} from './reactive'


const get = createGetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true,true);

const set = createSetter();


/**
 * 创建proxy get 代理
 * @param isReadonly 是否只读
 * @param shallow 浅监听
 */
function createGetter(isReadonly = false, shallow = false){
    return function get(target:Object, flag:ReactiveFlags | string, receiver:Object){
        const isExistInReactiveMap = ()=> flag === ReactiveFlags.RAW && receiver === reactiveMap.get(target); // 是否普通包装数据
        const isExistInReadonlyMap = ()=> flag===ReactiveFlags.RAW && receiver === readonlyMap.get(target);  // 是否是只读已包装数据
        const isExistInShallowReadonlyMap = ()=> flag === ReactiveFlags.RAW && reactive === shallowReadonlyMap.get(target) // 是否是浅只读包装数据

        if (flag === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        } else if (flag === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        } else if (isExistInReactiveMap()|| isExistInReadonlyMap() || isExistInShallowReadonlyMap()){
            return target;
        }

        const res = Reflect.get(target,flag,receiver);

        if(!isReadonly){
            // 依赖收集
        }

        if(shallow){
            return res;
        }

        if(isObject(res)){
            return isReadonly ? readonly(res) : reactive(res); // 递归包装
        }

        return res;
    }
}


function createSetter(){
    return function set(target:Object,key:string,value:unknown,receiver:Object){
        const result = Reflect.set(target,key, value ,receiver)
        // 触发依赖
        return result;
    }

}


export const mutableHandlers = {
    get,
    set
}


export const readonlyHandlers = {
    get: readonlyGet,
    set(target,key){
        console.warn(`my-vue: Set operation on key ${String(key)} failed: target is readonly.`, target);
        return true;
    }
}



export const shallowReadonlyHandlers = {
    get: shallowReadonlyGet,
    set(target,key){
        console.warn(`my-vue: Set operation on key ${String(key)} failed: target is readonly.`, target);
        return true;
    }
}
