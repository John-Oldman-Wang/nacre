// iOS 原生符号。按 ObjC 的类名裸暴露在全局，不设命名空间——ObjC 的类名
// 前缀（NS / UI / CA / CL…）已经承担了命名空间的职责，再套一层是双重前缀。
//
// 这一层的承诺是**能力对齐**，不是 API 形状一致：iOS 能做到的事 JS 也要能
// 做到，但怎么表达成 JS 是我们的自由。两条已定的规则：
//
//   方法名 = selector 第一段 + options 对象，键名就是 ObjC 的段名原文
//     insertSubview:atIndex:  →  view.insertSubview(box, { atIndex: 0 })
//
//   枚举 = 字符串，名字是 ObjC 常量去掉类型前缀、首字母小写
//     NSTextAlignmentCenter   →  'center'
//
// 一一对应的依据是 ios/Runtime/Builtin/nacre.js 和 ios/Runtime/NacreRuntime.mm，
// 改动时跑 ios/scripts/check-api.sh 核对。

// 按能力域拆成多份，这里只做入口。拆分规则见 docs/project.md 第 5 节。

/// <reference path="./ios/enums.d.ts" />
/// <reference path="./ios/structs.d.ts" />
/// <reference path="./ios/base.d.ts" />
/// <reference path="./ios/resources.d.ts" />
/// <reference path="./ios/scene.d.ts" />
/// <reference path="./ios/view.d.ts" />
/// <reference path="./ios/layout.d.ts" />
/// <reference path="./ios/layer.d.ts" />
/// <reference path="./ios/control.d.ts" />
/// <reference path="./ios/storage.d.ts" />
/// <reference path="./ios/filesystem.d.ts" />
