---
type: reference
native: PHPickerConfiguration.selectionLimit
---

# `PHPickerConfiguration`：`selectionLimit` 属性

**`selectionLimit`** 属性表示选图界面里最多能选几项。

## 值

数（个数）。

- 可读，可写。
- 默认值是 `1`：点中一项就算选好。
- `0` 是不限。
- 大于 1 时，选满之后其余的项点不动（**未在模拟器验证**）。
- 只有 App 自己能改它，没有变化通知。

### 写错时

- 写小数向零取整：写 `2.9` 得到 `2`。看起来像数的字符串按数转：写 `'3'` 得到 `3`。
- 写负数抛 `TypeError`，值不变：`selectionLimit must not be negative, got -1`。
- 转不成有限的数抛 `TypeError`，值不变：`selectionLimit must be a finite number, got "abc"`。

## 示例

```js
const config = new PHPickerConfiguration();
config.selectionLimit = 9;
config.selection = 'ordered';
```

**效果**：用这份配置建的选图界面最多选 9 张，每张上显示它是第几个选的。屏幕上的效果**未在模拟器验证**。

## 对应的 iOS API

`PHPickerConfiguration.selectionLimit`。

## 参见

- [`selection`](selection.md)：选中的方式
- [从相册选图、把图存进相册](../../guides/pick-photos.md#一次选多张)
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
