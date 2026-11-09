// console 的分发、未处理拒绝的上报时机、globalThis 的全部属性。
//
// 这一段在脚本顶层执行，所以作为副作用导入——执行顺序就是
// src/main.js 里的 import 顺序。

console.log('hello world');

// —— 以下是第 0 步的临时验收用例，验证通过后删除，只保留上面一行 ——
// 每行后面的注释是预期输出。

// 审阅问题 2：console 按类型分发，并且永不向 JS 抛异常
console.log(undefined, null, true, false);        // undefined null true false
console.log(0, -0, 1.5, NaN, Infinity, -1e21);    // 0 -0 1.5 NaN Infinity -1e+21
console.log(42n);                                 // 42n
console.log('裸字符串不加引号');                     // 裸字符串不加引号
console.log(Symbol('x'), Symbol());               // Symbol(x) Symbol()
console.log(function foo() {}, () => {});         // [Function: foo] [Function (anonymous)]
console.log([1, 'two', null]);                    // [1,"two",null]
console.log({ a: 1 });                            // {"a":1}
console.log(new Error('一个错误'));                 // Error: 一个错误 加调用栈

// 对象有 toString 也走 JSON.stringify（函数属性被跳过），toString 根本不会被调用
console.log({ toString() { throw new Error('boom'); } });   // {}

// getter 抛异常：JSON.stringify 失败，兜底到 Object.prototype.toString
console.log({ get a() { throw new Error('boom'); } });      // [object Object]

// 循环引用：JSON.stringify 失败，同样兜底
const circular = {};
circular.self = circular;
console.log(circular);                                      // [object Object]

// 兜底的字符串转换本身也抛异常：循环引用 + toString 抛异常。
// v8::String::Utf8Value 的构造函数内部自带 TryCatch，异常在那里就被吞掉了，
// 我们拿到的是空指针，所以打 <unprintable> 而不是 <throws on toString>。
const hostile = { toString() { throw new Error('boom'); } };
// @ts-expect-error 对象字面量上加属性
hostile.self = hostile;
console.log(hostile);                                       // <unprintable>

console.log('console 用例执行完毕，说明前面一条都没有抛异常');

// 审阅问题 3：未处理的拒绝要报出来，已处理的不报
Promise.reject(new Error('这条应该被报告为未处理的拒绝'));
Promise.reject(new Error('这条不应该被报告')).catch(() => {
  console.log('已处理的拒绝：catch 正常执行');
});

// 内置属性都是 non-enumerable，Object.keys 看不见，要用 getOwnPropertyNames。
// 这份清单是 types/ 里 lib 配置的依据：运行时实际有什么，类型定义就声明什么。
// 未处理拒绝的结算排在宿主队列尾部（对齐 Chromium），所以 setTimeout 里
// 补上的 handler 来得及抑制上报。日志里不该出现这条。
//
// 这条用例特意放在顶层而不是和 fetch 混在一起：延后结算只保证「晚于当前
// 已排队的任务」，并发网络请求的回调会插进来，那时就成了竞态。
const lateRejection = Promise.reject(new Error('这条不该被上报：handler 在 timer 里补上'));
setTimeout(() => lateRejection.catch(() => {}), 0);

console.log('globalThis 的全部属性 =',
            Object.getOwnPropertyNames(globalThis).sort().join(' '));
console.log('这些不存在 =',
            ['setTimeout', 'setInterval', 'queueMicrotask', 'Intl', 'fetch', 'URL',
             'TextEncoder', 'structuredClone', 'WebAssembly', 'SharedArrayBuffer']
              .filter(n => !(n in globalThis)).join(' '));
