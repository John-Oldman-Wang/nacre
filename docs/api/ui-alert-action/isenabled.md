---
type: reference
native: UIAlertAction.enabled
---

# `UIAlertAction`：`isEnabled` 属性

**`isEnabled`** 属性决定弹窗按钮能不能点。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 可以点 |
| `false` | 按钮是灰色的，点不动。点它弹窗不关，也不派发 `click`。**未在模拟器验证** |

- 可读，可写。
- 默认值是 `true`。
- 写入非布尔值时按 `Boolean(v)` 转换。
- 弹窗已经在屏幕上时改它也生效。
- 变化时不派发事件：它只有 App 自己能改。

## 示例

```js
const alert = UIAlertController.alertControllerWithTitle('给相册起个名字', {
  preferredStyle: 'alert',
});
const field = alert.addTextField();
const save = UIAlertAction.actionWithTitle('保存', { style: 'default' });
alert.addAction(save);

save.isEnabled = false;
field.addEventListener('input', () => {
  save.isEnabled = field.text.length > 0;
});
```

**效果**（**未在模拟器验证**）：弹出后「保存」是灰色的，点不动。输入框里有了字，「保存」变成可以点的；把字删光，它又变灰。

## 对应的 iOS API

`UIAlertAction.enabled`。JS 里叫 `isEnabled`。

## 参见

- [`click`](click-event.md)
