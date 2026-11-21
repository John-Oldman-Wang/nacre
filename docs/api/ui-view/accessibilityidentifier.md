---
type: reference
native: UIView.accessibilityIdentifier
---

# `UIView`：`accessibilityIdentifier` 属性

**`accessibilityIdentifier`** 属性是给界面自动化测试找元素用的标识。界面自动化测试是用程序模拟用户点按、输入来测 App 的界面，比如 Xcode 自带的 XCUITest，它按这个标识找到要操作的视图。

## 值

字符串，或者 `null`。

- 可读，可写。
- `UIView` 的默认值是 `null`。
- 写 `null` 或 `undefined` 清掉，读到 `null`。别的值按 `String()` 转。
- 读屏不念它，用户也看不到它。按 Apple 的文档，它和[标签](accessibilitylabel.md)分开，就是为了标签可以按语言翻译、随时改写，而测试代码用的标识保持不变。
- 不要求唯一，运行时不检查重复。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const submit = UIButton.buttonWithType('system');
submit.setTitle('提交订单', { forState: ['normal'] });
submit.accessibilityIdentifier = 'checkout-submit';
console.log(submit.accessibilityIdentifier);
```

**效果**：控制台输出 `checkout-submit`。按钮上的文字以后改成别的、或者翻译成英文，测试代码仍然用 `checkout-submit` 找到它。

## 对应的 iOS API

`accessibilityIdentifier`。在 iOS 里它属于 `UIAccessibilityIdentification` 协议；JS 里只在 `UIView` 和它的子类上有。

## 参见

- [`tag`](tag.md)：App 自己的代码按整数编号找视图
- [`accessibilityLabel`](accessibilitylabel.md)：读屏念的名字
