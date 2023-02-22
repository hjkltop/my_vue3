import {extend} from "@my-vue/shared";
import {createDep,Dep} from "./dep";

type anyFunc =  (...args:unknown[])=>unknown;


let activeEffect:ReactiveEffect|undefined; // 当前ReactiveEffect对象
let shouldTrackLock = false; // 收集依赖锁
const targetMap = new WeakMap();


/**
 * 依赖收集
 */
export class ReactiveEffect{
    private active:boolean = true;
    public deps:Dep[] = [];


    constructor(public fn:anyFunc,public scheduler?) {
        console.log('my-vue: create ReactiveEffect', this);
    }

    public onStop?: ()=>void;

    run(){
        if(!this.active){
            return this.fn();
        }
        shouldTrackLock = true;
        activeEffect = this;
        const result = this.fn();
        shouldTrackLock = false;
        activeEffect = undefined;
        return result;
    }
    stop(){
        if(this.active){
            cleanupEffect(this);
            this.onStop?.();
            this.active = false;
        }
    }
}

/**
 * 清理依赖收集
 * @param effect
 */
function cleanupEffect(effect){
    // 删除关联依赖
    effect.deps.forEach(dep=>{
        dep.delete(effect)
    });

    // 删除自身依赖
    effect.deps.length = 0;
}

/**
 * 创建依赖收集
 * @param fn
 * @param options
 */
export function effect(fn:anyFunc,options={}){
    const _effect = new ReactiveEffect(fn);

    extend(_effect,options);

    _effect.run();

    const runner:ReactiveEffect['run']&{effect?: ReactiveEffect} = _effect.run.bind(_effect);

    runner.effect = _effect;

    return runner;
}

/**
 * 是否在依赖收集器在运行
 */
export function isTracking() {
    return shouldTrackLock && activeEffect !== undefined;
}

/**
 * 停止依赖收集
 * @param runner
 */
export function stop(runner){
    runner.effect.stop();
}

/**
 * 触发收集记录
 * @param target 触发对象
 * @param type 触发类型, 暂时无用
 * @param key 触发key
 */
export function track(target,type,key){
    if(!isTracking()){
        return;
    }

    console.log(`my-vue: track -> target: ${target} type: ${type} key:${key}`);

    let depsMap = targetMap.get(target);

    if(!depsMap){
        depsMap = new Map();
        targetMap.set(target,depsMap);
    }

    let dep = depsMap.get(key);

    if(!dep){
        dep = createDep();
        depsMap.set(key,dep);
    }

    trackEffects(dep);
}



/**
 * 存储依赖收集
 * @param dep
 */
export function trackEffects(dep:Dep){
    // TODO： 依赖收集清理
    if(activeEffect && !dep.has(activeEffect)){
        dep.add(activeEffect);
        activeEffect.deps.push(dep);
    }
}

/**
 * 触发依赖执行
 * @param target 触发对象
 * @param type 触发类型， 暂时无用
 * @param key 触发key
 */
export function trigger(target ,type:string , key){
    let deps : Array<any>= [];

    const depsMap = targetMap.get(target);
    if(!depsMap) return;

    const dep = depsMap.get(key);

    deps.push(dep);

    const effects: any[] = [];

    // TODO: 修改成Object.concat
    deps.forEach(dep=> effects.push(...dep));

    trackEffects(createDep(effects));
}

/**
 * 依赖执行
 * @param dep
 */
export function triggerEffects(dep){
    for(const effect of dep){
        if(effect.scheduler){
            // 用户自定义调度
            effect.scheduler();
        }else{
            effect.run();
        }
    }
}