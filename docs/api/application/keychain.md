---
type: reference
native: application.keychain
---

# `Application`：`keychain` 属性

**`keychain`** 属性是令牌和密码的加密存储。**它只在装了 `@nacrejs/keychain` 的项目里有。**

## 值

`Keychain`。它的方法全部返回 Promise，用法见 [Keychain](../keychain.md)。

- 只读。给它赋值抛 `TypeError`。
- 没装 `@nacrejs/keychain` 时这个属性不存在：`'keychain' in application` 是 `false`，类型里也没有它。
- 装了之后，入口文件顶上要加一行 `/// <reference types="@nacrejs/keychain" />`，类型里才有它。

## 示例

```js
/// <reference types="@nacrejs/keychain" />
console.log('keychain' in application);
```

**结果**：装了 `@nacrejs/keychain` 的项目输出 `true`，没装的输出 `false`。

## 对应的 iOS API

Keychain 服务（`SecItemAdd`、`SecItemCopyMatching` 一组函数），见 [Keychain](../keychain.md)。

## 参见

- [Keychain](../keychain.md)
- [能力包](../capabilities.md)：装了才有
