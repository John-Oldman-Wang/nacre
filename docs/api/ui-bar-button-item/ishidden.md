---
type: reference
native: UIBarButtonItem.hidden
---

# `UIBarButtonItem`：`isHidden` 属性

**`isHidden`** 属性决定导航条按钮暂时不显示。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 按钮从导航条上消失，但仍然在按钮数组里 |
| `false` | 显示 |

- 可读，可写。
- 默认值是 `false`。
- 写入非布尔值时按 `Boolean(v)` 转换。
- 在屏幕上的效果**未在模拟器验证**。
- 变化时不派发事件：它只会被代码改变。

## 示例

```js
const page = new UIViewController();
const submit = new UIBarButtonItem({ title: '提交' });
page.navigationItem.rightBarButtonItems = [submit];

submit.isHidden = true;
console.log(page.navigationItem.rightBarButtonItems.length);
```

**结果**：按钮从导航条上消失，控制台输出 `1`：它仍然在 `rightBarButtonItems` 里。消失的效果**未在模拟器验证**。

## 对应的 iOS API

`UIBarButtonItem.hidden`。JS 里叫 `isHidden`。

## 参见

- [`isEnabled`](../ui-bar-item/isenabled.md)：显示但不能点
