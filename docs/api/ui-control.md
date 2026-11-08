# `UIControl`

会接收触摸、并把触摸翻译成**控件事件**的视图。按钮、开关、滑块、输入框都是它的子类。

```js
const btn = new UIControl();
btn.backgroundColor = UIColor.systemGreenColor;
btn.layer.cornerRadius = 10;
parent.addSubview(btn);

btn.addEventListener('touchUpInside', (e) => {
  console.log('点了', e.target.state);
});
```

## 继承关系

```
EventTarget → NSObject → UIResponder → UIView → UIControl
```

[`UIView`](ui-view.md) 的成员全都能用。

## 16 个事件

```js
control.addEventListener('touchUpInside', fn);
control.removeEventListener('touchUpInside', fn);
```

| 触摸 | 什么时候 |
| --- | --- |
| `touchDown` | 手指按下 |
| `touchDownRepeat` | 连击（第二下起） |
| `touchDragInside` | 手指在控件**内**移动，持续发 |
| `touchDragOutside` | 手指在控件**外**移动，持续发 |
| `touchDragEnter` | 从外面移进来，**只发一次** |
| `touchDragExit` | 从里面移出去，**只发一次** |
| `touchUpInside` | 在控件内抬起 ← 这就是「点击」 |
| `touchUpOutside` | 在控件外抬起（拖出去再松手） |
| `touchCancel` | 触摸被取消，通常是被手势抢走了 |

| 其它 | 什么时候 |
| --- | --- |
| `valueChanged` | 滑块、开关这类的值变了 |
| `primaryActionTriggered` | **语义上的「点击」**。按钮按下、辅助功能触发都会发 |
| `menuActionTriggered` | 菜单手势触发 |
| `editingDidBegin` / `editingChanged` / `editingDidEnd` / `editingDidEndOnExit` | 输入框的编辑过程 |

**事件名写错会抛 `TypeError`**——控件的事件类型是有限的，写错了不该静默不响应：

```js
btn.addEventListener('mousedown', fn);
// TypeError: addEventListener has no value "mousedown"; expected one of: …
```

> 没有 `'click'` 这个名字。Web 的 `click` 含键盘和辅助功能触发，iOS 的对应物是 `primaryActionTriggered` 而不是 `touchUpInside`——两个不是一回事，所以不做别名。

### 回调里读到的是「此刻」的状态

事件到 JS 时**延后了一轮**，所以：

```js
btn.addEventListener('touchDown', () => btn.isHighlighted);
// 手抬得快的话，这里读到的已经是 false 了
```

要事件发生那一刻的值，得在事件对象上带——但第一版的事件对象只有 `type` 和 `target`。

### 事件对象

```js
btn.addEventListener('touchUpInside', (e) => {
  e.type;     // 'touchUpInside'
  e.target;   // 就是 btn
});
```

**不带触点位置。** 要坐标等手势那一步。

`cancelable` 是 `false`，`preventDefault()` 不起作用——`sendActionsForControlEvents:` 不看返回值，没有可取消的默认动作。

## 状态

| 属性 | 类型 | 默认值 | 效果 |
| --- | --- | --- | --- |
| `isEnabled` | `boolean` 读写 | `true` | 关掉后不接收触摸，子类还会画成灰的 |
| `isSelected` | `boolean` 读写 | `false` | **由 App 自己用**，UIKit 不会自动改 |
| `isHighlighted` | `boolean` 读写 | `false` | 手指按下时 UIKit 自动置上，抬起时清掉 |
| `state` | `UIControlStateName[]` 只读 | `['normal']` | 由上面三个合成 |
| `isTracking` | `boolean` 只读 | | 只在跟踪触摸期间有意义 |
| `isTouchInside` | `boolean` 只读 | | 同上 |

`state` 是**位掩码**，所以是数组；三个布尔都没置上时是 `['normal']`：

```js
btn.isSelected = true;   btn.state;   // ['selected']
btn.isEnabled  = false;  btn.state;   // ['disabled', 'selected']
```

## 内容对齐

| 属性 | 取值 | 默认值 |
| --- | --- | --- |
| `contentHorizontalAlignment` | `center` / `left` / `right` / `fill` / `leading` / `trailing` | `'center'` |
| `contentVerticalAlignment` | `center` / `top` / `bottom` / `fill` | `'center'` |

## 主动触发

```js
btn.sendActionsForControlEvents(['touchDown', 'touchUpInside']);
```

走的是**原生**的 `sendActionsForControlEvents:`，所以所有注册者都会收到，不只是 JS 的监听器。

> `dispatchEvent` **不走这条**。它是 `EventTarget` 的语义，只派发给 JS 监听器，不会让原生以为用户点了。

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `[[UIControl alloc] init]` | `new UIControl()` |
| `[c addTarget:self action:@selector(tap:) forControlEvents:UIControlEventTouchUpInside]` | `c.addEventListener('touchUpInside', fn)` |
| `[c removeTarget:self action:@selector(tap:) forControlEvents:…]` | `c.removeEventListener('touchUpInside', fn)` |
| `[c sendActionsForControlEvents:UIControlEventTouchDown \| UIControlEventTouchUpInside]` | `c.sendActionsForControlEvents(['touchDown', 'touchUpInside'])` |
| `c.enabled = NO` | `c.isEnabled = false` |
| `c.state & UIControlStateSelected` | `c.state.includes('selected')` |
| `c.contentHorizontalAlignment = UIControlContentHorizontalAlignmentLeading` | `c.contentHorizontalAlignment = 'leading'` |

事件名是 ObjC 常量去掉 `UIControlEvent` 前缀、首字母小写。位掩码用字符串数组。

## 还没做

| | |
| --- | --- |
| `UIButton` | 下一步 |
| 触点位置 | 要先有 `UITouch` |
| `UIGestureRecognizer` | 第 10 步。手势的抢占语义没有 Web 参照，要单独设计 |
| `touchesBegan:` 那一层 | 要能用 JS 子类化原生类（M2） |
| first responder | 和输入框一起 |

---

实现原理和实测的派发顺序见[实现说明](../internals/events.md)。

← 返回 [API 文档](README.md)
