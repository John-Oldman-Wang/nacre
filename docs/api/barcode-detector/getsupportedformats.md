---
type: reference
web: BarcodeDetector.getSupportedFormats()
---

# `BarcodeDetector.getSupportedFormats()` 静态方法

**`BarcodeDetector.getSupportedFormats()`** 静态方法查询这台设备认得哪几种条码格式。

## 语法

```
BarcodeDetector.getSupportedFormats()
```

### 参数

无。

### 返回值

`Promise`，兑现成格式名的数组，按字母顺序排，没有重复（没有重复是实测的）。名字都是 [`BarcodeDetector()`](constructor.md#参数) 那张表里的。

iPhone 14（iOS 27.2）上实测兑现成 12 种：表里除了 `'upc_a'` 的全部。

### 异常

无。

## 示例

```js
BarcodeDetector.getSupportedFormats().then((formats) => {
  console.log(formats.join(', '));
  console.log(formats.includes('qr_code'));
});
```

**结果**：iPhone 14 上输出 `aztec, codabar, code_128, code_39, code_93, data_matrix, ean_13, ean_8, itf, pdf417, qr_code, upc_e`，然后输出 `true`。

## 和 Web 的差别

和 Web 相同。`'upc_a'` 能写进构造参数，但不在这个列表里，永远认不出来。

## 参见

- [`BarcodeDetector()`](constructor.md)：只找某几种格式
