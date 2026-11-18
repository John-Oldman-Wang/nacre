<!-- 初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。 -->

# 取色控件：UIColorWell

← [API 文档](README.md)

这一页现在只是一张清单：名字、类型、对应的 selector。成员的名字是按[原生类](native-classes.md)里那几条写法从 iOS 的头文件套出来的，所以能照着对回 Apple 的文档，用法也照 Apple 的文档。

> **注意**：这一页还没有按[文档写法](../writing-guide.md)写：没有例子，没有效果，默认值只量过一部分。验过的是每个属性读得出来、类型对、写回读到的值不出错；方法大多没有在模拟器上调过。要用哪个成员，先在模拟器上试。

## UIColorWell

下面是这个类现在的全部成员。

| 属性 | 类型 | |
| --- | --- | --- |
| `title` | `string \| null` | 可读可写 |
| `supportsAlpha` | `boolean` | 可读可写 |
| `selectedColor` | `string \| null` | 可读可写 |
| `supportsEyedropper` | `boolean` | 可读可写 |
| `maximumLinearExposure` | `number` | 可读可写 |
