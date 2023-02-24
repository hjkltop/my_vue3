const queue: any[] = [];
const activePreFlushCbs : any = [];

const p = Promise.resolve();

let isFlushPending = false;


/**
 * 等待其他任务完成、执行，不等于dom render执行完成
 * @param fun
 */
export function nextTick(fun?){
    return fun? p.then(fun): p;
}

/**
 * 添加正常队列任务
 * @param job
 */
export function queueJob(job){
    if(!queue.includes(job)){
        queue.push(job);
        queueFlush();
    }
}

/**
 * 添加预先执行任务
 * @param cb
 */
export function queuePreFlushCb(cb){
   queueCb(cb,activePreFlushCbs);
}

/**
 * 添加任务，并通知排队执行
 * @param cb
 * @param activeQueue
 */
function queueCb(cb,activeQueue){
    activeQueue.push(cb);
    queueFlush();
}

/**
 * 等待排队执行
 */
function queueFlush(){
    // 有任务添加都会执行，添加lock，避免flushJobs多次执行,下面已经排了队了
    if(isFlushPending) return;
    isFlushPending = true;
    nextTick(flushJobs); // 排个微任务队列
}

/**
 * 执行普通任务
 */
function flushJobs(){
    isFlushPending = false;
    // 先执行优先执行的任务
    // 对vue框架来说，这里执行时时页面还没被更改
    flushPreFlushCbs();
    let job;
    while((job = queue.shift())){
        if(job){
            job();
        }
    }
}

/**
 * 调度完成后需要第一时间执行的任务
 */
function flushPreFlushCbs(){
    for(const cb  of activePreFlushCbs){
        cb();
    }
}


