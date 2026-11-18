// 表示「正在进行」的两个视图：UIActivityIndicatorView（转圈）和
// UIProgressView（进度条）。它们是 UIView 的子类，不是控件，没有事件。
//
// 这里的期望值都是动手前用原生探针在 iPhone Air 模拟器（iOS 27.2）上量的，
// 不是照头文件的注释写的。量到的几条和直觉不一样的：
//   - 新建的转圈是**隐藏的**（hidesWhenStopped 默认 true，而它还没开始转）
//   - 新建的两种视图 frame 的宽都是 0；转圈的高也是 0
//   - 进度条的高由样式定死：写 frame 改不动，只有高度约束能改
//   - 进度条的着色和图片二选一：写一个，另一个被系统清掉

import { enumIgnored, ENUM_IGNORED } from '../support.js';

/**
 * @param {string} label
 * @param {() => void} fn
 * @param {string} needle 报错信息里应该有的一段
 */
function throws(label, fn, needle) {
  try {
    fn();
    console.log('  ✗ ' + label + ' = 没抛（期望抛 ' + needle + '）');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const passed = err instanceof TypeError && message.includes(needle);
    console.log((passed ? '  ✓ ' : '  ✗ ') + label + ' = ' + message +
                (passed ? '' : '（期望 TypeError，信息里有 ' + needle + '）'));
  }
}

// 一组断言中途抛了（比如类还没接进来）只废这一组，不连累后面的步骤
/**
 * @param {string} name
 * @param {() => void} fn
 */
function group(name, fn) {
  try {
    fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log('  ✗ ' + name + ' 这一组中断了 = ' + message + '（期望跑完）');
  }
}

/** @param {import("../main.js").StepContext} ctx */
export function stepIndicators(ctx) {
  const { assert } = ctx;
  const host = ctx.section('转圈和进度条：UIActivityIndicatorView / UIProgressView', 150);

  // =====================================================================
  console.log('--- UIActivityIndicatorView ---');

  group('转圈：默认值', () => {
    const spinner = new UIActivityIndicatorView();
    assert('是 UIView 的子类', spinner instanceof UIView, true);
    assert('不是控件', spinner instanceof UIControl, false);
    assert('默认样式 medium', spinner.activityIndicatorViewStyle, 'medium');
    assert('默认停下就隐藏', spinner.hidesWhenStopped, true);
    assert('默认没在转', spinner.isAnimating, false);
    // 还没开始转 + 停下就隐藏 = 一建出来就是隐藏的
    assert('所以新建的转圈是隐藏的', spinner.isHidden, true);
    assert('默认颜色是 secondaryLabel', spinner.color, 'secondaryLabel');
    assert('默认 frame 宽 0', spinner.frame.width, 0);
    assert('默认 frame 高 0', spinner.frame.height, 0);
    assert('medium 自己想要的大小是 20×20',
           spinner.intrinsicContentSize.width + '×' + spinner.intrinsicContentSize.height,
           '20×20');
  });

  group('转圈：样式', () => {
    const spinner = new UIActivityIndicatorView();
    spinner.activityIndicatorViewStyle = 'large';
    assert('样式写得进去', spinner.activityIndicatorViewStyle, 'large');
    assert('large 自己想要的大小是 37×37',
           spinner.intrinsicContentSize.width + '×' + spinner.intrinsicContentSize.height,
           '37×37');
    // 换样式只改「想要的大小」，frame 不跟着动
    assert('换样式不改 frame', spinner.frame.width, 0);
    spinner.sizeToFit();
    assert('sizeToFit 之后 frame 是 37×37',
           spinner.frame.width + '×' + spinner.frame.height, '37×37');
    spinner.activityIndicatorViewStyle = 'medium';
    assert('换回 medium', spinner.activityIndicatorViewStyle, 'medium');
    assert('想要的大小回到 20', spinner.intrinsicContentSize.width, 20);

    assert('不认识的样式：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这种样式
      spinner.activityIndicatorViewStyle = 'small';
    }, () => spinner.activityIndicatorViewStyle), ENUM_IGNORED);
    // 头文件里那三个已经废弃的值（iOS 13 起）不接
    for (const old of ['gray', 'white', 'whiteLarge']) {
      assert('废弃的样式 ' + old + '：不抛、值不变', enumIgnored(() => {
        // @ts-expect-error 废弃的样式不接
        spinner.activityIndicatorViewStyle = old;
      }, () => spinner.activityIndicatorViewStyle), ENUM_IGNORED);
    }
    assert('样式给数字：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 样式是字符串
      spinner.activityIndicatorViewStyle = 101;
    }, () => spinner.activityIndicatorViewStyle), ENUM_IGNORED);
    assert('被拒之后原值没动', spinner.activityIndicatorViewStyle, 'medium');
  });

  group('转圈：开始和停下', () => {
    const spinner = new UIActivityIndicatorView();
    assert('startAnimating 没有返回值', spinner.startAnimating(), undefined);
    assert('开始之后在转', spinner.isAnimating, true);
    assert('开始之后自己显示出来', spinner.isHidden, false);
    spinner.startAnimating();
    assert('再调一次还是在转', spinner.isAnimating, true);
    assert('stopAnimating 没有返回值', spinner.stopAnimating(), undefined);
    assert('停下之后不转了', spinner.isAnimating, false);
    assert('停下之后自己隐藏', spinner.isHidden, true);
    spinner.stopAnimating();
    assert('没在转时再停一次不出错', spinner.isAnimating, false);

    try {
      // @ts-expect-error isAnimating 只读
      spinner.isAnimating = true;
      console.log('  ✗ isAnimating 只读 = 居然能写（期望抛 TypeError）');
    } catch (err) {
      assert('isAnimating 只读', err instanceof TypeError, true);
    }
    assert('写不进去，还是没在转', spinner.isAnimating, false);
  });

  group('转圈：hidesWhenStopped', () => {
    const spinner = new UIActivityIndicatorView();
    spinner.hidesWhenStopped = false;
    assert('hidesWhenStopped 写得进去', spinner.hidesWhenStopped, false);
    // 实测：改这个属性当场生效，不用等下一次开始或停下
    assert('改成 false 当场显示出来', spinner.isHidden, false);
    spinner.startAnimating();
    spinner.stopAnimating();
    assert('停下之后仍然显示', spinner.isHidden, false);
    spinner.hidesWhenStopped = true;
    assert('改回 true 当场隐藏', spinner.isHidden, true);
    // 照 Web IDL 转布尔：0 是 false，非空字符串是 true
    // @ts-expect-error 类型上要布尔，运行时照 Web IDL 转
    spinner.hidesWhenStopped = 0;
    assert('0 转成 false', spinner.hidesWhenStopped, false);
    // @ts-expect-error 同上
    spinner.hidesWhenStopped = 'false';
    assert("'false' 是非空字符串，转成 true", spinner.hidesWhenStopped, true);
  });

  group('转圈：颜色', () => {
    const spinner = new UIActivityIndicatorView();
    spinner.color = '#FF3B30';
    assert('颜色读回来是写进去的那个串', spinner.color, '#FF3B30');
    spinner.color = UIColor.systemBlueColor;
    assert('也收 UIColor 对象，读出来是字符串', spinner.color, 'systemBlue');
    spinner.color = 'systemOrange';
    spinner.activityIndicatorViewStyle = 'large';
    assert('换样式不会把颜色改回去', spinner.color, 'systemOrange');

    let threw = false;
    try {
      spinner.color = 'not-a-color';
    } catch (err) {
      threw = true;
    }
    assert('不合法的颜色不抛', threw, false);
    assert('不合法的颜色保留旧值', spinner.color, 'systemOrange');

    // 头文件标的是 null_resettable：写 null 不是「没有颜色」，是退回默认的
    spinner.color = null;
    assert('写 null 退回默认颜色', spinner.color, 'secondaryLabel');
  });

  group('转圈：不能继承', () => {
    throws('继承它，new 的时候抛',
           () => { new (class Mine extends UIActivityIndicatorView {})(); },
           'Illegal constructor');
  });

  // =====================================================================
  console.log('--- UIProgressView ---');

  group('进度条：默认值', () => {
    const bar = new UIProgressView();
    assert('是 UIView 的子类', bar instanceof UIView, true);
    assert('不是控件', bar instanceof UIControl, false);
    assert('默认样式 default', bar.progressViewStyle, 'default');
    assert('默认进度 0', bar.progress, 0);
    assert('默认没有已完成部分的着色', bar.progressTintColor, null);
    assert('默认没有未完成部分的着色', bar.trackTintColor, null);
    assert('默认没有已完成部分的图片', bar.progressImage, null);
    assert('默认没有未完成部分的图片', bar.trackImage, null);
    assert('默认不隐藏', bar.isHidden, false);
    assert('默认 frame 宽 0', bar.frame.width, 0);
    assert('默认 frame 高 4', bar.frame.height, 4);
    // 宽度它没有意见（-1 是系统的「没有想要的值」），高度是 4
    assert('自己想要的大小：宽没有意见，高 4',
           bar.intrinsicContentSize.width + '×' + bar.intrinsicContentSize.height, '-1×4');
    // NSProgress 没接，所以这个属性不存在，而不是一个读了才抛的占位
    assert('observedProgress 没接：属性不存在', 'observedProgress' in bar, false);
  });

  group('进度条：进度', () => {
    const bar = new UIProgressView();
    bar.progress = 0.5;
    assert('进度写得进去', bar.progress, 0.5);
    // 原生存的是 32 位浮点，读回来是离它最近的那个 32 位数
    bar.progress = 0.3;
    assert('读回来是 32 位浮点能表示的值', bar.progress, Math.fround(0.3));
    bar.progress = 1.5;
    assert('大于 1 被收到 1', bar.progress, 1);
    bar.progress = -0.5;
    assert('小于 0 被收到 0', bar.progress, 0);

    // 照 Web IDL 转数
    // @ts-expect-error 类型上要数，运行时照 Web IDL 转
    bar.progress = '0.25';
    assert("'0.25' 转成 0.25", bar.progress, 0.25);
    // @ts-expect-error 同上
    bar.progress = null;
    assert('null 转成 0', bar.progress, 0);

    bar.progress = 0.75;
    throws('进度给 undefined 被拒', () => {
      // @ts-expect-error 转不出数
      bar.progress = undefined;
    }, 'progress must be a finite number');
    throws('进度给 NaN 被拒', () => { bar.progress = NaN; },
           'progress must be a finite number');
    throws('进度给 Infinity 被拒', () => { bar.progress = Infinity; },
           'progress must be a finite number');
    throws('进度给转不出数的字符串被拒', () => {
      // @ts-expect-error 转不出数
      bar.progress = 'half';
    }, 'progress must be a finite number');
    assert('被拒之后原值没动', bar.progress, 0.75);
  });

  group('进度条：setProgress', () => {
    const bar = new UIProgressView();
    assert('setProgress 没有返回值', bar.setProgress(0.8, { animated: true }), undefined);
    // 带动画时属性当场就是目标值，不是动画进行到一半的值
    assert('带动画：读回来当场是目标值', bar.progress, Math.fround(0.8));
    bar.setProgress(0.2, { animated: false });
    assert('不带动画', bar.progress, Math.fround(0.2));
    bar.setProgress(0.6);
    assert('不传 options 就是不带动画', bar.progress, Math.fround(0.6));
    // @ts-expect-error options 传 null 视为空对象
    bar.setProgress(0.4, null);
    assert('options 传 null 视为没带', bar.progress, Math.fround(0.4));
    bar.setProgress(0.1, { animated: undefined });
    assert('animated 是 undefined 视为没带', bar.progress, Math.fround(0.1));
    bar.setProgress(2, { animated: true });
    assert('大于 1 被收到 1', bar.progress, 1);
    bar.setProgress(-1);
    assert('小于 0 被收到 0', bar.progress, 0);

    bar.setProgress(0.5);
    throws('setProgress 不给进度被拒', () => {
      // @ts-expect-error 少了进度
      bar.setProgress();
    }, 'progress must be a finite number');
    throws('setProgress 给转不出数的值被拒', () => {
      // @ts-expect-error 转不出数
      bar.setProgress('full', { animated: true });
    }, 'progress must be a finite number');
    assert('被拒之后原值没动', bar.progress, 0.5);
  });

  group('进度条：样式和高度', () => {
    const bar = new UIProgressView();
    bar.progressViewStyle = 'bar';
    assert('样式写得进去', bar.progressViewStyle, 'bar');
    // bar 比 default 细。具体多高和屏幕是几倍的有关（3 倍屏上量到 2.67）
    assert('bar 样式比 4 细', bar.frame.height < 4, true);
    bar.progressViewStyle = 'default';
    assert('换回 default 高度回到 4', bar.frame.height, 4);

    assert('不认识的样式：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这种样式
      bar.progressViewStyle = 'thick';
    }, () => bar.progressViewStyle), ENUM_IGNORED);
    assert('被拒之后原值没动', bar.progressViewStyle, 'default');

    // 高度由样式定死：写 frame 只有宽度进得去
    bar.frame = new CGRect(0, 0, 200, 30);
    assert('写 frame：宽度进去了', bar.frame.width, 200);
    assert('写 frame：高度没进去，还是 4', bar.frame.height, 4);

    // 要改高度，用约束
    const thick = new UIProgressView();
    thick.translatesAutoresizingMaskIntoConstraints = false;
    host.addSubview(thick);
    NSLayoutConstraint.activateConstraints([
      thick.leadingAnchor.constraintEqualToAnchor(host.leadingAnchor, { constant: 16 }),
      thick.widthAnchor.constraintEqualToConstant(120),
      thick.topAnchor.constraintEqualToAnchor(host.topAnchor, { constant: 8 }),
      thick.heightAnchor.constraintEqualToConstant(12),
    ]);
    // 对区块自己排，不对 ctx.vc.view 排：这一步运行时窗口的根页面已经被
    // 导航那一步换掉了，ctx.vc.view 不在窗口里，对它排不到这个区块
    host.layoutIfNeeded();
    assert('高度约束改得动高度', thick.frame.height, 12);
    thick.removeFromSuperview();
  });

  group('进度条：着色', () => {
    const bar = new UIProgressView();
    bar.progressTintColor = '#34C759';
    assert('已完成部分的着色读回来是原样', bar.progressTintColor, '#34C759');
    bar.trackTintColor = 'systemGray';
    assert('未完成部分的着色读回来是原样', bar.trackTintColor, 'systemGray');
    bar.progressTintColor = UIColor.systemRedColor;
    assert('也收 UIColor 对象', bar.progressTintColor, 'systemRed');

    let threw = false;
    try {
      bar.progressTintColor = 'not-a-color';
      bar.trackTintColor = '#GGG';
    } catch (err) {
      threw = true;
    }
    assert('不合法的颜色不抛', threw, false);
    assert('不合法的颜色保留旧值（已完成部分）', bar.progressTintColor, 'systemRed');
    assert('不合法的颜色保留旧值（未完成部分）', bar.trackTintColor, 'systemGray');

    bar.progressTintColor = null;
    bar.trackTintColor = null;
    assert('已完成部分的着色可以清掉', bar.progressTintColor, null);
    assert('未完成部分的着色可以清掉', bar.trackTintColor, null);
  });

  group('进度条：图片', () => {
    const bar = new UIProgressView();
    const star = UIImage.systemImageNamed('star.fill');
    const circle = UIImage.systemImageNamed('circle.fill');
    bar.progressImage = star;
    bar.trackImage = circle;
    assert('已完成部分的图片读回来是同一个对象', bar.progressImage === star, true);
    assert('未完成部分的图片读回来是同一个对象', bar.trackImage === circle, true);

    throws('图片给颜色对象被拒', () => {
      // @ts-expect-error 要的是 UIImage
      bar.progressImage = UIColor.redColor;
    }, 'progressImage needs a UIImage or null');
    throws('图片给字符串被拒', () => {
      // @ts-expect-error 要的是 UIImage
      bar.trackImage = 'star.fill';
    }, 'trackImage needs a native object or null');
    assert('被拒之后原值没动（已完成部分）', bar.progressImage === star, true);
    assert('被拒之后原值没动（未完成部分）', bar.trackImage === circle, true);

    bar.progressImage = null;
    bar.trackImage = null;
    assert('已完成部分的图片可以清掉', bar.progressImage, null);
    assert('未完成部分的图片可以清掉', bar.trackImage, null);

    // 着色和图片二选一（实测）：写图片，同一侧的着色被系统清掉；
    // 写着色，同一侧的图片被清掉；把着色写成 null 不影响图片
    bar.progressTintColor = 'systemRed';
    bar.progressImage = star;
    assert('写图片之后，同一侧的着色没了', bar.progressTintColor, null);
    bar.progressTintColor = 'systemGreen';
    assert('再写着色，同一侧的图片没了', bar.progressImage, null);
    bar.progressImage = star;
    bar.progressTintColor = null;
    assert('着色写成 null 不影响图片', bar.progressImage === star, true);

    bar.trackTintColor = 'systemRed';
    bar.trackImage = circle;
    assert('另一侧也一样：写图片，着色没了', bar.trackTintColor, null);
    bar.trackTintColor = 'systemGreen';
    assert('另一侧也一样：写着色，图片没了', bar.trackImage, null);
    // 两侧互不影响
    assert('两侧互不影响：已完成部分的图片还在', bar.progressImage === star, true);
  });

  group('进度条：不能继承', () => {
    throws('继承它，new 的时候抛',
           () => { new (class Mine extends UIProgressView {})(); },
           'Illegal constructor');
  });

  // =====================================================================
  // 屏幕上的东西。看不看得见、转不转、进度条动不动，要人看
  group('屏幕上', () => {
    const guide = host.safeAreaLayoutGuide;

    // 第一排：三个转圈
    const row = new UIStackView();
    row.translatesAutoresizingMaskIntoConstraints = false;
    row.spacing = 24;
    row.alignment = 'center';
    host.addSubview(row);

    const small = new UIActivityIndicatorView();
    small.startAnimating();
    const large = new UIActivityIndicatorView();
    large.activityIndicatorViewStyle = 'large';
    large.color = 'systemOrange';
    large.startAnimating();
    // 停着但不隐藏：看得到一个不动的转圈
    const still = new UIActivityIndicatorView();
    still.hidesWhenStopped = false;
    for (const s of [small, large, still]) row.addArrangedSubview(s);

    // 下面三条进度条：默认的、换了着色并加高的、bar 样式的
    const plain = new UIProgressView();
    const tinted = new UIProgressView();
    tinted.progressTintColor = 'systemGreen';
    tinted.trackTintColor = '#D1D1D6';
    const thin = new UIProgressView();
    thin.progressViewStyle = 'bar';
    thin.progress = 0.5;

    const bars = [plain, tinted, thin];
    /** @type {NSLayoutConstraint[]} */
    const constraints = [
      row.leadingAnchor.constraintEqualToAnchor(guide.leadingAnchor, { constant: 16 }),
      row.topAnchor.constraintEqualToAnchor(guide.topAnchor, { constant: 8 }),
      row.heightAnchor.constraintEqualToConstant(44),
      tinted.heightAnchor.constraintEqualToConstant(10),
    ];
    bars.forEach((bar, i) => {
      bar.translatesAutoresizingMaskIntoConstraints = false;
      host.addSubview(bar);
      constraints.push(
        bar.leadingAnchor.constraintEqualToAnchor(guide.leadingAnchor, { constant: 16 }),
        bar.trailingAnchor.constraintEqualToAnchor(guide.trailingAnchor, { constant: -16 }),
        bar.topAnchor.constraintEqualToAnchor(guide.topAnchor, { constant: 68 + i * 26 }),
      );
    });
    NSLayoutConstraint.activateConstraints(constraints);
    host.layoutIfNeeded();

    // 排进栈视图之后，大小来自它自己想要的大小
    assert('排进栈视图：medium 是 20×20',
           small.frame.width + '×' + small.frame.height, '20×20');
    assert('排进栈视图：large 是 37×37',
           large.frame.width + '×' + large.frame.height, '37×37');
    assert('进度条被约束拉开：宽 = 安全区宽 - 32',
           plain.frame.width, guide.layoutFrame.width - 32);
    assert('没给高度约束的那条高 4', plain.frame.height, 4);
    assert('给了高度约束的那条高 10', tinted.frame.height, 10);

    // 每 0.6 秒走一格，走满了从头来
    let step = 0;
    setInterval(() => {
      step = (step + 1) % 11;
      const value = step / 10;
      // 回到 0 的那一下不带动画，不然会看到进度条倒着走
      plain.setProgress(value, { animated: step !== 0 });
      tinted.setProgress(value, { animated: step !== 0 });
    }, 600);

    console.log('  · 屏幕上应该看到（要人看）：一排三个转圈——小的在转、大的橙色在转、' +
                '第三个不动；下面三条进度条——前两条每 0.6 秒走一格（第二条绿色、更粗），' +
                '第三条细的停在一半');
  });
}
