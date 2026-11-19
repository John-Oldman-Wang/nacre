---
type: reference
native: "-[UIButton setImage:forState:]"
---

# `UIButton`：`setImage()` 方法

**`setImage()`** 方法给按钮的一个或几个状态设图标。按钮按当前状态显示对应的那一个。

## 语法

```
setImage(value, { forState })
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

- 没有传 `forState`：`setImage needs { forState }`。
- `forState` 里有不认识的状态名：`forState has no value "pressed"; expected one of: …`，后面列出全部状态名。
- `value` 不是 `UIImage` 也不是 `null`。


## 示例

```js
const button = UIButton.buttonWithType('system');
button.setTitle('收藏', { forState: ['normal'] });
button.setImage(UIImage.systemImageNamed('heart'), { forState: ['normal'] });
```

**效果**：文字左边出现一个心形图标，颜色和文字一样。只设图标不设文字时，按钮只显示图标。**图标的位置和颜色未在模拟器验证。**

## 对应的 iOS API

`-[UIButton setImage:forState:]`。状态在 ObjC 里是位掩码 `UIControlStateSelected | UIControlStateDisabled`，这里写成数组 `['selected', 'disabled']`。

## 参见

- [`imageForState()`](imageforstate.md)
- [`UIImage`](../ui-image.md)：系统图标和自己的图片
- [状态](../ui-button.md#状态)
