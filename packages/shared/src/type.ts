export const toDisplayString = (val) => {
    return String(val);
}


export const isObject = (val:unknown) => {
    return val !== null && typeof val === "object";
}

export const isString = (val) =>{
    return typeof  val === 'string';
}