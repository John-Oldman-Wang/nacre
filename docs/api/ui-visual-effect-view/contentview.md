---
type: reference
native: UIVisualEffectView.contentView
---

# `UIVisualEffectView`：`contentView` 属性

**`contentView`** 属性是效果视图里放内容的视图。效果视图上面要显示的文字、图标、按钮，都加到它上面，不加到效果视图自己上面。

## 值

[`UIView`](../ui-view.md)。

- 只读。给它赋值抛 `TypeError`。
- 效果视图自带它，大小始终和效果视图相同。
- 它一直是同一个对象：换效果、把效果清掉，`contentView` 和里面的内容都不变。

### 直接加到效果视图上会被拒

对效果视图自己调 `addSubview()` 或 `insertSubview()` 抛 `TypeError`：

```
addSubview: a UIVisualEffectView takes no subviews of its own; add them to its contentView
```

被拒的视图不会进入任何视图树。

效果视图的 `subviews` 读出来的是它内部使用的视图，其中包括 `contentView`。个数随效果变化，不要依赖它，也不要移动或移除这些视图。

## 示例

```js
const panel = new UIVisualEffectView(UIBlurEffect.effectWithStyle('systemMaterial'));
panel.frame = new CGRect(60, 260, 240, 80);

const label = new UILabel();
label.text = '毛玻璃';
label.frame = new CGRect(0, 0, 240, 80);
panel.contentView.addSubview(label);
```

**效果**：面板上显示「毛玻璃」三个字，字本身是清晰的。**未在模拟器验证。**

## 对应的 iOS API

`UIVisualEffectView.contentView`。`[view.contentView addSubview:label]` 写成 `view.contentView.addSubview(label)`。

## 参见

- [做模糊和玻璃效果](../../guides/blur-and-glass.md)
