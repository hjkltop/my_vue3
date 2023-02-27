import {ElementTypes,NodeTypes} from "./ast";

const enum TagType {
    Start,
    End
}


export function baseParse(content:string){
    const context = createParserContext(content);
    return createRoot(parseChildren(context,[]));
}



function createParserContext(content){
    console.log('@my-vue 模版编译: createParserContext');
    return {
        source: content
    }
}

function parseChildren(context,ancestors){
    console.log('@my-vue 模版编译: 解析 children');

    const nodes:any = [];

    while(!isEnd(context,ancestors)){
        let node ;
        const s = context.source;
        if(startsWith(s, '{{')){ // 变量
            node = parseInterpolation(context);
        }else if (s[0] === "<"){ // 标签
            if(s[1] === '/'){
                if(/[a-z]/i.test(s[2])){
                    parseTag(context,TagType.End);
                    continue;
                }
            } else if (/[a-z]/i.test(s[1])){
                node = parseElement(context,ancestors);
            }
        }
        if(!node) {
            node =parseText(context);
        }

        nodes.push(node);
    }

    return nodes;
}


function parseInterpolation(context: any){
    const openDelimiter = "{{";
    const closeDelimiter = "}}";

    // TODO: closeIndex 可能-1
    const closeIndex = context.source.indexOf(closeDelimiter,openDelimiter.length);

    advanceBy(context,2);

    const rawContentLength = closeIndex - openDelimiter.length;
    const rawContext = context.source.slice(0,rawContentLength);

    const preTrimContext = parseTextData(context,rawContext.length);
    const content = preTrimContext.trim();

    advanceBy(context,closeDelimiter.length);

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content
        }
    }
}

function parseElement(context,ancestors){
    const element = parseTag(context,TagType.Start);

    ancestors.push(element);

    const children = parseChildren(context,ancestors);
    ancestors.pop();

    if(startsWithEndTagOpen(context.source,element.tag)){
        parseTag(context,TagType.End);
    }else{
        throw new Error(`@my-vue: 缺少结束标签 ${element.tag}`);
    }

    element.children = children;
    return element;
}

function parseText(context):any{
    console.log('@my-vue 模版编译: 解析text',context);
    const endTokens = ["<","{{"];
    let endIndex = context.source.length;

    for(let i=0;i< endTokens.length;i++){
        const index = context.source.indexOf(endTokens[i]);

        if(index !== -1 && endIndex> index){
            endIndex = index;
        }
    }

    const content = parseTextData(context,endIndex);

    return {
        type:NodeTypes.TEXT,
        content
    }
}

function parseTextData(context:any, length:number):any{
    console.log('@my-vue 模版编译: 解析textData');

    const rawText = context.source.slice(0,length);

    advanceBy(context,length);

    return rawText;
}

function parseTag(context:any, type:TagType): any{
    const match: any = /^<\/?([a-z][^\r\n\t\f />]*)/i.exec(context.source); // 匹配<xxx>标签中的标签名
    const tag = match[1];

    advanceBy(context, match[0].length);

    advanceBy(context,1); // 删除最后一个>

    if(type === TagType.End) return;

    let tagType = ElementTypes.ELEMENT;

    return {
        type: NodeTypes.ELEMENT,
        tag,
        tagType
    }
}

/**
 * 删除指定length的源码
 * @param context
 * @param numberOfCharacters
 */
function advanceBy(context,numberOfCharacters){
    console.log('@my-vue 模版编译: 推进代码', context,numberOfCharacters);

    context.source = context.source.slice(numberOfCharacters);

}

function isEnd(context:any ,ancestors){
    // 检测标签的节点
    // 如果是结束标签的话，需要看看之前有没有开始标签，如果有的话，那么也应该结束
    // 这里的一个 edge case 是 <div><span></div>
    // 像这种情况下，其实就应该报错
    const s = context.source;
    if(context.source.startsWith('</')){
        for(let i = ancestors.length - 1; i>=0;--i){
            if(startsWithEndTagOpen(s,ancestors[i].tag)){
                return true;
            }
        }
    }

    return !context.source;
}

function startsWithEndTagOpen(source:string, tag:string){
    return (
        startsWith(source,"</") &&
            source.slice(2,2+tag.length).toLowerCase() === tag.toLowerCase()
        )
}
function startsWith(source: string, searchString: string): boolean {
    return source.startsWith(searchString);
}


function createRoot(children){
    return {
        type:NodeTypes.ROOT,
        children,
        helpers:[]
    }
}