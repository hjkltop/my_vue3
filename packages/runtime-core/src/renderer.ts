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
            case Fragment:
                processFragment(n1, n2, container);
                break;
            default:
                // 这里就基于 shapeFlag 来处理
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    console.log("处理 element");
                    processElement(n1, n2, container, anchor, parentComponent);
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    console.log("处理 component");
                    processComponent(n1, n2, container, parentComponent);
                }
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


    function processFragment(n1: any, n2: any, container: any) {
        // 只需要渲染 children ，然后给添加到 container 内
        if (!n1) {
            // 初始化 Fragment 逻辑点
            console.log("初始化 Fragment 类型的节点");
            mountChildren(n2.children, container);
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
     * 更新节点
     * @param n1
     * @param n2
     * @param container
     * @param anchor
     * @param parentComponent
     */
    function updateElement(n1,n2,container,anchor,parentComponent){
        const oldProps = (n1&& n1.props) || {};

        const newProps = n2.props || {};

        const el = (n2.el = n1.el!);

        patchProps(el,oldProps,newProps);

        patchChildren(n1,n2,el,anchor,parentComponent);
    }

    /**
     * 更新props
     * @param el
     * @param oldProps
     * @param newProps
     */
    function patchProps(el,oldProps,newProps){
        for(const key in newProps){
            const prevProp = oldProps[key];
            const nextProp = newProps[key];
            if(prevProp !== nextProp){
                hostPatchProp(el,key,prevProp,nextProp);
            }
        }
        for(const key in oldProps){
            const prevProp = oldProps[key];
            const nextProp = null;
            if(!(key in newProps)){
                hostPatchProp(el,key,prevProp,nextProp);
            }
        }
    }

    /**
     * 更新子节点
     * @param n1
     * @param n2
     * @param container
     * @param anchor
     * @param parentComponent
     */
    function patchChildren(n1,n2,container,anchor,parentComponent){
        const {shapeFlag : prevShapeFlag ,children:c1} = n1;

        const {shapeFlag, children:c2} = n2;

        if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
            if(c2 !== c1){
                hostSetElementText(container,c2);
            }
        }else{
            if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN){
                hostSetElementText(container,'');
                mountChildren(c2,container);
            }else{
                // TODO: 为什么parentComponent,anchor
                patchKeyedChildren(c1,c2,container,parentComponent,anchor);
            }
        }
    }


    function patchKeyedChildren(
        c1: any[],
        c2: any[],
        container,
        parentAnchor,
        parentComponent
    ) {
        let i = 0;
        const l2 = c2.length;
        let e1 = c1.length - 1;
        let e2 = l2 - 1;

        const isSameVNodeType = (n1, n2) => {
            return n1.type === n2.type && n1.key === n2.key;
        };

        while (i <= e1 && i <= e2) {
            const prevChild = c1[i];
            const nextChild = c2[i];

            if (!isSameVNodeType(prevChild, nextChild)) {
                console.log("两个 child 不相等(从左往右比对)");
                console.log(`prevChild:${prevChild}`);
                console.log(`nextChild:${nextChild}`);
                break;
            }

            console.log("两个 child 相等，接下来对比这两个 child 节点(从左往右比对)");
            patch(prevChild, nextChild, container, parentAnchor, parentComponent);
            i++;
        }

        while (i <= e1 && i <= e2) {
            // 从右向左取值
            const prevChild = c1[e1];
            const nextChild = c2[e2];

            if (!isSameVNodeType(prevChild, nextChild)) {
                console.log("两个 child 不相等(从右往左比对)");
                console.log(`prevChild:${prevChild}`);
                console.log(`nextChild:${nextChild}`);
                break;
            }
            console.log("两个 child 相等，接下来对比这两个 child 节点(从右往左比对)");
            patch(prevChild, nextChild, container, parentAnchor, parentComponent);
            e1--;
            e2--;
        }

        if (i > e1 && i <= e2) {
            // 如果是这种情况的话就说明 e2 也就是新节点的数量大于旧节点的数量
            // 也就是说新增了 vnode
            // 应该循环 c2
            // 锚点的计算：新的节点有可能需要添加到尾部，也可能添加到头部，所以需要指定添加的问题
            // 要添加的位置是当前的位置(e2 开始)+1
            // 因为对于往左侧添加的话，应该获取到 c2 的第一个元素
            // 所以我们需要从 e2 + 1 取到锚点的位置
            const nextPos = e2 + 1;
            const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
            while (i <= e2) {
                console.log(`需要新创建一个 vnode: ${c2[i].key}`);
                patch(null, c2[i], container, anchor, parentComponent);
                i++;
            }
        } else if (i > e2 && i <= e1) {
            // 这种情况的话说明新节点的数量是小于旧节点的数量的
            // 那么我们就需要把多余的
            while (i <= e1) {
                console.log(`需要删除当前的 vnode: ${c1[i].key}`);
                hostRemove(c1[i].el);
                i++;
            }
        } else {
            // 左右两边都比对完了，然后剩下的就是中间部位顺序变动的
            // 例如下面的情况
            // a,b,[c,d,e],f,g
            // a,b,[e,c,d],f,g

            let s1 = i;
            let s2 = i;
            const keyToNewIndexMap = new Map();
            let moved = false;
            let maxNewIndexSoFar = 0;
            // 先把 key 和 newIndex 绑定好，方便后续基于 key 找到 newIndex
            // 时间复杂度是 O(1)
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }

            // 需要处理新节点的数量
            const toBePatched = e2 - s2 + 1;
            let patched = 0;
            // 初始化 从新的index映射为老的index
            // 创建数组的时候给定数组的长度，这个是性能最快的写法
            const newIndexToOldIndexMap = new Array(toBePatched);
            // 初始化为 0 , 后面处理的时候 如果发现是 0 的话，那么就说明新值在老的里面不存在
            for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;

            // 遍历老节点
            // 1. 需要找出老节点有，而新节点没有的 -> 需要把这个节点删除掉
            // 2. 新老节点都有的，—> 需要 patch
            for (i = s1; i <= e1; i++) {
                const prevChild = c1[i];

                // 优化点
                // 如果老的节点大于新节点的数量的话，那么这里在处理老节点的时候就直接删除即可
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }

                let newIndex;
                if (prevChild.key != null) {
                    // 这里就可以通过key快速的查找了， 看看在新的里面这个节点存在不存在
                    // 时间复杂度O(1)
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                } else {
                    // 如果没key 的话，那么只能是遍历所有的新节点来确定当前节点存在不存在了
                    // 时间复杂度O(n)
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }

                // 因为有可能 nextIndex 的值为0（0也是正常值）
                // 所以需要通过值是不是 undefined 或者 null 来判断
                if (newIndex === undefined) {
                    // 当前节点的key 不存在于 newChildren 中，需要把当前节点给删除掉
                    hostRemove(prevChild.el);
                } else {
                    // 新老节点都存在
                    console.log("新老节点都存在");
                    // 把新节点的索引和老的节点的索引建立映射关系
                    // i + 1 是因为 i 有可能是0 (0 的话会被认为新节点在老的节点中不存在)
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    // 来确定中间的节点是不是需要移动
                    // 新的 newIndex 如果一直是升序的话，那么就说明没有移动
                    // 所以我们可以记录最后一个节点在新的里面的索引，然后看看是不是升序
                    // 不是升序的话，我们就可以确定节点移动过了
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    } else {
                        moved = true;
                    }

                    patch(prevChild, c2[newIndex], container, null, parentComponent);
                    patched++;
                }
            }

            // 利用最长递增子序列来优化移动逻辑
            // 因为元素是升序的话，那么这些元素就是不需要移动的
            // 而我们就可以通过最长递增子序列来获取到升序的列表
            // 在移动的时候我们去对比这个列表，如果对比上的话，就说明当前元素不需要移动
            // 通过 moved 来进行优化，如果没有移动过的话 那么就不需要执行算法
            // getSequence 返回的是 newIndexToOldIndexMap 的索引值
            // 所以后面我们可以直接遍历索引值来处理，也就是直接使用 toBePatched 即可
            const increasingNewIndexSequence = moved
                ? getSequence(newIndexToOldIndexMap)
                : [];
            let j = increasingNewIndexSequence.length - 1;

            // 遍历新节点
            // 1. 需要找出老节点没有，而新节点有的 -> 需要把这个节点创建
            // 2. 最后需要移动一下位置，比如 [c,d,e] -> [e,c,d]

            // 这里倒循环是因为在 insert 的时候，需要保证锚点是处理完的节点（也就是已经确定位置了）
            // 因为 insert 逻辑是使用的 insertBefore()
            for (let i = toBePatched - 1; i >= 0; i--) {
                // 确定当前要处理的节点索引
                const nextIndex = s2 + i;
                const nextChild = c2[nextIndex];
                // 锚点等于当前节点索引+1
                // 也就是当前节点的后面一个节点(又因为是倒遍历，所以锚点是位置确定的节点)
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;

                if (newIndexToOldIndexMap[i] === 0) {
                    // 说明新节点在老的里面不存在
                    // 需要创建
                    patch(null, nextChild, container, anchor, parentComponent);
                } else if (moved) {
                    // 需要移动
                    // 1. j 已经没有了 说明剩下的都需要移动了
                    // 2. 最长子序列里面的值和当前的值匹配不上， 说明当前元素需要移动
                    if (j < 0 || increasingNewIndexSequence[j] !== i) {
                        // 移动的话使用 insert 即可
                        hostInsert(nextChild.el, container, anchor);
                    } else {
                        // 这里就是命中了  index 和 最长递增子序列的值
                        // 所以可以移动指针了
                        j--;
                    }
                }
            }
        }
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
    function processComponent(n1, n2, container, parentComponent) {
        // 如果 n1 没有值的话，那么就是 mount
        if (!n1) {
            // 初始化 component
            mountComponent(n2, container, parentComponent);
        } else {
            updateComponent(n1, n2, container);
        }
    }

    function updateComponent(n1, n2,container){
        console.log('my-vue3: updateComponent - ',n1,n2);


        const instance = (n2.component = n1.component);
        if(shouldUpdateComponent(n1,n2)){
            console.log('my-vue3: updateComponent start - ',instance);

            instance.next = n2;

            // TODO: update中处理next
            instance.update();
        }else{
            n2.component = n1.component;
            n2.el = n1.el;
            instance.vnode = n2;
        }
    }


    function mountComponent(initialVNode, container, parentComponent) {
        // 1. 先创建一个 component instance
        const instance = (initialVNode.component = createComponentInstance(
            initialVNode,
            parentComponent
        ));
        console.log(`创建组件实例:${instance.type.name}`);
        // 2. 给 instance 加工加工
        setupComponent(instance);

        setupRenderEffect(instance, initialVNode, container);
    }

    function setupRenderEffect(instance, initialVNode, container) {
        // 调用 render
        // 应该传入 ctx 也就是 proxy
        // ctx 可以选择暴露给用户的 api
        // 源代码里面是调用的 renderComponentRoot 函数
        // 这里为了简化直接调用 render

        // obj.name  = "111"
        // obj.name = "2222"
        // 从哪里做一些事
        // 收集数据改变之后要做的事 (函数)
        // 依赖收集   effect 函数
        // 触发依赖
        function componentUpdateFn() {
            if (!instance.isMounted) {
                // 组件初始化的时候会执行这里
                // 为什么要在这里调用 render 函数呢
                // 是因为在 effect 内调用 render 才能触发依赖收集
                // 等到后面响应式的值变更后会再次触发这个函数
                console.log(`${instance.type.name}:调用 render,获取 subTree`);
                const proxyToUse = instance.proxy;
                // 可在 render 函数中通过 this 来使用 proxy
                const subTree = (instance.subTree = normalizeVNode(
                    instance.render.call(proxyToUse, proxyToUse)
                ));
                console.log("subTree", subTree);

                // todo
                console.log(`${instance.type.name}:触发 beforeMount hook`);
                console.log(`${instance.type.name}:触发 onVnodeBeforeMount hook`);

                // 这里基于 subTree 再次调用 patch
                // 基于 render 返回的 vnode ，再次进行渲染
                // 这里我把这个行为隐喻成开箱
                // 一个组件就是一个箱子
                // 里面有可能是 element （也就是可以直接渲染的）
                // 也有可能还是 component
                // 这里就是递归的开箱
                // 而 subTree 就是当前的这个箱子（组件）装的东西
                // 箱子（组件）只是个概念，它实际是不需要渲染的
                // 要渲染的是箱子里面的 subTree
                patch(null, subTree, container, null, instance);
                // 把 root element 赋值给 组件的vnode.el ，为后续调用 $el 的时候获取值
                // @ts-ignore
                initialVNode.el = subTree.el;

                console.log(`${instance.type.name}:触发 mounted hook`);
                instance.isMounted = true;
            } else {
                // 响应式的值变更后会从这里执行逻辑
                // 主要就是拿到新的 vnode ，然后和之前的 vnode 进行对比
                console.log(`${instance.type.name}:调用更新逻辑`);
                // 拿到最新的 subTree
                const { next, vnode } = instance;

                // 如果有 next 的话， 说明需要更新组件的数据（props，slots 等）
                // 先更新组件的数据，然后更新完成后，在继续对比当前组件的子元素
                if (next) {
                    // 问题是 next 和 vnode 的区别是什么
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }

                const proxyToUse = instance.proxy;
                const nextTree = normalizeVNode(
                    instance.render.call(proxyToUse, proxyToUse)
                );
                // 替换之前的 subTree
                const prevTree = instance.subTree;
                instance.subTree = nextTree;

                // 触发 beforeUpdated hook
                console.log(`${instance.type.name}:触发 beforeUpdated hook`);
                console.log(`${instance.type.name}:触发 onVnodeBeforeUpdate hook`);

                // 用旧的 vnode 和新的 vnode 交给 patch 来处理
                patch(prevTree, nextTree, prevTree.el, null, instance);

                // 触发 updated hook
                console.log(`${instance.type.name}:触发 updated hook`);
                console.log(`${instance.type.name}:触发 onVnodeUpdated hook`);
            }
        }

        // 在 vue3.2 版本里面是使用的 new ReactiveEffect
        // 至于为什么不直接用 effect ，是因为需要一个 scope  参数来收集所有的 effect
        // 而 effect 这个函数是对外的 api ，是不可以轻易改变参数的，所以会使用  new ReactiveEffect
        // 因为 ReactiveEffect 是内部对象，加一个参数是无所谓的
        // 后面如果要实现 scope 的逻辑的时候 需要改过来
        // 现在就先算了
        instance.update = effect(componentUpdateFn, {
            scheduler: () => {
                // 把 effect 推到微任务的时候在执行
                // queueJob(effect);
                queueJob(instance.update);
            },
        });
    }

    function updateComponentPreRender(instance, nextVNode) {
        // 更新 nextVNode 的组件实例
        // 现在 instance.vnode 是组件实例更新前的
        // 所以之前的 props 就是基于 instance.vnode.props 来获取
        // 接着需要更新 vnode ，方便下一次更新的时候获取到正确的值
        nextVNode.component = instance;
        // TODO 后面更新 props 的时候需要对比
        // const prevProps = instance.vnode.props;
        instance.vnode = nextVNode;
        instance.next = null;

        const { props } = nextVNode;
        console.log("更新组件的 props", props);
        instance.props = props;
        console.log("更新组件的 slots");
        // TODO 更新组件的 slots
        // 需要重置 vnode
    }

    return {
        render,
        createApp: createAppAPI(render),
    };




}



function getSequence(arr: number[]): number[] {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                } else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}
