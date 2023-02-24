import {ShapeFlags} from "@my-vue/shared";
import {createComponentInstance,setupComponent} from "./component";
import {queueJob} from "./scheduler";
import {effect} from "@my-vue/reactivity";
import {Fragment,normalizeVNode,Text } from "./vnode";
import{shouldUpdateComponent} from "./componentRenderUtils";
import {createAppAPI} from "./createApp";


export function createRenderer(options){
    const {
        createElement: hostCreateElement,
        setElementText: hostSetElementText,
        patchProps: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setText: hostSetText,
        createText: hostCreateText
    } = options;

    const render = (vnode,container)=>{
        console.log('my-vue3: call path vnode');
        patch(null,vnode,container);
    }

    function patch(n1,n2,container= null, anchor=null,parentComponent=null){
        const {type ,shapeFlag} = n2;
        switch (type){
            case Text:
                processText(n1,n2,container);
                break;
        }
    }

    /**
     * 处理Text节点
     * @param n1
     * @param n2
     * @param container
     */
    function processText(n1,n2,container){
        if(n1 === null){
            hostInsert((n2.el = hostCreateText(n2.children as string)), container)
        }else{
            // !非空断言
            const el = (n2.el = n1.el!);
            if(n2.children !== n1.children){
                hostSetText(el,n2.children as string)
            }
        }
    }

    function processElement(n1,n2,container,anchor,parentComponent){
        if(!n1){
            mountElement(n2,container,anchor);
        }else{
            // TODO：
            updateElement(n1,n2,container,anchor,parentComponent)
        }
    }

    /**
     * 挂载节点
     * @param vnode
     * @param container
     * @param anchor
     */
    function mountElement(vnode,container,anchor){
        const {shapeFlag,props} = vnode;
        const el = (vnode.el = hostCreateElement(vnode.type));

        if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
            hostSetElementText(el,vnode.children);
        }else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN){
            mountChildren(vnode.children,el);
        }
        if(props){
            for(const key in props){
                // todo
                // 需要过滤掉vue自身用的key
                // 比如生命周期相关的 key: beforeMount、mounted
                const nextVal = props[key];
                hostPatchProp(el,key,null,nextVal);// props改变更新值
            }
        }

        // todo
        // 触发 beforeMount() 钩子
        console.log("my-vue3: vnodeHook  -> onVnodeBeforeMount");
        console.log("my-vue3: DirectiveHook  -> beforeMount");
        console.log("my-vue3: transition  -> beforeEnter");

        hostInsert(el,container,anchor);

        // todo
        // 触发 mounted() 钩子
        console.log("my-vue3: vnodeHook  -> onVnodeMounted");
        console.log("my-vue3: DirectiveHook  -> mounted");
        console.log("my-vue3: transition  -> enter");

    }

    /**
     * 挂载子组件
     * @param children
     * @param container
     */
    function mountChildren(children,container){
        for(const child of children){
            // todo
            // 这里应该需要处理一下 vnodeChild
            // 因为有可能不是 vnode 类型

            console.log('my-vue3: mountChildren - ',child);
            patch(null,child,container);
        }
    }


    function updateComponent(n1, n2,container){
        console.log('my-vue3: updateComponent - ',n1,n2);

        if(shouldUpdateComponent(n1,))

    }






}