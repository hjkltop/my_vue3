import {extend} from "@my-vue/shared";



let activeEffect = void 0;
let shouldTrack = false;
const targetMap = new WeakMap();


export class ReactiveEffect{
    private active:boolean = true;
    private deps = [];


}