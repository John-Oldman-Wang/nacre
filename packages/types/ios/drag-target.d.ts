// 拖动结束时改滚动停下的位置：UIScrollView 的 beforedragend 事件。

/**
 * 滚动视图的 `beforedragend` 事件：手指离开的那一刻，系统当场问停在哪。
 * 当场派发、不能取消。监听器改 `targetContentOffset`，滚动就停在那里。
 */
interface UIScrollViewDragEndEvent extends Event {
  /** 松手时的速度，单位 pt/ms。 */
  readonly velocity: CGPoint;
  /** 停点。初值是系统算出来的那个；写进去的不是点时照系统的。 */
  get targetContentOffset(): CGPoint;
  set targetContentOffset(value: CGPointLike);
}
