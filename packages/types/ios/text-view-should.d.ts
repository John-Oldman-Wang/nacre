// 多行输入框上「系统当场来问」的事件：beforefocus、beforeblur、beforeinput、linkclick。

/** 多行输入框的 `beforeinput`：这次修改打算把哪一段换成什么。 */
interface UITextViewBeforeInputEvent extends Event {
  /**
   * 要被换掉的那一段，单位是 UTF-16 码元，和 JS 字符串的下标一致。
   * 插入时 `length` 是 0；删除时是被删掉的长度。
   */
  readonly range: NSRange;
  /** 要换上去的文字。删除时是空串；粘贴时是整段粘贴的内容。 */
  readonly replacementString: string;
}

/** 多行输入框的 `linkclick`：用户点了富文本里的一个链接。 */
interface UITextViewLinkClickEvent extends Event {
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

interface UITextView {
  addEventListener(
    type: 'beforeinput',
    callback: EventListener<UITextViewBeforeInputEvent> | null,
    options?: AddEventListenerOptions,
  ): void;
  addEventListener(
    type: 'linkclick',
    callback: EventListener<UITextViewLinkClickEvent> | null,
    options?: AddEventListenerOptions,
  ): void;
  addEventListener(
    type: UITextViewShouldEventType,
    callback: EventListener | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener(type: 'beforeinput', callback: EventListener<UITextViewBeforeInputEvent> | null): void;
  removeEventListener(type: 'linkclick', callback: EventListener<UITextViewLinkClickEvent> | null): void;
  removeEventListener(type: UITextViewShouldEventType, callback: EventListener | null): void;
  // 上面几条重载会盖住继承来的那一条，这里补回来：别的事件照旧能摘
  removeEventListener(type: string, callback: EventListener | null): void;
}
