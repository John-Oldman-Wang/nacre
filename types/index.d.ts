// @nacre/types —— Nacre 运行时的类型定义。
//
// 这是一份**纯类型**包，没有任何运行时代码：Nacre 的 API 由运行时注入到
// globalThis，这里只是把它们声明出来，让编辑器知道有什么。
//
// 现在只有 iOS，所以入口把两份都引上。等 Android 来了再决定按平台怎么分
// 导出——那时才有真实需求，现在定形状多半会定歪。

/// <reference path="./nacre.d.ts" />
/// <reference path="./ios.d.ts" />
