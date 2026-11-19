---
type: reference
native: UIImageView.animating
---

# `UIImageView`：`isAnimating` 属性

**`isAnimating`** 属性表示图片视图是否正在播放用一组图片设置的逐帧动画。

## 值

布尔。

- 只读。给它赋值抛 `TypeError`。
- 用一组图片设置逐帧动画的写法（原生的 `animationImages`）还不能用，所以它一直是 `false`。
- **动图的播放不反映在这个属性上。** 把一张动图赋给 [`image`](image.md) 之后它仍然是 `false`。判断图片视图上有没有在播动图，读 `iv.layer.animationForKey('nacreImageFrames')`，见[动图的播放](../ui-image-view.md#动图的播放)。

## 示例

```js
const iv = new UIImageView();
const loading = UIImage.imageNamed('JS/assets/anim.gif');
iv.image = loading;
console.log(iv.isAnimating);
```

**结果**：控制台输出 `false`。

## 对应的 iOS API

`UIImageView.animating`（getter 是 `isAnimating`）。

## 参见

- [动图的播放](../ui-image-view.md#动图的播放)
