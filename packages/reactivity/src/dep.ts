import {ReactiveEffect} from "./effect";

export function createDep (effects?:ReactiveEffect[]){
    return new Set(effects);
}

export type Dep = Set<ReactiveEffect>