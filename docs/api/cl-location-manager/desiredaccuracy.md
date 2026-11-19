---
type: reference
native: CLLocationManager.desiredAccuracy
---

# `CLLocationManager`：`desiredAccuracy` 属性

**`desiredAccuracy`** 属性表示希望位置准到多少米以内。它是希望的精度，不是保证：系统给的位置实际有多准，看每个位置的 [`horizontalAccuracy`](../cl-location/horizontalaccuracy.md)。

## 值

一个不小于 0 的数（米），或者下面三个名字之一：

| 取值 | 效果 |
| --- | --- |
| 一个不小于 0 的数 | 希望误差在这么多米以内。常用 `10`、`100`、`1000`、`3000`。数越大越省电、定位越快 |
| `'best'` | 设备能给的最高精度 |
| `'bestForNavigation'` | 比 `'best'` 更高，为导航准备，耗电最多 |
| `'reduced'` | 只要大概位置，和用户只给了大概位置时得到的一样 |

- 可读，可写。写进去的值读回来不变：写数读回数，写名字读回名字。
- 默认值是 `'best'`。
- 看起来像数的字符串按数处理：写 `'50'` 读回数 `50`。
- 只有 App 自己能改，所以没有变化通知。
- 不同取值的耗电和定位快慢**未在模拟器验证**。

### 写错时

写了不认识的名字：不抛异常，控制台输出一条警告，属性保持原来的值。

```
[Nacre] desiredAccuracy has no value "fast"; expected one of: best / bestForNavigation / reduced, ignored
```

写了负数或者转不成有限数的值：抛 `TypeError`，原来的值不变。

| 写法 | 报错信息 |
| --- | --- |
| 负数，`-1` | `desiredAccuracy must be a non-negative number of meters or one of: best / bestForNavigation / reduced` |
| 转不成有限的数，`NaN`、`undefined` | `desiredAccuracy must be a finite number, got NaN`。`got` 后面是写入的值，写 `undefined` 时是 `got undefined` |

## 示例

```js
const manager = new CLLocationManager();
manager.desiredAccuracy = 100;
console.log(manager.desiredAccuracy);
manager.desiredAccuracy = 'bestForNavigation';
console.log(manager.desiredAccuracy);
```

**结果**：先输出 `100`，再输出 `bestForNavigation`。

## 对应的 iOS API

`CLLocationManager.desiredAccuracy`。

| ObjC | JS |
| --- | --- |
| `kCLLocationAccuracyBest` | `'best'` |
| `kCLLocationAccuracyBestForNavigation` | `'bestForNavigation'` |
| `kCLLocationAccuracyReduced` | `'reduced'` |
| `kCLLocationAccuracyNearestTenMeters`、`HundredMeters`、`Kilometer`、`ThreeKilometers` | `10`、`100`、`1000`、`3000` |

## 参见

- [`distanceFilter`](distancefilter.md)：移动多远才报一次
- [枚举](../enums.md)：名字写错时为什么是警告
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
