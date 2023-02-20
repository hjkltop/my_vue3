export * from './shapeFlags';
export * from './type';
export * from './object'


/**
 * @description: 驼峰化
 * @param str
 */
export const camelize = (str: string): string => {
    return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''));
}


/**
 * @description: 判断指令是否以on开头
 * @param key
 */
export const  isOn = (key) => /^on[A-Z]/.test(key);

/**
 * @description: 判断值是否修改
 * @param value
 * @param oldValue
 */
export function hasChanged(value, oldValue) {
    return !Object.is(value, oldValue);
}

/**
 * @description: 判断对象是否有指定属性
 * @param val
 * @param key
 */
export function hasOwn(val,key){
    return Object.prototype.hasOwnProperty.call(val,key)
}

/**
 * @description: 首字母大写
 * @param str
 */
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);


/**
 * @description: 正则驼峰，首字母加-
 * @param str
 */
export const hyphenate = (str: string) => str.replace(/\B([A-Z])/g, '-$1').toLowerCase();