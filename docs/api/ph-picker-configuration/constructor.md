---
type: reference
native: "-[PHPickerConfiguration init]"
---

# `PHPickerConfiguration()` 构造函数

**`PHPickerConfiguration()`** 构造函数创建一份选图界面的配置，全部属性是默认值。建出来的配置用的是系统的相册。

## 语法

```
new PHPickerConfiguration()
```

### 参数

无。

### 返回值

新建的 `PHPickerConfiguration`。各属性的默认值：

| 属性 | 默认值 |
| --- | --- |
| [`selectionLimit`](selectionlimit.md) | `1` |
| [`filter`](filter.md) | `null` |
| [`preferredAssetRepresentationMode`](preferredassetrepresentationmode.md) | `'automatic'` |
| [`selection`](selection.md) | `'default'` |
| [`mode`](mode.md) | `'default'` |

### 异常

无。

## 示例

```js
const config = new PHPickerConfiguration();
console.log(config.selectionLimit, config.filter);
```

**结果**：输出 `1 null`。

## 对应的 iOS API

`-[PHPickerConfiguration init]`。

## 参见

- [`PHPickerViewController()`](../photos/constructor.md)：用配置建选图界面
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
