import {ShapeFlags} from "@my-vue/shared";
/**
 * 初始化slots
 * @param instance
 * @param children
 */
export function initSlots (instance, children){
    const {vnode} = instance;

    if(vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN){
        normalizeObjectSlots(children, (instance.slots = {}));
    }

}

/**
 * 标准化slot render结果
 * @param value
 */
const normalizeSlotValue = (value)=>{
    return Array.isArray(value)? value : [value];
}

/**
 * 包装slots，并标准化执行结果
 * @param rawSlots
 * @param slots
 */
const normalizeObjectSlots = (rawSlots, slots)=>{
    for(const key in rawSlots){
        const value = rawSlots[key];
        if(typeof value === 'function'){
            slots[key] = (props)=> normalizeSlotValue(value[props])
        }
    }
}