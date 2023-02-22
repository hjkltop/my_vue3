import {createDep, Dep} from "./dep";
import {reactive, ReactiveFlags} from "./reactive";
import {hasChanged, isObject} from "@my-vue/shared";
import {isTracking, trackEffects, triggerEffects} from "./effect";
import {ComputedRefImpl} from "./computed.js";


export class RefImpl{
    private _value:any;

    public dep:Dep;
    public __v_isRef = true;

    constructor(public _rawValue:any) {
        // 包装value
        this._value = convert(_rawValue);
        this.dep = createDep()
    }

    get value(){
        trackRefValue(this);
        return this._value;
    }
    set value(newValue){
        if(hasChanged(newValue,this._rawValue)){
            this._value = convert(newValue);
            this._rawValue = newValue;
            triggerRefValue(this)
        }
    }
}

/**
 * 如果是对象，递归包装
 * @param value
 */
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}

/**
 * 创建ref
 * @param value
 */
export function ref(value){
    return new RefImpl(value);
}

/**
 * 触发执行
 * @param ref
 */
export function triggerRefValue(ref:RefImpl|ComputedRefImpl){
    triggerEffects(ref.dep);
}

/**
 * 触发收集
 * @param ref
 */
export function trackRefValue(ref:RefImpl|ComputedRefImpl){
    if(isTracking()){
        trackEffects(ref.dep)
    }
}

/**
 *
 * @param value
 */
export function isRef(value:any){
    return !!value?.__v_isRef;
}

/**
 *
 * @param ref
 */
export function unRef(ref:any){
    return isRef(ref)? ref?.value : ref;
}

/**
 * 解包装，set判断代理
 */
const  shallowUnwrapHandlers = {
    get(target:any, key: any, receiver:any){
        return unRef(Reflect.get(target,key,receiver));
    },
    set(target:any, key: any,value: any, receiver:any){
        const oldValue = target[key];
        if(isRef(oldValue) && !isRef(value)){
            return (target[key].value = value);
        }else{
            return Reflect.set(target,key,value,receiver);
        }
    }
}

export function proxyRefs(objectWithRefs:unknown){
    return new Proxy(objectWithRefs,shallowUnwrapHandlers);
}