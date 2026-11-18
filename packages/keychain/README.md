# `@nacrejs/keychain`

Nacre 的 Keychain 能力：令牌和密码的安全存放。**装了才有 `application.keychain`。**

它是第一个从核心里拆出来的能力，所以也是「一个能力包长什么样」的样板。

```
packages/keychain/
├─ index.d.ts                  类型：Keychain 类，和 application.keychain 的声明合并
├─ nacre-ios.json              清单：这是一个能力包、它的 framework 叫什么
└─ NacreKeychain.xcframework/  预编译的 framework（构建产物，不提交）
```

源码不在这里，在 `ios/Capabilities/Keychain/`——和 `ios/` 对 `packages/ios/` 的关系一样：`ios/` 下是源码，`packages/` 下是交付出去的东西。

## 怎么用

见 [API 文档](../../docs/api/keychain.md)。装上、加一行类型引用，就能用。

## 没装的时候

| | |
| --- | --- |
| 生成的工程 | 不嵌 `NacreKeychain.framework`，产物里没有它 |
| 运行时 | `'keychain' in application` 是 `false`，全局也没有 `Keychain` 这个类 |
| 类型检查 | `application.keychain` 报 `Property 'keychain' does not exist on type 'Application'` |

三处是一致的。没有做成「属性在、读了才抛」——那样类型是绿的，运行时才炸。

## 它为什么不自己引 `@nacrejs/types`

`index.d.ts` 用到的 `NSObject`、`Application` 是 `@nacrejs/types` 声明的全局类型，但这个文件里**没有** `/// <reference types="@nacrejs/types" />`。用 Nacre 的入口文件本来就引了它；而在这里再写一行，TypeScript 会从这个文件的**真实路径**往上找 `node_modules`——包是用 `file:` 或 workspace 链接进来的时候就找不到了（实测报 `TS2688`）。两个包的关系写在 `peerDependencies` 里。

---

← 返回[项目说明](../../docs/project.md) ・ [能力包是怎么搭的](../../docs/internals/capabilities.md)
