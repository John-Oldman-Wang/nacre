// 参数从 JS 到原生：值原样到达，不经过文本。
//
// 盯的是以前会丢或者会坏的两种字符串：
//   - 开头的 U+FEFF。以前参数先写成 JSON 文本，原生用系统的解析器解回来，而它
//     会去掉每个字符串开头的一个 U+FEFF
//   - 落单的代理项（一个表情被从中间截断剩下的那一半）。系统的解析器遇到它
//     整段解析失败，这次调用的全部参数原生都收不到
// 每一条通道各验一遍：写属性、方法参数、options 里的字符串、构造参数、类方法、
// 异步方法、对象的键。外加数的几种边界。

/** 把字符串写成码元，方便在日志里看清楚看不见的字符。
 *  @param {unknown} text */
const units = (text) => (typeof text === 'string'
  ? Array.from({ length: text.length }, (_, i) => text.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0')).join(' ')
  : '（不是字符串：' + String(text) + '）');

const BOM = '﻿';
const HALF = '\ud83d';          // 😀 的前一半，落单的高代理项

/** @param {import("../main.js").StepContext} ctx */
export async function stepArgValues(ctx) {
  const { assert } = ctx;
  console.log('--- 参数的值原样到达原生 ---');

  /**
   * 跑一组；中途抛了记一条失败，后面的组照常跑。
   * @param {string} name
   * @param {() => void | Promise<void>} fn
   */
  const group = async (name, fn) => {
    try { await fn(); }
    catch (err) {
      assert('参数：「' + name + '」这一组跑完了',
             '中断：' + (err instanceof Error ? err.name + ': ' + err.message : String(err)), '跑完');
    }
  };

  await group('写属性', () => {
    const label = new UILabel();
    label.text = BOM + 'ab';
    assert('写属性：开头的 U+FEFF 还在', units(label.text), 'FEFF 0061 0062');
    label.text = BOM + BOM + 'ab';
    assert('写属性：开头两个 U+FEFF 都在', units(label.text), 'FEFF FEFF 0061 0062');
    label.text = BOM;
    assert('写属性：只有一个 U+FEFF 的字符串', units(label.text), 'FEFF');
    label.text = 'a' + BOM + 'b' + BOM;
    assert('写属性：中间和结尾的 U+FEFF（对照，以前就不丢）', units(label.text), '0061 FEFF 0062 FEFF');
    label.text = 'a' + HALF + 'b';
    assert('写属性：落单的代理项原样到了', units(label.text), '0061 D83D 0062');
    label.text = '完整的表情 😀';
    assert('写属性：成对的代理项（对照）', label.text, '完整的表情 😀');
    // 以前这一句会让整段参数解析失败。写之后别的属性还能照常读写
    label.text = HALF;
    label.numberOfLines = 3;
    assert('写了落单的代理项之后，别的属性照常', label.numberOfLines, 3);
  });

  await group('方法参数和 options', () => {
    const button = UIButton.buttonWithType('system');
    button.setTitle(BOM + '标题', { forState: ['normal'] });
    assert('方法参数：开头的 U+FEFF 还在', units(button.titleForState('normal')), 'FEFF 6807 9898');
    button.setTitle('半' + HALF, { forState: ['normal'] });
    assert('方法参数：落单的代理项原样到了', units(button.titleForState('normal')), '534A D83D');

    const alert = UIAlertController.alertControllerWithTitle(BOM + 'T', {
      message: BOM + 'M' + HALF, preferredStyle: 'alert',
    });
    assert('类方法的参数：开头的 U+FEFF 还在', units(alert.title), 'FEFF 0054');
    assert('options 里的字符串：U+FEFF 和落单的代理项都在', units(alert.message), 'FEFF 004D D83D');
  });

  await group('构造参数', () => {
    const item = new UIBarButtonItem({ title: BOM + 'A' });
    assert('构造参数：开头的 U+FEFF 还在', units(item.title), 'FEFF 0041');
    const text = new NSAttributedString(BOM + '富' + HALF);
    assert('构造参数：富文本的文字原样', units(text.string), 'FEFF 5BCC D83D');
    assert('构造参数：长度按码元算', text.length, 3);
  });

  await group('对象的键', () => {
    const storage = application.storage;
    const plain = 'nacre-arg-k';
    const marked = BOM + plain;
    storage.remove(plain);
    storage.remove(marked);
    storage.set(marked, 'with-bom');
    assert('键以 U+FEFF 开头：和不带的是两个键', storage.get(plain), null);
    assert('键以 U+FEFF 开头：读得回来', storage.get(marked), 'with-bom');
    storage.set(plain, BOM + 'value');
    assert('值以 U+FEFF 开头：读回来还在', units(storage.get(plain)), 'FEFF 0076 0061 006C 0075 0065');
    storage.remove(plain);
    storage.remove(marked);
  });

  await group('异步方法', async () => {
    // 这一条就是当初的起因：带 BOM 的 CSV，Windows 上的 Excel 靠它认编码
    const fs = application.fileSystem;
    const path = fs.documents + '/nacre-arg-bom.csv';
    await fs.writeText(path, BOM + 'name,price\n');
    const bytes = new Uint8Array(await fs.readBytes(path));
    assert('写文件：开头的 BOM 写进去了（EF BB BF）',
           Array.from(bytes.slice(0, 3), (b) => b.toString(16).toUpperCase()).join(' '), 'EF BB BF');
    assert('写文件：字节数 = 3 + 内容', bytes.length, 3 + 'name,price\n'.length);
    await fs.remove(path);

    const kc = application.keychain;
    await kc.set('nacre-arg-bom', BOM + 'secret');
    assert('异步方法（能力包）：开头的 U+FEFF 还在', units(await kc.get('nacre-arg-bom')), 'FEFF 0073 0065 0063 0072 0065 0074');
    await kc.remove('nacre-arg-bom');
  });

  await group('原生模块和列表的标识', () => {
    // 这两处走的是同一条参数通道，改之前文档里各记着一条「开头的 U+FEFF 会丢」
    const mod = application.nativeModules.get('example');
    if (mod === null || mod === undefined) {
      console.log('  ! 示例原生模块没装，「原生模块的参数原样往返」未验证');
    } else {
      assert('原生模块：开头的 U+FEFF 往返之后还在', units(mod.call('echo', BOM + 'x')), 'FEFF 0078');
      // 落单的代理项原生模块一直是拒的（Swift 的字符串装不下），这条规矩不归参数通道管
      let refused = '没抛';
      try { mod.call('echo', 'a' + HALF); } catch (err) { refused = /** @type {any} */ (err).name; }
      assert('原生模块：落单的代理项照旧被拒', refused, 'TypeError');
      const nested = /** @type {any} */ (mod.call('echo', { [BOM + 'k']: [BOM + 'v'] }));
      assert('原生模块：嵌在对象和数组里的也一样',
             nested && units(Object.keys(nested)[0]) + ' / ' + units(nested[BOM + 'k'] && nested[BOM + 'k'][0]),
             'FEFF 006B / FEFF 0076');
    }

    const snap = new NSDiffableDataSourceSnapshot();
    snap.appendSectionsWithIdentifiers(['main']);
    snap.appendItemsWithIdentifiers([BOM + 'a', 'a']);
    assert('列表的标识：带 U+FEFF 的和不带的是两个标识', snap.numberOfItems, 2);
    assert('列表的标识：读回来各是各的',
           snap.itemIdentifiers.map((id) => units(id)).join(' | '), 'FEFF 0061 | 0061');
  });

  await group('数', () => {
    const view = new UIView();
    view.alpha = 0.1 + 0.2;
    assert('数：小数原样（单精度范围内）', Math.abs(view.alpha - 0.3) < 1e-6, true);
    view.tag = 9007199254740991;
    assert('数：2^53 - 1 这样的大整数', view.tag, 9007199254740991);
    view.tag = -5;
    assert('数：负整数', view.tag, -5);
    view.frame = new CGRect(0.5, -0, 1e3, 2.25);
    assert('数：结构体的四个数', [view.frame.x, view.frame.y, view.frame.width, view.frame.height].join(','), '0.5,0,1000,2.25');
    const label = new UILabel();
    label.numberOfLines = 2;
    assert('数：整数属性', label.numberOfLines, 2);
    let thrown = '没抛';
    // @ts-expect-error 故意给转不成数的值
    try { view.alpha = 'abc'; } catch (err) { thrown = err instanceof Error ? err.name : String(err); }
    assert('数：转不成数照旧抛', thrown, 'TypeError');
  });

  await group('没有值和布尔', () => {
    const label = new UILabel();
    label.text = 'x';
    label.text = null;
    assert('null 照旧是清空', label.text, null);
    const view = new UIView();
    view.isHidden = true;
    assert('布尔 true', view.isHidden, true);
    view.isHidden = false;
    assert('布尔 false', view.isHidden, false);
    // options 的成员是 undefined 视为没带
    const button = UIButton.buttonWithType('system');
    let thrown = '没抛';
    // @ts-expect-error 类型里没有 extra 这个成员
    try { button.setTitle('t', { forState: ['normal'], extra: undefined }); }
    catch (err) { thrown = err instanceof Error ? err.name : String(err); }
    assert('options 里值是 undefined 的成员视为没带', thrown, '没抛');
  });
}
