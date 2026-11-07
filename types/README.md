# `@nacre/types`

Nacre 运行时的 TypeScript 类型定义。

这是一份**纯类型**包，没有任何运行时代码。Nacre 的 API 由运行时注入到 `globalThis`，这里只是把它们声明出来，让编辑器知道有什么、写错了当场标红。

> 还没发布到 npm（`package.json` 里标着 `private`）。现在在仓库里直接引。

## 装上

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "lib": ["ESNext"],        // 不要 DOM：没有 window、document、location
    "types": ["@nacre/types"] // 或者在仓库里直接 include 这个目录
  }
}
```

JS 项目一样能用，把 `allowJs` 和 `checkJs` 打开即可。

## 这个运行时没有什么

新运行时最容易踩的不是「有什么」，是「没有什么」。实测 `globalThis` 之后确认不存在：

| 缺的 | 原因 |
| --- | --- |
| `Intl` | V8 lite 构建不带 ICU |
| `fetch` / `Request` / `Response` | 网络还没做（`URL`、`URLSearchParams`、`Headers` 已经有了） |
| `TextEncoder` / `TextDecoder` / `structuredClone` | WHATWG / HTML 规范的，不是 ECMAScript |
| `WebAssembly` | lite 模式不含 |
| DOM 的一切 | `window`、`document`、`location`、`history` 都没有 |

反过来，ECMAScript 的新特性基本是全的：`Float16Array`、`Iterator` 辅助方法、`DisposableStack`、`SuppressedError` 都在，所以 `lib` 用 `ESNext`。

> `Intl` 有点特殊：TypeScript 的 ES lib 自带它的类型，没办法从 `lib` 里减掉，所以**类型上看着存在、运行时会抛 `ReferenceError`**。要本地化格式化，等 `NSDateFormatter` / `NSNumberFormatter` 暴露出来。

## 两层 API

| | 底层 | 上层 |
| --- | --- | --- |
| 是什么 | 裸暴露的原生符号：`UIView`、`UIColor`、`NSObject` | Nacre 定义的：`application`、`console` |
| 谁定义 | Apple，我们只做无损映射 | 我们自己 |
| 文件 | `ios.d.ts` | `nacre.d.ts` |

底层承诺的是**能力对齐**，不是 API 形状一致：iOS 能做到的事 JS 也要能做到，但怎么表达成 JS 是我们的自由。两条已定的规则：

```ts
// 方法名 = selector 第一段 + options 对象，键名就是 ObjC 的段名原文
view.insertSubview(box, { atIndex: 0 });        // insertSubview:atIndex:
view.convertPoint(p, { toView: other });        // convertPoint:toView:

// 枚举 = 字符串，名字是 ObjC 常量去掉类型前缀、首字母小写
label.textAlignment = 'center';                 // NSTextAlignmentCenter
```

## 结构体是只读的

```ts
view.frame = new CGRect(40, 100, 200, 120);
view.frame.x;          // 40
view.frame.origin.x;   // 40，和 ObjC 的 {CGPoint origin; CGSize size;} 对得上
view.frame.x = 10;     // TypeError
```

ObjC 里 `view.frame.x = 10` 是编译错误（改的是返回的临时副本）。用可写对象表示会让它变成**静默无效**，所以这里写入直接抛。要改就整体赋一个新的。

## 跟着运行时走

这份定义和 `ios/Runtime/Builtin/nacre.js`、`ios/Runtime/NacreRuntime.mm` 是同一套 API 的三个面。靠 `ios/scripts/check-api.sh` 核对三边一致，改动任何一边都要跑一次。

---

← 返回 [项目说明](../docs/project.md)
