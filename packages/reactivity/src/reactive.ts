import {mutableHandlers,readonlyHandlers,shallowReadonlyHandlers} from './baseHandlers'

export const reactiveMap = new WeakMap();
export const readonlyMap = new WeakMap();
export const shallowReadonlyMap = new WeakMap();


export const enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive", // 普通
    IS_READONLY = "__v_isReadonly",// 只读
    RAW = "__v_raw", // 原始数据
}

/**
 * 创建普通响应式对象
 * @param target
 */
export function reactive(target:Object) {
    return createReactiveObject(target,reactiveMap,mutableHandlers);
}

/**
 * 创建只读响应式对象
 * @param target
 */
export function readonly(target:Object) {
    return createReactiveObject(target,readonlyMap,readonlyHandlers);
}

/**
 * 创建浅只读响应式对象
 * @param target
 */
export function shallowReadonly(target:Object) {
    return createReactiveObject(target,shallowReadonlyMap,shallowReadonlyHandlers);
}



/**
 * @description 创建响应式对象，如果对象以缓存，返回缓存对象
 * @param target
 * @param proxyMap
 * @param baseHandlers
 */
function createReactiveObject(target:Object, proxyMap:WeakMap<any,any>, baseHandlers:any) {
    const existingProxy = proxyMap.get(target);
    if(existingProxy) return existingProxy;
    const proxy = new Proxy(target,baseHandlers)
    proxyMap.set(target,proxy);
    return proxy;
}


export function isProxy(value:Object):boolean {
    return isReactive(value) || isReadonly(value);
}


export function isReactive(value: Object){
    return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value:Object){
    return !!value[ReactiveFlags.IS_READONLY]
}


export function toRaw(value:Object){
    // 返回原始数据，与vue3实现有差异
    if(!value[ReactiveFlags.RAW]){
        return value;
    }
    return value[ReactiveFlags.RAW];
}



