export function initProps(instace,rawProps){

    console.log('my-vue: 初始化initProps');

    // TODO: 对组件定义的props进行omit，其他属性放入attrs,渲染时加入dom
    instace.props = rawProps;
}