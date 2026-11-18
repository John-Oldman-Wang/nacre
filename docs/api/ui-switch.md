---
type: reference
native: UISwitch
status: partial
---

# UISwitch

`UISwitch` 表示一个开关：一条短轨道上有一个圆钮，圆钮在左边是关，在右边是开。用户点一下或者拖动圆钮来切换。它用在「某个选项要不要启用」这类只有两个取值、切换后立刻生效的地方。

它是 [`UIControl`](ui-control.md) 的子类，所以也是一个视图：用 `new UISwitch()` 创建，用 `addSubview` 放到页面上。

开关的状态读写 `isOn`。用户切换之后，开关派发 `change` 事件；这时读 `isOn` 得到的是切换之后的值。

**代码写 `isOn` 不派发 `change`。** 只有用户的操作才派发。所以按保存的设置恢复界面时可以直接写 `isOn`，不会触发自己的监听器。这一条**未在模拟器验证**，来自 iOS 的定义。

**开关的大小由系统决定。** 写 `frame` 时宽和高不起作用，位置起作用。实测 iOS 27.2 上是 63 × 28 pt（[pt 是什么](units.md)）。用 Auto Layout 时只给位置的约束，不要给宽高的约束。

开关自己不带文字。旁边的说明文字用一个 [`UILabel`](ui-label.md)，和开关一起放进一个横向的 [`UIStackView`](ui-stack-view.md)。

> **注意**：这一页里的默认值、读写的结果和报错，在模拟器上用一个不带界面的程序跑过。屏幕上的样子和事件的派发还没有在模拟器上验证，下面在对应的地方标出。

## 完整例子

下面的代码从空白 App 开始，在屏幕上放一行「通知」和一个开关。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 说明文字
  const label = new UILabel();
  label.text = '通知';

  // 2. 开关，一开始是开着的
  const sw = new UISwitch();
  sw.isOn = true;

  // 3. 用户切换时做什么
  sw.addEventListener('change', () => {
    console.log('通知', sw.isOn ? '开' : '关');
  });

  // 4. 文字在左、开关在右，排成一行放到页面上
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

**效果**（未在模拟器验证）：

- 屏幕左上方出现「通知」两个字，右边是一个绿色的、开着的开关。
- 点一下开关，圆钮滑到左边，轨道变灰，控制台输出 `通知 关`。
- 再点一下，控制台输出 `通知 开`。

`safeAreaLayoutGuide` 是页面上不被刘海和圆角遮住的那块区域，见 [Auto Layout](auto-layout.md)。

## 常见用法

以下例子都沿用上面的 `sw`。

### 带动画地切换

```js
sw.setOn(false, { animated: true });
console.log(sw.isOn);
```

**效果**：圆钮滑到左边（未在模拟器验证）。控制台输出 `false`：值在调用返回时就已经变了，不用等动画结束。

`setOn` 和写 `isOn` 一样不派发 `change`。

### 换颜色

```js
sw.onTintColor = '#5856D6';
sw.thumbTintColor = '#FFFFFF';
```

**效果**（未在模拟器验证）：开着的时候轨道是紫色，圆钮是白色。

两个属性写 `null` 都是回到系统默认的颜色。颜色的写法见[颜色](ui-color.md)。

### 让开关不能点

```js
sw.isEnabled = false;
```

**效果**（未在模拟器验证）：开关变淡，点它没有反应，也不派发事件。

`isEnabled` 是从 [`UIControl`](ui-control.md) 继承来的。禁用之后代码仍然可以写 `isOn`。

### 切换之后要保存，保存失败时改回去

```js
/** @param {boolean} on @returns {Promise<void>} */
async function save(on) {
  // 把设置发给服务器
}

sw.addEventListener('change', async () => {
  const wanted = sw.isOn;
  try {
    await save(wanted);
  } catch (err) {
    sw.setOn(!wanted, { animated: true });
  }
});
```

**效果**（未在模拟器验证）：用户切换后开关立刻变过去；保存失败时开关滑回原来的位置。

改回去用的是 `setOn`，它不派发 `change`，所以不会再触发一次保存。

## 成员说明

`UISwitch` 继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的全部成员。下面只列它自己的。

### 构造

```js
const sw = new UISwitch();
```

没有参数。创建出来是关着的。

### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `isOn` | `boolean` | 是 | 是 | `false` | `true` 是开，`false` 是关。写入按 JS 的真假值转换，所以 `'false'` 这个字符串是 `true` |
| `onTintColor` | 颜色字符串或 `null` | 是 | 是 | `null` | 开着的时候轨道的颜色。`null` 是系统的绿色。写入时也接受 `UIColor` 对象 |
| `thumbTintColor` | 颜色字符串或 `null` | 是 | 是 | `null` | 圆钮的颜色。`null` 是系统默认 |

`isOn` 变了的通知：用户切换时派发 `change`。代码写入不派发。

颜色写了不合法的字符串时不抛，运行时打一条警告，属性保持原来的值。

### 方法

| 方法 | 作用 |
| --- | --- |
| `setOn(on, options?)` | 切换到 `on`。`options.animated` 为 `true` 时带动画，不带或者为 `false` 时没有动画。没有返回值 |

### 事件

事件是 [`UIControl`](ui-control.md#事件) 的那 16 个。开关用到的是：

| 事件 | 什么时候派发 |
| --- | --- |
| `change` | 用户把开关切到了另一边 |

- 监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `[[UISwitch alloc] init]` | `new UISwitch()` |
| `sw.on` / `sw.isOn` | `sw.isOn` |
| `[sw setOn:YES animated:YES]` | `sw.setOn(true, { animated: true })` |
| `sw.onTintColor = UIColor.systemPurpleColor` | `sw.onTintColor = 'systemPurple'` |
| `[sw addTarget:self action:@selector(changed:) forControlEvents:UIControlEventValueChanged]` | `sw.addEventListener('change', fn)` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 把开关显示成复选框，旁边带标题 | `preferredStyle`、`style`、`title` | 不做。这三个只在 Mac 上有效；实测 iPhone 上把 `preferredStyle` 设成复选框，`style` 仍然是滑动的开关 |
| 给开和关两种状态各放一张图 | `onImage`、`offImage` | 不做。Apple 的文档写明这两个属性从 iOS 7 起没有效果 |

## 参见

- [`UIControl`](ui-control.md)：`isEnabled`、16 个控件事件、`sendActionsForControlEvents`
- [`UIStackView`](ui-stack-view.md)：把文字和开关排成一行
- [颜色](ui-color.md)：颜色字符串的写法
- [实现原理](../internals/value-controls.md)：默认值和边界行为是怎么量的
