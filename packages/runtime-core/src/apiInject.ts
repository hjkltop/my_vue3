import {getCurrentInstance} from './component';


export function provide(key,value){
    const currentInstance = getCurrentInstance();
    if(currentInstance){
        let { provides } = currentInstance;

        const parentProvides = currentInstance?.parent?.provides;

        if(parentProvides === provides){
            // 如果父级和本地对象一样，表示是直接赋值，没有继承新的。
            // Object.create单向继承父级
            provides = currentInstance.provides = Object.create(parentProvides);
        }

        provides[key] = value;
    }
}


export function inject<t = any>(key,defaultValue?: t){
    const currentInstance = getCurrentInstance();
    if(currentInstance){
        const provides = currentInstance?.parent?.provides;
        if(key in provides){
            return provides[key];
        }else if(defaultValue){
            return typeof defaultValue === 'function'?  defaultValue(): defaultValue
        }
    }
}