---
type: reference
native: UIScrollView.contentLayoutGuide
---

# `UIScrollView`：`contentLayoutGuide` 属性

**`contentLayoutGuide`** 属性是只用于写约束的参照物，代表内容区。

## 值

[`UILayoutGuide`](../ui-layout-guide.md)。

- 只读。给它赋值抛 `TypeError`。
- 把子视图和它对齐，意思是「内容区和这个子视图一样大」。把容器的四条边和它对齐，内容区的大小就等于容器的大小。
- 用了这种写法就不要再写 `contentSize`。

## 示例

```js
const scroller = new UIScrollView();
const column = new UIStackView();
column.translatesAutoresizingMaskIntoConstraints = false;
column.axis = 'vertical';
scroller.addSubview(column);

const content = scroller.contentLayoutGuide;
const frame = scroller.frameLayoutGuide;
NSLayoutConstraint.activateConstraints([
  column.topAnchor.constraintEqualToAnchor(content.topAnchor),
  column.bottomAnchor.constraintEqualToAnchor(content.bottomAnchor),
  column.leadingAnchor.constraintEqualToAnchor(content.leadingAnchor),
  column.trailingAnchor.constraintEqualToAnchor(content.trailingAnchor),
  column.widthAnchor.constraintEqualToAnchor(frame.widthAnchor),
]);
```

**效果**：内容区和 `column` 一样大，和可视区一样宽：只能上下滚动。这五条约束在验收用例里运行过。

## 对应的 iOS API

`UIScrollView.contentLayoutGuide`。

## 参见

- [内容区的大小](../ui-scroll-view.md#内容区的大小)
- [`UILayoutGuide`](../ui-layout-guide.md)
