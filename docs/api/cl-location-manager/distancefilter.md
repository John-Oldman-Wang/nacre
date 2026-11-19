---
type: reference
native: CLLocationManager.distanceFilter
---

# `CLLocationManager`：`distanceFilter` 属性

**`distanceFilter`** 属性表示连续更新时，设备移动超过多少米才报一次新位置。它只影响 [`startUpdatingLocation()`](startupdatinglocation.md) 之后的连续更新。

## 值

一个不小于 0 的数（米），或者 `'none'`。

| 取值 | 效果 |
| --- | --- |
| 一个数 | 设备移动超过这么多米才派发下一次 `locationupdate` |
| `'none'` | 每次移动都报 |

- 可读，可写。写进去的值读回来不变。
- 默认值是 `'none'`。
- 看起来像数的字符串按数处理：写 `'50'` 读回数 `50`。
- 只有 App 自己能改，所以没有变化通知。
- 设了之后位置报得多少、省多少电**未在模拟器验证**。

### 写错时

写了不认识的名字：不抛异常，控制台输出一条警告，属性保持原来的值。

```
[Nacre] distanceFilter has no value "all"; expected one of: none, ignored
```

写了负数或者转不成有限数的值：抛 `TypeError`，原来的值不变。

| 写法 | 报错信息 |
| --- | --- |
| 负数，`-1` | `distanceFilter must be a non-negative number of meters or one of: none` |
| 转不成有限的数，`NaN`、`undefined` | `distanceFilter must be a finite number, got NaN`。`got` 后面是写入的值 |

这两条报错来自代码，**未在模拟器验证**。

## 示例

```js
const manager = new CLLocationManager();
manager.distanceFilter = 50;
console.log(manager.distanceFilter);
```

**结果**：输出 `50`。连续更新时，设备每移动超过 50 米报一次。

## 对应的 iOS API

`CLLocationManager.distanceFilter`。`kCLDistanceFilterNone` 写成 `'none'`。

## 参见

- [`desiredAccuracy`](desiredaccuracy.md)：希望的精度
- [`locationupdate`](locationupdate-event.md)：位置从这个事件来
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
