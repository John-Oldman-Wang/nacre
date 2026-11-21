---
type: reference
native: CALayer.doubleSided
---

# `CALayer`：`isDoubleSided` 属性

**`isDoubleSided`** 属性决定图层被 [`transform`](transform.md) 转到背面朝着看的人时，还画不画。

## 值

布尔。

- 可读，可写。
- 默认值是 `true`。
- `true`：转到背面时照常画，看到的是图层内容左右或上下翻过来的样子。
- `false`：转到背面时不画。正面朝着看的人时照常画。
- 写入的值按真假值转换，`'false'` 也是 `true`。
- 两种取值在屏幕上的效果**未在模拟器验证**。

只在图层绕 x 轴或 y 轴转过 90° 以上时有区别。做一张两面的卡片时，正面和背面各是一个图层，背面那个先转 180°，两个都设成 `false`：同一时刻只有朝着看的人的那一面被画出来。

## 示例

```js
const front = new CALayer();
front.frame = new CGRect(60, 160, 200, 120);
front.backgroundColor = 'systemBlue';
front.isDoubleSided = false;

const back = new CALayer();
back.frame = new CGRect(60, 160, 200, 120);
back.backgroundColor = 'systemOrange';
back.isDoubleSided = false;
back.transform = CATransform3D.rotation(Math.PI, 0, 1, 0);

console.log(front.isDoubleSided, back.isDoubleSided);
```

**效果**

- 控制台输出 `false false`。
- 两个图层加到同一个父图层下面后，只看得到蓝色的正面；把两个图层再一起绕 y 轴转 180°，就只看得到橙色的背面。**屏幕上的样子未在模拟器验证。**

## 对应的 iOS API

`CALayer.doubleSided`（ObjC 的取值方法是 `isDoubleSided`）。

## 参见

- [`transform`](transform.md)
- [`CATransform3D.rotation()`](../ca-transform-3d/rotation.md)
