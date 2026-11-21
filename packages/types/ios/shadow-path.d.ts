// 图层的 shadowPath：阴影照这条路径的形状画。

interface CALayer {
  /**
   * 阴影的形状。默认 `null`：系统每一帧从图层的内容算阴影的形状。给一条和图层
   * 一样大的路径，这一步就省掉了，滚动的列表里有很多带阴影的卡片时差别最明显。
   *
   * 读回来的是写进去的那个对象。存的是副本：写进去之后再改那条路径，阴影不变，
   * 要再赋值一次。写了不是 `UIBezierPath` 的值抛 `TypeError`。
   */
  shadowPath: UIBezierPath | null;
}
