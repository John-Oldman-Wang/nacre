# 输入框和键盘

```js
const field = new UITextField();
field.placeholder = '请输入账号';
field.textContentType = 'username';      // 开启密码自动填充
field.addEventListener('editingChanged', () => console.log(field.text));
```

`UITextField` **是 `UIControl`**，所以[那 16 个控件事件](ui-control.md)直接可用——「文字变了」不需要别的机制。

## 键盘避让：一条约束

```js
card.bottomAnchor.constraintEqualToAnchor(
  view.keyboardLayoutGuide.topAnchor, { constant: -16 }).isActive = true;
```

**`keyboardLayoutGuide` 收起时贴安全区底边，弹出时贴键盘顶边**，所以这一条约束管两种状态，而且**跟键盘动画同步**（系统驱动，不是我们插值）。

不用听键盘通知，不用算高度，不用处理动画曲线。

列表同理，约束滚动视图的底边，可视区自己缩：

```js
scroll.bottomAnchor.constraintEqualToAnchor(view.keyboardLayoutGuide.topAnchor)
```

| `UIKeyboardLayoutGuide` 的成员 | 默认 |
| --- | --- |
| `followsUndockedKeyboard` | `false`。iPad 的浮动/拆分键盘也跟 |
| `keyboardDismissPadding` | `0`。下滑收键盘时提前多少开始 |

## 收起键盘

```js
field.resignFirstResponder();   // 这一个
view.endEditing(true);          // 或者整棵子树，不用知道是哪一个控件
```

`UIResponder` 上四个成员：`becomeFirstResponder()` / `resignFirstResponder()` 返回**成没成**（系统可能拒绝，比如视图还没上屏，别忽略返回值）、`isFirstResponder`、`canBecomeFirstResponder`。

## 事件

| 事件 | 什么时候 |
| --- | --- |
| `editingDidBegin` | 开始编辑 |
| **`editingChanged`** | **每次文字变化** |
| `editingDidEnd` | 结束编辑 |
| `editingDidEndOnExit` | 按回车导致编辑结束 |

**回车收键盘**：

```js
field.returnKeyType = 'done';
field.addEventListener('editingDidEndOnExit', () => field.resignFirstResponder());
```

## 属性

| | |
| --- | --- |
| `text` / `placeholder` | `text` 没内容是空串不是 `null` |
| `isEditing` 只读 | 正在编辑 |
| `keyboardType` | `default` `asciiCapable` `numbersAndPunctuation` `url` `numberPad` `phonePad` `namePhonePad` `emailAddress` `decimalPad` `twitter` `webSearch` `asciiCapableNumberPad` `alphabet` |
| `returnKeyType` | `default` `go` `google` `join` `next` `route` `search` `send` `yahoo` `done` `emergencyCall` `continue` |
| `keyboardAppearance` | `default` `dark` `light` `alert` |
| `enablesReturnKeyAutomatically` | 没内容时回车键变灰 |
| `isSecureTextEntry` | 遮点 |
| `autocapitalizationType` | `none` `words` `sentences` `allCharacters`（默认 `sentences`） |
| `autocorrectionType` / `spellCheckingType` | `default` `no` `yes` |
| `clearsOnBeginEditing` | 开始编辑时清空 |
| `borderStyle` | `none` `line` `bezel` `roundedRect` |
| `clearButtonMode` | `never` `whileEditing` `unlessEditing` `always` |
| `textAlignment` / `font` / `textColor` | `textColor` 和别处一样是[字符串](ui-color.md) |
| `adjustsFontSizeToFitWidth` / `minimumFontSize` | 装不下时缩字号 |

## `textContentType`：让系统替用户填

它**不影响键盘长什么样**，而是告诉 iOS 这个框装的是什么语义。

```js
account.textContentType = 'username';
secret.textContentType = 'password';
secret.isSecureTextEntry = true;
```

配好之后键盘上方会多一条栏，列出钥匙串里存过的账号；选一个两个框一起填好，登录成功后系统还会问要不要保存。

| 值 | 效果 |
| --- | --- |
| `username` + `password` | 密码自动填充 |
| `newPassword` | 注册页，系统生成强密码 |
| **`oneTimeCode`** | **短信验证码自动填充** |
| `emailAddress` / `telephoneNumber` / `name` | 从通讯录提建议 |
| `creditCardNumber` | 相机扫卡号 |
| 一组地址字段 | 收货地址整组填充 |

一共 48 个，写错会抛并把全部列出来。没配过读到 `null`。

## 还没做

| | |
| --- | --- |
| **`UITextView`**（多行） | 单独一步 |
| **输入过滤**（限长、只收数字） | `shouldChangeCharactersInRanges:` 要同步返回 BOOL，得先有 M1b。**现在能绕**：听 `editingChanged` 事后截断，会有一帧闪 |
| `textFieldShouldBeginEditing:` / `ShouldEndEditing:` / `ShouldClear:` | 同上 |
| `UITextInput` 那一套 | 光标、选区、自定义输入源 |
| `inputAccessoryView` | 键盘上方的自定义工具条 |
| `usesBottomSafeArea` | **实测写进去不生效**（写 `true` 读回 `false`），所以没暴露。见[实现原理](../internals/text-input.md) |

---

← 返回 [API 文档](README.md) ・ [`UIControl`](ui-control.md) ・ [Auto Layout](auto-layout.md) ・ [实现原理](../internals/text-input.md)
