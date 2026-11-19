---
type: reference
native: UIBarItem.enabled
---

# `UIBarItem`：`isEnabled` 属性

**`isEnabled`** 属性决定导航条按钮或标签能不能点。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 可以点 |
| `false` | 变灰，点了没有反应 |

- 可读，可写。
- 默认值是 `true`。
- 写入非布尔值时按 `Boolean(v)` 转换。
- 「变灰」和「点了没有反应」**未在模拟器验证**。
- 变化时不派发事件：它只会被代码改变。

## 示例

```js
const submit = new UIBarButtonItem({ title: '提交' });
submit.isEnabled = false;
console.log(submit.isEnabled);
```

**结果**：控制台输出 `false`。放到导航条上的「提交」是灰的，点了没有反应；设回 `true` 恢复。表单没填完时禁用提交按钮，用的就是这个属性。

## 对应的 iOS API

`UIBarItem.enabled`。JS 里叫 `isEnabled`。

## 参见

- [`isHidden`](../ui-bar-button-item/ishidden.md)：暂时不显示
