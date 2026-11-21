// 输入法组字的范围：UITextField / UITextView 的 markedTextRange。

interface UITextField {
  /**
   * 输入法组字中的那一段（用拼音打字、还没选字时输入框里的拼音），从文字开头数
   * 的 UTF-16 码元。没在组字时是 `null`。只读。组字的每一步照常派发 `input`。
   */
  readonly markedTextRange: NSRange | null;
}

interface UITextView {
  /**
   * 输入法组字中的那一段（用拼音打字、还没选字时输入框里的拼音），从文字开头数
   * 的 UTF-16 码元。没在组字时是 `null`。只读。组字的每一步照常派发 `input`。
   */
  readonly markedTextRange: NSRange | null;
}
