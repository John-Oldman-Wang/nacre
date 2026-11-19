---
type: reference
native: UISwitch
status: partial
---

# `UISwitch`

**`UISwitch`** 表示一个开关：一条短轨道上有一个圆钮，圆钮在左边是关，在右边是开。用户点一下或者拖动圆钮来切换。它用在「某个选项要不要启用」这类只有两个取值、切换后立刻生效的地方。

开关的状态读写 [`isOn`](ui-switch/ison.md)。用户切换之后，开关派发 [`change`](ui-control/change-event.md) 事件；代码写 `isOn` 不派发。

开关的大小由系统决定，写 `frame` 的宽和高不起作用。开关自己不带文字，旁边的说明文字用一个 [`UILabel`](ui-label.md)，和开关一起放进一个横向的 [`UIStackView`](ui-stack-view.md)。

开关是[控件](ui-control.md)：禁用、状态和事件来自 `UIControl`。控件又是[视图](ui-view.md)：位置、底色来自 `UIView`。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UISwitch`

怎么用开关做一个设置项，见指南[做开关、滑块和步进器](../guides/switches-sliders-steppers.md)。

## 构造函数

[`UISwitch()`](ui-switch/constructor.md)

创建一个关着的开关。

## 实例属性

还继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的属性。开关常用的继承属性是 [`isEnabled`](ui-control/isenabled.md)。

| 属性 | 说明 |
| --- | --- |
| [`isOn`](ui-switch/ison.md) | 开着还是关着 |
| [`onTintColor`](ui-switch/ontintcolor.md) | 开着的时候轨道的颜色 |
| [`thumbTintColor`](ui-switch/thumbtintcolor.md) | 圆钮的颜色 |

## 实例方法

还继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的方法。

| 方法 | 说明 |
| --- | --- |
| [`setOn()`](ui-switch/seton.md) | 切换开关，可以带动画 |

## 事件

开关的事件继承自 [`UIControl`](ui-control.md)，用 `addEventListener()` 监听。开关用到的是：

| 事件 | 什么时候派发 |
| --- | --- |
| [`change`](ui-control/change-event.md) | 用户把开关切到了另一边。代码写 `isOn` 或调 `setOn()` 不派发 |

## 示例

### 一行设置项

从空白 App 开始，在屏幕上放一行「通知」和一个开关。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.text = '通知';

  const sw = new UISwitch();
  sw.isOn = true;
  sw.addEventListener('change', () => {
    console.log('通知', sw.isOn ? '开' : '关');
  });

  const row = new UIStackView([label, sw]);
  row.spacing = 12;
  row.alignment = 'center';
  row.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(row);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    row.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
    row.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  ]);
});
```

**效果**（未在模拟器验证）

- 屏幕左上方出现「通知」两个字，右边是一个绿色的、开着的开关。
- 点一下开关，圆钮滑到左边，轨道变灰，控制台输出 `通知 关`。
- 再点一下，控制台输出 `通知 开`。

`safeAreaLayoutGuide` 是页面上不被刘海和圆角遮住的那块区域，见 [Auto Layout](auto-layout.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UISwitch alloc] init]` | `new UISwitch()` |
| `sw.on` / `sw.isOn` | `sw.isOn` |
| `[sw setOn:YES animated:YES]` | `sw.setOn(true, { animated: true })` |
| `sw.onTintColor = UIColor.systemPurpleColor` | `sw.onTintColor = 'systemPurple'` |
| `[sw addTarget:self action:@selector(changed:) forControlEvents:UIControlEventValueChanged]` | `sw.addEventListener('change', fn)` |

## 参见

- [做开关、滑块和步进器](../guides/switches-sliders-steppers.md)：带动画切换、禁用、保存失败时改回去
- [`UIControl`](ui-control.md)：`isEnabled`、全部控件事件
- [`UIStackView`](ui-stack-view.md)：把文字和开关排成一行
- [颜色](ui-color.md)：颜色字符串的写法
