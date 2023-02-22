import {createVNode} from "./vnode";


export function createAppAPI (render){
    return function createApp(rootComponent){
        const app = {
            _component:rootComponent,
            mount(rootContainer){
                console.log('my-vue: 创建根节点');
                const vnode = createVNode(rootContainer);
                console.log("my-vue: 调用render 渲染vnode");
                render(vnode,rootContainer);
            }
        }
        return app;
    }
}