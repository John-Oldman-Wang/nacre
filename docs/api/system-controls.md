---
type: reference
native: UIColorWell
status: partial
---

# `UIColorWell`

**`UIColorWell`** 表示一个取色控件：一个显示当前颜色的小圆钮。用户点它，系统弹出取色面板，用户在面板里选一个颜色。选中的颜色从 [`selectedColor`](system-controls/selectedcolor.md) 读。

取色面板由系统提供，App 不画它，只能用几个属性决定面板上有什么：标题、能不能调不透明度、有没有取色器（从屏幕上吸一个颜色的工具）。

取色控件是[控件](ui-control.md)：禁用、状态和事件来自 `UIControl`。控件又是[视图](ui-view.md)：位置、大小来自 `UIView`。

本页和成员页里的默认值是在模拟器（iPhone Air，iOS 27.2）上量的。在模拟器上点开面板看过：面板的标题是 `title`，当前颜色是 `selectedColor`，`supportsAlpha` 和 `supportsEyedropper` 是 `true` 时有不透明度的滑杆和取色器的按钮。**用户在面板里选了颜色之后 `selectedColor` 变没变、[`change`](ui-control/change-event.md) 来没来，未在模拟器验证。**

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UIColorWell`

## 构造函数

[`UIColorWell()`](system-controls/constructor.md)

创建一个取色控件。没有标题，没有选中的颜色。

## 实例属性

还继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的属性。取色控件常用的继承属性是 `isEnabled`。

| 属性 | 说明 |
| --- | --- |
| [`selectedColor`](system-controls/selectedcolor.md) | 选中的颜色 |
| [`title`](system-controls/title.md) | 取色面板的标题 |
| [`supportsAlpha`](system-controls/supportsalpha.md) | 面板上能不能调不透明度 |
| [`supportsEyedropper`](system-controls/supportseyedropper.md) | 面板上有没有取色器 |
| [`maximumLinearExposure`](system-controls/maximumlinearexposure.md) | 面板上能选的颜色的最大线性曝光值 |

## 实例方法

`UIColorWell` 没有自己的方法。继承 [`UIControl`](ui-control.md) 和 [`UIView`](ui-view.md) 的方法。

## 事件

取色控件的事件都继承自 [`UIControl`](ui-control.md)，用 `addEventListener()` 监听。

| 事件 | 什么时候派发 |
| --- | --- |
| [`change`](ui-control/change-event.md) | 用户在面板里选了颜色。**未在模拟器验证。** 代码写 `selectedColor` 不派发 |

## 示例

### 放一个取色控件

从空白 App 开始，在屏幕正中放一个取色控件。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const well = new UIColorWell();
  well.title = '选个颜色';
  well.selectedColor = 'systemOrange';
  well.addEventListener('change', () => {
    console.log('选了', well.selectedColor);
  });

  well.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(well);
  NSLayoutConstraint.activateConstraints([
    well.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    well.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
    well.widthAnchor.constraintEqualToConstant(44),
    well.heightAnchor.constraintEqualToConstant(44),
  ]);
});
```

**效果**

- 屏幕正中出现一个 44 × 44 [pt](units.md) 的取色控件。
- 点它，系统弹出取色面板，标题是「选个颜色」，当前颜色是橙色，有不透明度的滑杆和取色器的按钮。
- 在面板里选一个颜色，控制台输出 `选了` 和颜色。**未在模拟器验证。**

这段代码没有作为一个整体在模拟器运行过。其中放到屏幕上、点开面板的部分在验收用例里运行过。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UIColorWell alloc] init]` | `new UIColorWell()` |
| `well.title = @"选个颜色"` | `well.title = '选个颜色'` |
| `well.selectedColor = UIColor.systemOrangeColor` | `well.selectedColor = 'systemOrange'` |
| `well.supportsAlpha = NO` | `well.supportsAlpha = false` |
| `well.supportsEyedropper = NO` | `well.supportsEyedropper = false` |
| `well.maximumLinearExposure = 2` | `well.maximumLinearExposure = 2` |
| `[well addTarget:self action:@selector(picked:) forControlEvents:UIControlEventValueChanged]` | `well.addEventListener('change', picked)` |

## 参见

- [`UIControl`](ui-control.md)：父类，`change` 事件和禁用
- [颜色](ui-color.md)：`selectedColor` 读写的颜色字符串
