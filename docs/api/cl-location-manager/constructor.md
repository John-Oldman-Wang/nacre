---
type: reference
native: "-[CLLocationManager init]"
---

# `CLLocationManager()` 构造函数

**`CLLocationManager()`** 构造函数创建一个定位的入口。通过它申请授权、取位置、接收位置更新。

## 语法

```
new CLLocationManager()
```

### 参数

无。

### 返回值

新建的 `CLLocationManager`。每次 `new` 得到一个新的对象。

建好之后，系统会主动派发一次 [`authorizationchange`](authorizationchange-event.md)，告诉它当前的授权状态。监听器要在 `new CLLocationManager()` 的同一段同步代码里加上才收得到这一次。

### 异常

**`TypeError`**

- 继承它：`class Mine extends CLLocationManager {}` 在 `new Mine()` 时抛，信息以 `Illegal constructor` 开头。原生类不能被继承。

## 说明

- 推荐整个 App 只建一个，存在模块顶层的变量里。
- 正在连续更新、或者有 Promise 还没结算的 `manager` 由运行时保留。其他时候没有变量指向它，它就会被回收，见[`manager` 什么时候被回收](../cl-location-manager.md#manager-什么时候被回收)。

## 示例

```js
const manager = new CLLocationManager();
manager.addEventListener('authorizationchange', () => {
  console.log('现在的授权：' + manager.authorizationStatus);
});
```

**效果**：建好之后很快输出一行，比如 `现在的授权：notDetermined`。之后每次授权变了再输出一行。

## 对应的 iOS API

`[[CLLocationManager alloc] init]`。不用设 `delegate`，结果从 Promise 和事件来。

## 参见

- [`authorizationchange`](authorizationchange-event.md)：建好之后的第一次通知
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
