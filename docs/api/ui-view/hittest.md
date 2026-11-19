---
type: reference
native: "-[UIView hitTest:withEvent:]"
---

# `UIView`：`hitTest()` 方法

**`hitTest()`** 方法找出 `point` 这个位置上最上层的、能接收触摸的视图。查找范围是调用者自己和它的所有后代。

## 语法

```
hitTest(point)
```

### 参数

**`point`**

[`CGPoint`](../cg-point.md) 或 `{ x, y }`，在调用者的坐标系里，单位 [pt](../units.md)。

### 返回值

命中的 `UIView`；没有命中返回 `null`。

点落在调用者自己上、但不在任何子视图上时，返回调用者自己（实测）。

### 异常

**`TypeError`**

`point` 不是对象或缺字段，规则和[结构体](../structs.md#写入时可以给普通对象)相同，报错以 `hitTest` 开头。

## 说明

- 按 iOS 的规则，隐藏的视图、`isUserInteractionEnabled` 为 `false` 的视图、`alpha` 低于 0.01 的视图不会被命中。**未在模拟器验证。**
- 调用它不产生任何事件，也不改变视图。

## 示例

```js
const page = new UIView();
page.frame = new CGRect(0, 0, 390, 844);
const card = new UIView();
card.frame = new CGRect(40, 120, 200, 120);
page.addSubview(card);

const hit = page.hitTest(new CGPoint(50, 130));
if (hit) {
  console.log(hit === card);
}
```

**结果**：`(50, 130)` 在 `card` 内，输出 `true`。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView hitTest:withEvent:]`。ObjC 的第二个参数 `withEvent:` 在这里没有，写成 `view.hitTest(p)`。

## 参见

- [`isUserInteractionEnabled`](isuserinteractionenabled.md)
