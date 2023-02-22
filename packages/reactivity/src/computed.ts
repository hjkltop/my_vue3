import {createDep, Dep} from "./dep";
import {ReactiveEffect} from "./effect";
import {trackRefValue, triggerRefValue} from "./ref";


export class ComputedRefImpl{
    public dep:Dep;
    public effect:ReactiveEffect;

    private _changed:boolean; // 是否修改
    private _value: any;

    constructor(getter) {
        this._changed = true;

        this.dep = createDep();
        this.effect = new ReactiveEffect(getter, ()=>{
            if(this._changed)return;
            this._changed = true;
            triggerRefValue(this);
        })
    }

    get value(){
        trackRefValue(this);
        // 在修改后才执行重新获取数据
        if(this._changed){
            this._changed =false;
            this._value = this.effect.run();
        }
        return this._value;
    }

}


export function computed(getter){
    return new ComputedRefImpl(getter);
}