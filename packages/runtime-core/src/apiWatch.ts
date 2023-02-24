import {ReactiveEffect} from "@my-vue/reactivity";
import {queuePreFlushCb} from "./scheduler";


export function watchEffect(effect){
    doWatch(effect);
}




function doWatch(source){
    let cleanup;
    const onCleanup = (fn) => {
        // 当 effect stop 的时候也需要执行 cleanup
        // 所以可以在 onStop 中直接执行 fn
        cleanup = effect.onStop = () => {
            fn();
        };
    };
    // 这里是在执行 effect.run 的时候就会调用的
    const getter = () => {
        // 这个的检测就是初始化不执行 cleanup 的关键点
        if (cleanup) {
            cleanup();
        }

        source(onCleanup);
    };

    const scheduler = () => queuePreFlushCb(job); // 设置调度为render执行前
    const effect = new ReactiveEffect(getter, scheduler);
    var job = ()=>{
        effect.run();
    };


    effect.run();

    return ()=>{
        effect.stop(); // TODO：为什么不执行return effect.stop
    }
}