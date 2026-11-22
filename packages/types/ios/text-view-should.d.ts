// 多行输入框上「系统当场来问」的事件：beforefocus、beforeblur、beforeinput、linkclick。

/** 多行输入框的 `linkclick`：用户点了富文本里的一个链接。 */
declare class UITextViewLinkClickEvent extends Event {
  constructor(type: string, init?: EventInit & Partial<Pick<UITextViewLinkClickEvent, 'url' | 'range'>>);
  /** 链接的地址。 */
  readonly url: string;
  /** 链接在文字里的那一段，单位是 UTF-16 码元。 */
  readonly range: NSRange;
}

/**
 * 多行输入框上的四个可取消事件，当场派发，监听器执行完系统才决定做不做：
 *
 * | 事件 | 系统在问 | 取消的效果 |
 * | --- | --- | --- |
 * | `beforefocus` | 要不要开始编辑 | 不进入编辑，`becomeFirstResponder()` 返回 `false` |
 * | `beforeblur` | 要不要结束编辑 | 焦点留着，`resignFirstResponder()` 返回 `false` |
 * | `beforeinput` | 这次修改让不让发生 | 文字不变 |
 * | `linkclick` | 点了链接，要不要打开 | 不打开 |
 */
type UITextViewShouldEventType = 'beforefocus' | 'beforeblur' | 'beforeinput' | 'linkclick';

// 合并进多行输入框的事件表
interface UITextViewEventMap {
  'beforefocus': Event;
  'beforeblur': Event;
  'beforeinput': UITextBeforeInputEvent;
  'linkclick': UITextViewLinkClickEvent;
}
