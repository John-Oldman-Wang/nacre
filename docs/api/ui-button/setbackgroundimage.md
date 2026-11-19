---
type: reference
native: "-[UIButton setBackgroundImage:forState:]"
---

# `UIButton`：`setBackgroundImage()` 方法

**`setBackgroundImage()`** 方法给按钮的一个或几个状态设背景图。背景图铺满整个按钮，显示在文字和图标后面。按钮按当前状态显示对应的那一个。

## 语法

```
setBackgroundImage(value, { forState })
```

### 参数

**`value`**

[`UIImage`](../ui-image.md)。传 `null` 去掉这几个状态的设置，它们回到使用 `normal` 的。

**`options.forState`**

状态名的数组，必填。给哪些状态设，见[状态](../ui-button.md#状态)。只设 `['normal']` 时，没有单独设过的状态都用它。几个状态同时成立时才用的值，把这几个状态名都写进数组，比如 `['selected', 'disabled']`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没有传 `forState`：`setBackgroundImage needs { forState }`。
- `forState` 里有不认识的状态名：`forState has no value "pressed"; expected one of: …`，后面列出全部状态名。
- `value` 不是 `UIImage` 也不是 `null`。


## 示例

```js
const button = new UIButton();
const background = UIImage.imageNamed('button-bg');
if (background) {
  button.setBackgroundImage(background, { forState: ['normal'] });
}
```

**效果**：按钮的背景铺满 `button-bg` 这张图。**未在模拟器验证。**

## 对应的 iOS API

`-[UIButton setBackgroundImage:forState:]`。状态在 ObjC 里是位掩码 `UIControlStateSelected | UIControlStateDisabled`，这里写成数组 `['selected', 'disabled']`。

## 参见

- [`backgroundImageForState()`](backgroundimageforstate.md)
- [状态](../ui-button.md#状态)
