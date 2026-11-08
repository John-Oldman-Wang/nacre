# `UIButton`

按钮。标题、颜色、图片都是**按状态**设的——同一个按钮在 `normal` / `highlighted` / `disabled` 下可以不一样。

```js
const btn = UIButton.buttonWithType('system');
btn.setTitle('点我试试', { forState: ['normal'] });
btn.addEventListener('primaryActionTriggered', () => console.log('点了'));
parent.addSubview(btn);
```

## 继承关系

```
EventTarget → NSObject → UIResponder → UIView → UIControl → UIButton
```

[`UIControl`](ui-control.md) 的 16 个事件、状态、对齐全都能用。

## 构造

```js
UIButton.buttonWithType('system')   // 系统外观：蓝色文字、按下变淡
new UIButton()                      // custom：什么都不画，背景和圆角自己来
```

| 类型 | |
| --- | --- |
| `'custom'` | 什么都不画 |
| `'system'` | 标准系统按钮 |
| `'detailDisclosure'` / `'infoLight'` / `'infoDark'` / `'contactAdd'` / `'close'` | 系统图标按钮 |

`buttonType` 只读，建好就定死。

## 按状态设

```js
btn.setTitle('点我试试', { forState: ['normal'] });
btn.setTitle('按住啦',   { forState: ['highlighted'] });
btn.setTitleColor(UIColor.systemRedColor, { forState: ['normal'] });
btn.setImage(icon, { forState: ['normal'] });
btn.setBackgroundImage(bg, { forState: ['normal'] });
```

`forState` 是状态**数组**，和 `control.state` 读出来的形状一致，可以组合：

```js
btn.setTitle('两个状态', { forState: ['selected', 'disabled'] });
```

**`forState` 不能省**——「给哪个状态设的」是这类方法的核心语义，缺了会抛，不会默默当成 `normal`：

```js
btn.setTitle('x', {});              // TypeError: setTitle needs { forState }
btn.setTitle('x', { forState: ['pressed'] });   // TypeError: forState has no value "pressed"
```

### 取值只认单个状态，而且会回退

```js
btn.titleForState('normal');        // '点我试试'
btn.titleForState('highlighted');   // '按住啦'
btn.titleForState('disabled');      // '点我试试' ← 没设过，回退到 normal
```

取值这一侧**只传一个状态名**，不是数组——这是 UIKit 的规定。没设过的状态会**回退到 `normal`**，不会返回 `null`。

四个取值方法：`titleForState` / `titleColorForState` / `imageForState` / `backgroundImageForState`。

## 当前状态下实际用的

| 属性 | 类型 |
| --- | --- |
| `currentTitle` | `string` \| `null` |
| `currentTitleColor` | `UIColor`，**永远非空** |
| `currentImage` | `UIImage` \| `null` |
| `currentBackgroundImage` | `UIImage` \| `null` |

```js
btn.isSelected = true;
btn.isEnabled  = false;
btn.currentTitle;   // '两个状态'
```

## 子视图

```js
btn.titleLabel.font = UIFont.systemFontOfSize(20, { weight: 'semibold' });
btn.titleLabel.numberOfLines = 2;
```

字体、行数这些要通过 `titleLabel` 设，`UIButton` 自己没有这些属性。

> 头文件的注释写着「system 按钮的 `titleLabel` 返回 nil」，**实测不对**——system 按钮一样有 `titleLabel` 和 `imageView`。

## `role`

```js
btn.role = 'destructive';   // 系统给它红色
```

`'normal'` / `'primary'` / `'cancel'` / `'destructive'`，默认 `'normal'`。

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `[UIButton buttonWithType:UIButtonTypeSystem]` | `UIButton.buttonWithType('system')` |
| `[btn setTitle:@"点我" forState:UIControlStateNormal]` | `btn.setTitle('点我', { forState: ['normal'] })` |
| `[btn setTitle:@"x" forState:UIControlStateSelected \| UIControlStateDisabled]` | `btn.setTitle('x', { forState: ['selected', 'disabled'] })` |
| `[btn titleForState:UIControlStateHighlighted]` | `btn.titleForState('highlighted')` |
| `[btn setTitleColor:color forState:UIControlStateNormal]` | `btn.setTitleColor(color, { forState: ['normal'] })` |
| `[btn setImage:img forState:UIControlStateNormal]` | `btn.setImage(img, { forState: ['normal'] })` |
| `btn.currentTitle` | `btn.currentTitle` |
| `btn.titleLabel.font = …` | `btn.titleLabel.font = …` |
| `btn.role = UIButtonRoleDestructive` | `btn.role = 'destructive'` |

**设的时候是数组（可以组合），取的时候是单个字符串**——这是 UIKit 自己的不对称。

## 还没做

| | |
| --- | --- |
| `UIButton.Configuration` | iOS 15 那套，几十个字段，单独一步 |
| `attributedTitle` | 富文本，和 `UILabel` 的一起做 |
| `menu` / `showsMenuAsPrimaryAction` | 要 `UIMenu` |
| `setPreferredSymbolConfiguration:` | SF Symbol 的粗细尺寸配置 |
| `subtitleLabel` | 要配合 Configuration 才有意义 |

---

实现原理见[实现说明](../internals/events.md)。

← 返回 [API 文档](README.md)
