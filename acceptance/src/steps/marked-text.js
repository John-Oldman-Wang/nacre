// 输入法组字的范围：UITextField / UITextView 的 markedTextRange。
//
// 用拼音打字时，选字之前输入框里已经有一段拼音（组字中的文字，系统画下划线）。
// markedTextRange 是这一段的范围，没有在组字时是 null。拼音每变一次照常派发
// input，监听器里读它就知道这一次是不是还在组字。
//
// 真的输入法要真实键盘。这里由示例模块照输入法的做法调输入框的
// setMarkedText:selectedRange: / unmarkText（UITextInput 的方法）。

/**
 * 等一个条件成立，每 50 ms 看一次
 * @param {() => boolean} ready
 * @param {number} [limitMs]
 * @returns {Promise<boolean>}
 */
function until(ready, limitMs = 4000) {
  return new Promise((resolve) => {
    const deadline = Date.now() + limitMs;
    const tick = () => {
      let ok = false;
      try { ok = ready(); } catch { ok = false; }
      if (ok) { resolve(true); return; }
      if (Date.now() >= deadline) { resolve(false); return; }
      setTimeout(tick, 50);
    };
    setTimeout(tick, 0);
  });
}

/** @param {number} ms */
const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

/** @param {unknown} range */
const show = (range) => (range === null ? 'null'
  : /** @type {NSRange} */ (range).location + ',' + /** @type {NSRange} */ (range).length);

/** @param {import("../main.js").StepContext} ctx */
export async function stepMarkedText(ctx) {
  const { assert } = ctx;
  console.log('--- 输入法组字的范围 ---');
  const example = application.nativeModules.get('example');
  if (example === null) {
    assert('组字：示例模块在', false, true);
    return;
  }
  let host = ctx.vc;
  while (host.presentedViewController !== null) host = host.presentedViewController;
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  page.modalPresentationStyle = 'fullScreen';
  const field = new UITextField();
  field.frame = new CGRect(20, 120, 300, 40);
  field.borderStyle = 'roundedRect';
  const area = new UITextView();
  area.frame = new CGRect(20, 200, 300, 120);
  page.view.addSubview(field);
  page.view.addSubview(area);
  await host.presentViewController(page, { animated: false });

  /**
   * @param {string} name
   * @param {UITextField | UITextView} input
   */
  const check = async (name, input) => {
    assert(name + '：没在编辑时是 null', input.markedTextRange, null);
    assert(name + '：只读，写了抛',
           (() => { try { /** @type {any} */ (input).markedTextRange = null; return '没抛'; } catch (e) { return e instanceof Error ? e.name : String(e); } })(),
           'TypeError');
    if (!await until(() => input.becomeFirstResponder(), 8000)) {
      console.log('  ! ' + name + '：8 秒内没拿到焦点，组字这一组未验证');
      return;
    }
    let inputs = 0;
    /** @type {string[]} */
    const seen = [];
    const onInput = () => { inputs++; seen.push(show(input.markedTextRange)); };
    input.addEventListener('input', onInput);

    // input 延后一轮派发。真打字时每个键是单独的一轮，所以每一步都等它的 input
    // 到了再走下一步，不然监听器执行时下一步已经做完了
    example.call('simulateMarkedText', 'ni');
    assert(name + '：组字中，范围是那一段拼音', show(input.markedTextRange), '0,2');
    assert(name + '：组字中，文字里已经有拼音', input.text, 'ni');
    assert(name + '：组字派发 input', await until(() => inputs >= 1, 2000), true);
    assert(name + '：input 监听器里读到组字中的范围', seen[0], '0,2');
    example.call('simulateMarkedText', 'nih');
    assert(name + '：拼音变长，范围跟着变', show(input.markedTextRange), '0,3');
    await until(() => inputs >= 2, 2000);
    example.call('simulateMarkedText', null);
    assert(name + '：选完字（结束组字）之后是 null', input.markedTextRange, null);
    await wait(100);
    input.removeEventListener('input', onInput);
    input.resignFirstResponder();
  };

  await check('单行输入框', field);
  await check('多行输入框', area);
  await host.dismissViewController({ animated: false });
}
