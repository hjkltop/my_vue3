
export const enum ShapeFlags {
    ELEMENT = 1, // element 基础
    STATEFUL_COMPONENT = 1 << 2,  // component 组件
    TEXT_CHILDREN = 1 << 3, // string 普通文本
    ARRAY_CHILDREN = 1 << 4, // children 子节点
    SLOTS_CHILDREN = 1 << 5 // slots 插槽
}