// 多行输入框的拦截事件：系统当场来问「要不要」，监听器里 preventDefault() 就是
// 「不要」。形状和单行输入框的那几个一样。
//
//   beforefocus  ← textViewShouldBeginEditing:
//   beforeblur   ← textViewShouldEndEditing:
//   beforeinput  ← textView:shouldChangeTextInRange:replacementText:
//   linkclick    ← textView:primaryActionForTextItem:defaultAction:（点了富文本里的链接）
//
// beforefocus / beforeblur 走真的路径：becomeFirstResponder / resignFirstResponder
// 会去问委托。另外两个要真实的键盘和手指，由示例模块照 UIKit 的做法去问委托
// （simulateTextViewAsk），把答案交回来。

/** @param {import("../main.js").StepContext} ctx */
export async function stepTextViewShould(ctx) {
  const { assert } = ctx;
  console.log('--- 多行输入框的拦截事件 ---');
  const example = application.nativeModules.get('example');
  if (example === null) {
    assert('多行拦截：示例模块在', false, true);
    return;
  }
  let host = ctx.vc;
  while (host.presentedViewController !== null) host = host.presentedViewController;
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  page.modalPresentationStyle = 'fullScreen';
  const area = new UITextView();
  area.frame = new CGRect(20, 120, 300, 160);
  area.tag = 7201;
  area.text = '0123456789';
  page.view.addSubview(area);
  await host.presentViewController(page, { animated: false });

  /**
   * @param {string} kind
   * @param {NativeModuleArgument[]} args
   */
  const ask = (kind, ...args) => example.call('simulateTextViewAsk', 7201, kind, ...args);

  try {
    // ---- 没有监听器：照默认 ----
    assert('多行拦截：没有监听器时，问要不要改，答要', ask('change', 0, 0, 'x'), true);

    // ---- beforefocus ----
    /** @type {Event | null} */
    let focusEvent = null;
    let refuseFocus = true;
    /** @param {Event} e */
    const onFocus = (e) => { focusEvent = e; if (refuseFocus) e.preventDefault(); };
    area.addEventListener('beforefocus', onFocus);
    assert('beforefocus：preventDefault 之后 becomeFirstResponder 返回 false', area.becomeFirstResponder(), false);
    assert('beforefocus：没进入编辑', area.isFirstResponder, false);
    const fe = /** @type {Event | null} */ (focusEvent);
    assert('beforefocus：当场派发，target 是多行输入框', fe !== null && fe.target === area, true);
    assert('beforefocus：可以取消', fe !== null && fe.cancelable, true);
    refuseFocus = false;
    assert('beforefocus：不取消就进入编辑', area.becomeFirstResponder(), true);

    // ---- beforeblur ----
    let refuseBlur = true;
    /** @param {Event} e */
    const onBlur = (e) => { if (refuseBlur) e.preventDefault(); };
    area.addEventListener('beforeblur', onBlur);
    assert('beforeblur：preventDefault 之后 resignFirstResponder 返回 false', area.resignFirstResponder(), false);
    assert('beforeblur：焦点还在', area.isFirstResponder, true);
    refuseBlur = false;
    assert('beforeblur：不取消就结束编辑', area.resignFirstResponder(), true);
    area.removeEventListener('beforefocus', onFocus);
    area.removeEventListener('beforeblur', onBlur);

    // ---- beforeinput ----
    /** @type {UITextViewBeforeInputEvent | null} */
    let inputEvent = null;
    let refuseInput = false;
    /** @param {UITextViewBeforeInputEvent} e */
    const onInput = (e) => { inputEvent = e; if (refuseInput) e.preventDefault(); };
    area.addEventListener('beforeinput', onInput);
    assert('beforeinput：不取消，答要', ask('change', 2, 1, 'X'), true);
    const ie = /** @type {UITextViewBeforeInputEvent | null} */ (inputEvent);
    assert('beforeinput：range 是 NSRange', ie !== null && ie.range instanceof NSRange, true);
    assert('beforeinput：range 是要换掉的那一段', ie !== null ? ie.range.location + ',' + ie.range.length : '', '2,1');
    assert('beforeinput：replacementString 是要换上的文字', ie !== null && ie.replacementString, 'X');
    assert('beforeinput：可以取消', ie !== null && ie.cancelable, true);
    refuseInput = true;
    assert('beforeinput：preventDefault 就答不要', ask('change', 0, 0, 'y'), false);
    area.removeEventListener('beforeinput', onInput);
    assert('beforeinput：摘掉监听器之后照默认答要', ask('change', 0, 0, 'y'), true);

    // ---- linkclick ----
    area.isEditable = false;
    area.attributedText = new NSAttributedString('阅读用户协议', { link: 'https://example.com/terms' });
    const noListener = ask('link', 'https://example.com/terms', 2, 4);
    if (noListener === null) {
      console.log('  ! linkclick：这台系统上造不出链接的 UITextItem，交给真实点击验证，未验证');
    } else {
      assert('linkclick：没有监听器，照系统默认打开', noListener, 'default');
      /** @type {UITextViewLinkClickEvent | null} */
      let linkEvent = null;
      let refuseLink = false;
      /** @param {UITextViewLinkClickEvent} e */
      const onLink = (e) => { linkEvent = e; if (refuseLink) e.preventDefault(); };
      area.addEventListener('linkclick', onLink);
      assert('linkclick：不取消，照系统默认打开', ask('link', 'https://example.com/terms', 2, 4), 'default');
      const le = /** @type {UITextViewLinkClickEvent | null} */ (linkEvent);
      assert('linkclick：url 是链接的地址', le !== null && le.url, 'https://example.com/terms');
      assert('linkclick：range 是链接那一段', le !== null ? le.range.location + ',' + le.range.length : '', '2,4');
      assert('linkclick：range 是 NSRange', le !== null && le.range instanceof NSRange, true);
      assert('linkclick：可以取消', le !== null && le.cancelable, true);
      assert('linkclick：target 是多行输入框', le !== null && le.target === area, true);
      refuseLink = true;
      assert('linkclick：preventDefault 就不打开', ask('link', 'https://example.com/terms', 2, 4), 'none');
      area.removeEventListener('linkclick', onLink);
      assert('linkclick：摘掉监听器之后照系统默认打开', ask('link', 'https://example.com/terms', 2, 4), 'default');
    }

    // ---- 别的类上是自定义事件 ----
    const label = new UILabel();
    let custom = 0;
    label.addEventListener('linkclick', () => { custom++; });
    label.dispatchEvent(new Event('linkclick'));
    assert('多行拦截：别的类上 linkclick 当自定义事件', custom, 1);

    // 滚动事件和拦截事件共用委托的槽位：订着 beforeinput 时滚动照样派发
    let scrolled = 0;
    const onScroll = () => { scrolled++; };
    area.addEventListener('scroll', onScroll);
    area.addEventListener('beforeinput', onInput);
    area.contentOffset = new CGPoint(0, 1);
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert('多行拦截：订着 beforeinput 时 scroll 照样来', scrolled > 0, true);
    area.removeEventListener('scroll', onScroll);
    area.removeEventListener('beforeinput', onInput);
  } finally {
    await host.dismissViewController({ animated: false });
  }
}
