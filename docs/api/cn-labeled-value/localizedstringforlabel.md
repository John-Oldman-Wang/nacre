---
type: reference
native: "+[CNLabeledValue localizedStringForLabel:]"
---

# `CNLabeledValue.localizedStringForLabel()` 静态方法

**`CNLabeledValue.localizedStringForLabel()`** 静态方法把标签的原文换成当前语言下给人看的写法。

## 语法

```
CNLabeledValue.localizedStringForLabel(label)
```

### 参数

**`label`**

标签的原文，字符串，一般是 [`label`](label.md) 读出来的值。别的类型按 `String()` 转成字符串：写 `5` 得到 `'5'`；`null` 当作空串，得到 `''`。

### 返回值

字符串。

- 系统自带的标签换成当前语言下给人看的写法，比如中文系统上 `'_$!<Mobile>!$_'` 得到 `'手机'`。
- 别的字符串原样返回，比如用户自己起的标签 `'Warehouse'` 得到 `'Warehouse'`。

不需要联系人就能调。

### 异常

无。

## 示例

```js
console.log(CNLabeledValue.localizedStringForLabel('_$!<Mobile>!$_'));
console.log(CNLabeledValue.localizedStringForLabel('仓库'));
```

**结果**：中文系统上第一行输出 `手机`，第二行输出 `仓库`。

## 对应的 iOS API

`+[CNLabeledValue localizedStringForLabel:]`。

## 参见

- [标签的原文](../cn-labeled-value.md#标签的原文)
- [安装 `@nacrejs/contacts`](../contacts.md#先装上)
