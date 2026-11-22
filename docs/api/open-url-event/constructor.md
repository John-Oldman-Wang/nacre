---
type: reference
native: OpenURLEvent()
---

# `OpenURLEvent()` 构造函数

**`OpenURLEvent()`** 构造函数创建一个链接事件对象，用来在测试里模拟一次打开：把它派发到 `application` 上，`openurl` 的监听器就会被调用，系统那边什么都不发生。

## 语法

```
new OpenURLEvent(type, { url, scene, sourceApplication, cancelable })
```

### 参数

**`type`**

事件名，字符串。模拟 `openurl` 时写 `'openurl'`。

**`options.url`**

地址，字符串，必填。

**`options.scene`**

[`UIWindowScene`](../ui-window-scene.md)，必填。

**`options.sourceApplication`**

来源 App 的包名，字符串或 `null`，可选。不传是 `null`。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `OpenURLEvent`。

### 异常

**`TypeError`**

- 某个字段的值转换不了，见上面各个参数。
- 没传事件名：`Failed to construct 'OpenURLEvent': 1 argument required, but only 0 present.`
- 不带 `new`，当成函数调用。
- 没传 `url`：`Failed to construct 'OpenURLEvent': url is required`。
- `scene` 没传或者不是场景：`Failed to construct 'OpenURLEvent': scene must be a UIWindowScene`。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  application.dispatchEvent(new OpenURLEvent('openurl', {
    url: 'myapp://orders/42',
    scene: e.scene,
  }));
});
```

**效果**：`openurl` 的监听器被调用一次，`e.url` 是 `'myapp://orders/42'`，`e.sourceApplication` 是 `null`。系统那边什么都不发生。

## 对应的 iOS API

没有对应的系统 API。

## 参见

- [`openurl`](../application/openurl-event.md)
