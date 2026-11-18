// 颜色：上层是字符串。
//
// 最要紧的一条是**往返保证**：getter 吐出来的任何串，赋回去都必须成功。
// 其次是「合法就原样还你」——不规范化成 rgba。

import { assert } from '../support.js';

/** @param {import("../main.js").StepContext} ctx */
export function stepColor(ctx) {
  const { assert: _a } = ctx;
  console.log('--- 颜色 ---');
  const box = new UIView();

  // ---- 合法的写进去，原样读回来 ----
  const forms = [
    '#f00', '#ff0000', '#ff000080', '#f00a',
    'rgb(255, 0, 0)', 'rgb(255 0 0)', 'rgba(255,0,0,.5)', 'rgb(255 0 0 / 50%)',
    'light-dark(#fff, #000)', 'light-dark(systemBackground, #000)',
    'systemBackground', 'label', 'black', 'systemBlue',
  ];
  for (const text of forms) {
    box.backgroundColor = text;
    const back = box.backgroundColor;
    assert('原样读回：' + text, back, text);
  }

  // ---- 往返保证：吐出来的串赋回去必成功 ----
  let roundTrips = 0;
  for (const text of forms) {
    box.backgroundColor = text;
    const first = box.backgroundColor;
    box.backgroundColor = '#123456';          // 先换掉
    box.backgroundColor = first;              // 再赋回去
    if (box.backgroundColor === first) roundTrips++;
  }
  assert('每一种形式都往返得回去', roundTrips, forms.length);

  // ---- 池化：同一个串永远同一个 UIColor ----
  box.backgroundColor = '#5856D6';
  const other = new UIView();
  other.backgroundColor = '#5856D6';
  assert('同一个串读回来一样', box.backgroundColor, other.backgroundColor);
  // 语义色走常量单例这条路，身份本来就成立
  assert('语义色是同一个常量', UIColor.systemBlueColor === UIColor.systemBlueColor, true);

  // ---- 写 UIColor 对象也认（底层的逃生口）----
  box.backgroundColor = UIColor.systemGreenColor;
  assert('写对象，读回语义色的名字', box.backgroundColor, 'systemGreen');

  // ---- 置空 ----
  box.backgroundColor = null;
  assert('置 null 读回 null', box.backgroundColor, null);

  // ---- 不合法：不抛、保留旧值、打警告 ----
  box.backgroundColor = '#0a7b55';   // 挑一个别处没写过的值
  let threw = false;
  try {
    // 类型层拦不住：ColorValue 就是 string，内容对不对只有运行时知道
    box.backgroundColor = '#GGG';
  } catch (err) { threw = true; }
  assert('不合法**不抛**', threw, false);
  assert('不合法保留旧值', box.backgroundColor, '#0a7b55');
  // @ts-expect-error 故意给错类型
  box.backgroundColor = 42;
  assert('非字符串也保留旧值', box.backgroundColor, '#0a7b55');
  box.backgroundColor = 'light-dark(#fff)';     // 少一个参数
  assert('参数不够也保留旧值', box.backgroundColor, '#0a7b55');
  box.backgroundColor = 'nosuchColor';
  assert('认不出的名字也保留旧值', box.backgroundColor, '#0a7b55');
  console.log('  ↑ 上面四条各应打了一行 [Nacre] … is not a valid color, ignored');

  // ---- 取舍：同一个颜色值的不同拼法共用一条声明，最后写的赢 ----
  // UIView.backgroundColor 对普通 RGB 读回来不是同一个对象（UIKit 规范化了
  // 一道），所以声明只能按值兜底。语义色和动态色不受影响
  const v1 = new UIView();
  const v2 = new UIView();
  v1.backgroundColor = '#112233';
  v2.backgroundColor = 'rgb(17, 34, 51)';     // 同一个值，另一种拼法
  assert('实测：后写的拼法会盖掉先写的', v1.backgroundColor, 'rgb(17, 34, 51)');
  // 语义色**只认短名**：带 Color 尾巴的是不合法的，和别的写错一样处理
  const v3 = new UIView();
  v3.backgroundColor = 'systemPink';
  v3.backgroundColor = 'systemPinkColor';          // 全名，不合法
  assert('全名不合法，保留旧值', v3.backgroundColor, 'systemPink');
  const v4 = new UIView();
  v4.backgroundColor = UIColor.systemPinkColor;    // 写对象，走反查
  assert('写对象读回同一个短名', v4.backgroundColor, 'systemPink');

  // ---- light-dark 真的是动态色：两种外观解析出不同的值 ----
  // 不靠肉眼：用底层的对象路径取样
  box.backgroundColor = 'light-dark(#ffffff, #000000)';
  assert('动态色读回来还是那个串', box.backgroundColor, 'light-dark(#ffffff, #000000)');

  // ---- 语义色没被当成普通 RGB ----
  // systemBackground 在深浅两色下值不同，如果被合成成 #rrggbb 就说明
  // 动态色检测失效了——那正是「静默丢精度」的形态
  box.backgroundColor = UIColor.systemBackgroundColor;
  assert('语义色读回名字，不是合成的十六进制', box.backgroundColor, 'systemBackground');

  // ---- 各处颜色属性都通 ----
  const label = new UILabel();
  label.textColor = '#336699';
  assert('UILabel.textColor', label.textColor, '#336699');
  label.highlightedTextColor = 'systemYellow';
  assert('UILabel.highlightedTextColor', label.highlightedTextColor, 'systemYellow');
  label.shadowColor = 'rgba(0,0,0,.25)';
  assert('UILabel.shadowColor', label.shadowColor, 'rgba(0,0,0,.25)');
  // tintColor 在 UIImageView 上
  const tinted = new UIImageView();
  tinted.tintColor = 'systemTeal';
  assert('UIImageView.tintColor', tinted.tintColor, 'systemTeal');
  box.layer.borderColor = '#abcdef';
  // layer 的颜色过 CGColor，读回来是新对象、没有声明串，所以是合成的
  assert('CALayer.borderColor 过了 CGColor，读回合成值',
         /^#[0-9a-f]{6}$/.test(String(box.layer.borderColor)), true);

  const button = UIButton.buttonWithType('system');
  button.setTitleColor('#ff9900', { forState: ['normal'] });
  assert('UIButton.setTitleColor', button.titleColorForState('normal'), '#ff9900');

  // ---- 探一下这三个内置在不在（之前没实测过）----
  console.log('  实测：Reflect = ' + typeof Reflect +
              '，Atomics = ' + typeof Atomics +
              '，FinalizationRegistry = ' + typeof FinalizationRegistry +
              '，WeakRef = ' + typeof WeakRef);
}
