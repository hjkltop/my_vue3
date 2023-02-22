import {camelize,hyphenate,toHandlerKey} from "@my-vue/shared";

export function emit(instance, event:string,...rawArgs: any[]){
    const props = instance.props;

    let handler = props[toHandlerKey(camelize(event))];

    if(!handler){
        handler = props[toHandlerKey(hyphenate(event))]
    }

    if(handler) handler(...rawArgs);
}