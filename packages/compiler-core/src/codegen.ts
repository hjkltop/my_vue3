import {isString} from '@my-vue/shared'
import {NodeTypes} from "./ast";

import {CREATE_ELEMENT_VNODE,helperNameMap,TO_DISPLAY_STRING} from "./runtimeHelpers";

export function generate(ast,options={}){
    const context = createCodegenContext(ast,options);

    const {push,mode}  = context;

    if(mode === "module"){
        genModulePreamble(ast,context)
    }else{
        genFunctionPreamble(ast , context);
    }

    const functionName = 'render';

    const args = ['_ctx'];

    const signature = args.join(", ");

    push(`function ${functionName}(${signature}) {`)

    push("return ");

    genNode(ast.codegenNode,context);

    push("}");
    return {
        code: context.code
    }
}

function genModulePreamble(ast:any ,context:any){
    const {runtimeModuleName,push,newline} = context;
    const aliasHelper = (s) => `${helperNameMap[s]} : _${helperNameMap[s]}`;

    if (ast.helpers.length) {
        // 比如 ast.helpers 里面有个 [toDisplayString]
        // 那么生成之后就是 import { toDisplayString as _toDisplayString } from "vue"
        const code = `import {${ast.helpers
            .map((s) => `${helperNameMap[s]} as _${helperNameMap[s]}`)
            .join(", ")} } from ${JSON.stringify(runtimeModuleName)}`;

        push(code);
    }
    newline();
    push (`return `);
}

function genFunctionPreamble(ast:any,context:any){
    const {runtimeGlobalName,push,newline} = context;

    const VueBinging = runtimeGlobalName;

    const aliasHelper = (s) => `${helperNameMap[s]} : _${helperNameMap[s]}`;

    if(ast.helpers.length> 0){
        push(`
            const { ${ast.helpers.map(aliasHelper).join(", ")}} = ${VueBinging}
        `)
    }

    newline();
    push (`return `);
}


function createCodegenContext(ast:any ,   { runtimeModuleName = "vue", runtimeGlobalName = "Vue", mode = "function" }){
    const context= {
        code: "",
        mode,
        runtimeModuleName,
        runtimeGlobalName,
        helper(key) {
            return `_${helperNameMap[key]}`
        },
        push(code){
            context.code += code;
        },
        newline(){
            context.code += "\n";
        }
    }

    return context;
}


function genNode(node:any,context:any) {

    switch (node.type) {
        case NodeTypes.INTERPOLATION:
            genInterpolation(node, context);
            break;
        case NodeTypes.SIMPLE_EXPRESSION:
            genExpression(node, context);
            break;

        case NodeTypes.ELEMENT:
            genElement(node, context);
            break;

        case NodeTypes.COMPOUND_EXPRESSION:
            genCompoundExpression(node, context);
            break;

        case NodeTypes.TEXT:
            genText(node, context);
            break;

        default:
            break;
    }

}
function genExpression(node: any, context: any) {
    context.push(node.content, node);
}

function genInterpolation(node: any, context: any) {
    const { push, helper } = context;
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(")");
}

function genElement(node, context) {
    const { push, helper } = context;
    const { tag, props, children } = node;

    push(`${helper(CREATE_ELEMENT_VNODE)}(`);

    genNodeList(genNullableArgs([tag, props, children]), context);

    push(`)`);
}

function genNodeList(nodes: any, context: any) {
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (isString(node)) {
            push(`${node}`);
        } else {
            genNode(node, context);
        }
        // node 和 node 之间需要加上 逗号(,)
        // 但是最后一个不需要 "div", [props], [children]
        if (i < nodes.length - 1) {
            push(", ");
        }
    }
}

function genNullableArgs(args) {
    // 把末尾为null 的都删除掉
    // vue3源码中，后面可能会包含 patchFlag、dynamicProps 等编译优化的信息
    // 而这些信息有可能是不存在的，所以在这边的时候需要删除掉
    let i = args.length;
    // 这里 i-- 用的还是特别的巧妙的
    // 当为0 的时候自然就退出循环了
    while (i--) {
        if (args[i] != null) break;
    }

    // 把为 falsy 的值都替换成 "null"
    return args.slice(0, i + 1).map((arg) => arg || "null");
}


function genCompoundExpression(node: any, context: any) {
    const { push } = context;
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (isString(child)) {
            push(child);
        } else {
            genNode(child, context);
        }
    }
}

function genText(node: any, context: any) {
    // Implement
    const { push } = context;

    push(`'${node.content}'`);
}
