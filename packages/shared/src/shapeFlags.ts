
export const enum ShapeFlags {
    ELEMENT = 1, // element
    STATEFUL_COMPONENT = 1 << 2,  // component
    TEXT_CHILDREN = 1 << 3, // string
    ARRAY_CHILDREN = 1 << 4, // children
    SLOTS_CHILDREN = 1 << 5 // slots
}