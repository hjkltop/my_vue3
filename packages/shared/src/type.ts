export const toDisplayString = (val) => {
    return String(val);
}


export const isObject = (val:unknown) => {
    return val !== null && typeof val === "object";
}