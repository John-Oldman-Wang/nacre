---
type: reference
native: UIApplicationDidReceiveMemoryWarningNotification
---

# `Application`：`memorywarning` 事件

**`memorywarning`** 事件在设备内存不足时派发。

## 语法

```
application.addEventListener('memorywarning', (event) => { })
```

## 事件对象

`Event`。`target` 是 `application`，不能取消，`cancelable` 是 `false`（实测）。

## 什么时候派发

- 设备内存不足时，系统先通知各个 App 释放内存，这时派发。
- 在模拟器里触发：设备菜单里选 Simulate Memory Warning（实测）。
- 回调稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。

App 在这时应当丢掉可以重新得到的数据：缓存的图片、已经解析好但还能再解析的数据、不在屏幕上的页面。运行时自己不会因为内存警告丢掉 JS 里的任何数据，释放什么由 App 的代码决定。不处理这个事件不会报错。内存仍然不足时系统会结束 App，结束时没有通知。**「不释放就会被结束」来自 iOS 的定义，未在模拟器验证。**

## 示例

```js
/** @type {Map<string, string>} */
const cache = new Map();

application.addEventListener('memorywarning', () => {
  cache.clear();
  console.log('缓存已清空');
});
```

**效果**：系统发出内存警告时，控制台输出 `缓存已清空`。

## 对应的 iOS API

`UIApplicationDidReceiveMemoryWarningNotification`。

## 参见

- [处理 App 的生命周期](../../guides/app-lifecycle.md#收到内存警告时释放缓存)
