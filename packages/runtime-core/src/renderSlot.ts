import {createVNode,Fragment} from './vnode';


export function renderSlot(slots, name, props = {}) {
    const slot = slots[name];
    if(slot){
        const slotContext = slot(props);
        return createVNode(Fragment, {}, slotContext)
    }

}