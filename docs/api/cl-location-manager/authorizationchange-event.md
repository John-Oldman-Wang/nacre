---
type: reference
native: "-[CLLocationManagerDelegate locationManagerDidChangeAuthorization:]"
---

# `CLLocationManager`：`authorizationchange` 事件

**`authorizationchange`** 事件在授权状态或者精确与否变了时派发。`manager` 建好之后也派发一次。

## 语法

```
manager.addEventListener('authorizationchange', (event) => { })
```

## 事件对象

`Event`，没有多出的字段。现在的状态从 `manager` 上读：[`authorizationStatus`](authorizationstatus.md) 和 [`accuracyAuthorization`](accuracyauthorization.md)。

事件不能取消。`target` 是这个 `manager`。

## 什么时候派发

- `new CLLocationManager()` 之后，系统主动通知一次当前的状态，不管是什么状态。监听器要在 `new` 的同一段同步代码里加上才收得到这一次；晚一些才加的监听器只收到之后的变化。
- 用户在提示框里做了选择之后。**未在模拟器验证。**
- 用户在系统「设置」里改了授权或者精确与否之后。**未在模拟器验证。**
- 回调在系统通知之后的下一轮执行。

只挂了这个监听器、别的什么都没做的 `manager`，没有变量指向它时会被回收，监听器跟着消失。要一直收这个事件，把 `manager` 存在长期存在的变量里。

## 示例

```js
const manager = new CLLocationManager();
manager.addEventListener('authorizationchange', () => {
  console.log(manager.authorizationStatus, manager.accuracyAuthorization);
});
```

**效果**：建好之后马上输出一行，比如 `notDetermined fullAccuracy`。之后每次变了再输出一行。

## 对应的 iOS API

委托方法 `locationManagerDidChangeAuthorization:`。

## 参见

- [`requestWhenInUseAuthorization()`](requestwheninuseauthorization.md)：向用户申请
- [`manager` 什么时候被回收](../cl-location-manager.md#manager-什么时候被回收)
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
