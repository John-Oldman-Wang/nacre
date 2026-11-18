import { customEventWorks, enumIgnored, ENUM_IGNORED } from '../support.js';
// 数值控件：UISwitch、UISlider、UIStepper、UISegmentedControl、UIPageControl、
// UIDatePicker。六个都是 UIControl 的子类，「值变了」听 change。
//
// 期望值的来历：默认值和边界行为是用一个不带界面的原生小程序在 iPhone Air
// 模拟器（iOS 27.2）上量出来的，见 docs/internals/value-controls.md。
// 标着「期望没量过」的那几条量不了（那个小程序里没有 UIApplication，
// 控件事件派发不出去），是按 UIKit 的惯例写的。

/** @param {import("../main.js").StepContext} ctx */
export function stepValueControls(ctx) {
  const { assert } = ctx;
  console.log('--- 数值控件 ---');

  // 先只合测试、还没有实现时：点名缺哪几个类就停，不让一个 ReferenceError
  // 把排在后面的步骤一起带走
  const missing = ['UISwitch', 'UISlider', 'UIStepper', 'UISegmentedControl',
                   'UIPageControl', 'UIDatePicker']
    .filter((name) => typeof (/** @type {any} */ (globalThis))[name] !== 'function');
  if (missing.length > 0) {
    for (const name of missing) console.log('  ✗ 运行时里还没有 ' + name);
    return;
  }

  /**
   * 这一段应该抛 TypeError。抛了别的、或者没抛，都算失败
   * @param {string} label
   * @param {() => void} fn
   */
  const rejects = (label, fn) => {
    try {
      fn();
      console.log('  ✗ ' + label + '：居然通过了');
    } catch (err) {
      const e = /** @type {Error} */ (err);
      console.log((e instanceof TypeError ? '  ✓ ' : '  ✗ ') + label + '：' +
                  (e instanceof TypeError ? '' : '抛的不是 TypeError，') + e.message);
    }
  };
  /** 还没接的成员：类上根本没有这个名字，不是「有但读了才抛」
   * @param {object} target @param {string[]} names */
  const absent = (target, names) => {
    for (const name of names) {
      assert('还没接：' + target.constructor.name + '.' + name + ' 不存在', name in target, false);
    }
  };

  const star = UIImage.systemImageNamed('star.fill');
  const circle = UIImage.systemImageNamed('circle.fill');
  if (star === null || circle === null) {
    console.log('  ✗ 取不到 SF Symbol，这一步跑不了');
    return;
  }

  // =====================================================================
  // UISwitch
  // =====================================================================
  console.log('  --- UISwitch ---');
  {
    const sw = new UISwitch();
    assert('UISwitch 是 UIControl', sw instanceof UIControl, true);
    assert('也是 UIView', sw instanceof UIView, true);
    assert('默认是关的', sw.isOn, false);
    assert('默认 onTintColor 是 null（用系统的绿色）', sw.onTintColor, null);
    assert('默认 thumbTintColor 是 null', sw.thumbTintColor, null);
    assert('默认 isEnabled（继承自 UIControl）', sw.isEnabled, true);
    assert('默认 state', sw.state.join(','), 'normal');

    sw.isOn = true;
    assert('isOn 可写', sw.isOn, true);
    sw.isOn = false;
    // @ts-expect-error 类型定义要布尔，运行时按真假值转
    sw.isOn = 'false';
    assert("isOn = 'false'：非空字符串是真", sw.isOn, true);
    // @ts-expect-error 同上
    sw.isOn = 0;
    assert('isOn = 0：假', sw.isOn, false);

    sw.setOn(true);
    assert('setOn(true)', sw.isOn, true);
    sw.setOn(false, { animated: true });
    assert('setOn(false, { animated: true })：值当场就变', sw.isOn, false);
    sw.setOn(true, { animated: undefined });
    assert('animated 是 undefined 视为没带', sw.isOn, true);
    sw.setOn(false, {});

    sw.onTintColor = '#34c759';
    assert('onTintColor 写字符串，读回原样', sw.onTintColor, '#34c759');
    sw.onTintColor = UIColor.systemRedColor;
    assert('onTintColor 写 UIColor，读回名字', sw.onTintColor, 'systemRed');
    sw.onTintColor = 'not-a-color';
    assert('onTintColor 写了不合法的颜色：警告，保留旧值', sw.onTintColor, 'systemRed');
    sw.onTintColor = null;
    assert('onTintColor 写 null：回到系统默认', sw.onTintColor, null);
    sw.thumbTintColor = 'rgba(255, 255, 255, 0.5)';
    assert('thumbTintColor 可写', sw.thumbTintColor, 'rgba(255, 255, 255, 0.5)');
    sw.thumbTintColor = null;
    assert('thumbTintColor 写 null', sw.thumbTintColor, null);

    // 大小由系统定，写 frame 改不了它（头文件：the frame size is ignored）
    const before = sw.frame.width;
    sw.frame = new CGRect(0, 0, 200, 100);
    assert('写 frame 改不了开关的宽', sw.frame.width, before);
    assert('也改不了高', sw.frame.height < 100, true);

    // Mac 上才有效的三个成员和 iOS 7 起无效的两张图，都没接
    absent(sw, ['title', 'style', 'preferredStyle', 'onImage', 'offImage']);
  }

  // =====================================================================
  // UISlider
  // =====================================================================
  console.log('  --- UISlider ---');
  {
    const slider = new UISlider();
    assert('UISlider 是 UIControl', slider instanceof UIControl, true);
    assert('默认 value', slider.value, 0);
    assert('默认 minimumValue', slider.minimumValue, 0);
    assert('默认 maximumValue', slider.maximumValue, 1);
    assert('默认 isContinuous', slider.isContinuous, true);
    assert('默认 minimumValueImage', slider.minimumValueImage, null);
    assert('默认 maximumValueImage', slider.maximumValueImage, null);
    assert('默认 minimumTrackTintColor', slider.minimumTrackTintColor, null);
    assert('默认 maximumTrackTintColor', slider.maximumTrackTintColor, null);
    assert('默认 thumbTintColor', slider.thumbTintColor, null);
    assert('默认 sliderStyle', slider.sliderStyle, 'default');
    assert('默认没有自定义的滑块图', slider.thumbImageForState('normal'), null);
    assert('默认 currentThumbImage', slider.currentThumbImage, null);
    assert('默认 currentMinimumTrackImage', slider.currentMinimumTrackImage, null);
    assert('默认 currentMaximumTrackImage', slider.currentMaximumTrackImage, null);

    slider.value = 0.5;
    assert('value 可写', slider.value, 0.5);
    slider.value = 0.3;
    // 原生是 32 位 float
    assert('value = 0.3 读回来是单精度的 0.3', slider.value, Math.fround(0.3));
    slider.value = 5;
    assert('超过上限：钉在 maximumValue', slider.value, 1);
    slider.value = -5;
    assert('低于下限：钉在 minimumValue', slider.value, 0);
    // @ts-expect-error 类型定义要数字，运行时会转
    slider.value = '0.25';
    assert('value 给数字字符串：按数用', slider.value, 0.25);
    rejects('value 转不出数', () => {
      // @ts-expect-error 转不出数
      slider.value = 'half';
    });
    rejects('value = undefined', () => {
      // @ts-expect-error 不能是 undefined
      slider.value = undefined;
    });
    assert('被拒之后原值没动', slider.value, 0.25);

    slider.maximumValue = 100;
    assert('maximumValue 可写', slider.maximumValue, 100);
    slider.minimumValue = 10;
    assert('minimumValue 可写', slider.minimumValue, 10);
    assert('抬高下限，value 跟着被钉上来', slider.value, 10);
    slider.value = 40;
    slider.setValue(70);
    assert('setValue(70)', slider.value, 70);
    slider.setValue(30, { animated: true });
    assert('setValue(30, { animated: true })：值当场就变', slider.value, 30);
    slider.setValue(999, { animated: false });
    assert('setValue 也会被钉住', slider.value, 100);
    rejects('setValue 转不出数', () => {
      // @ts-expect-error 转不出数
      slider.setValue('max');
    });
    // 实测：下限写得比上限大不报错，上限被抬到和下限一样
    slider.minimumValue = 200;
    assert('下限写得比上限大：上限被抬上来', slider.maximumValue, 200);
    assert('value 也跟着', slider.value, 200);
    slider.minimumValue = 0;
    slider.maximumValue = 1;

    slider.isContinuous = false;
    assert('isContinuous 可写', slider.isContinuous, false);
    slider.isContinuous = true;

    slider.minimumTrackTintColor = '#ff9500';
    assert('minimumTrackTintColor 可写', slider.minimumTrackTintColor, '#ff9500');
    slider.maximumTrackTintColor = 'systemGray';
    assert('maximumTrackTintColor 可写', slider.maximumTrackTintColor, 'systemGray');
    slider.thumbTintColor = '#ffffff';
    assert('thumbTintColor 可写', slider.thumbTintColor, '#ffffff');
    slider.minimumTrackTintColor = null;
    slider.maximumTrackTintColor = null;
    slider.thumbTintColor = null;
    assert('三个颜色都能写回 null',
           [slider.minimumTrackTintColor, slider.maximumTrackTintColor,
            slider.thumbTintColor].join(','), ',,');

    slider.sliderStyle = 'thumbless';
    assert('sliderStyle 可写', slider.sliderStyle, 'thumbless');
    assert('不认识的 sliderStyle：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这种样式
      slider.sliderStyle = 'round';
    }, () => slider.sliderStyle), ENUM_IGNORED);
    assert('被拒之后 sliderStyle 没动', slider.sliderStyle, 'thumbless');
    slider.sliderStyle = 'default';

    // ---- 两头的图 ----
    slider.minimumValueImage = star;
    assert('minimumValueImage 写进去的对象原样读回来', slider.minimumValueImage === star, true);
    slider.maximumValueImage = circle;
    assert('maximumValueImage 同上', slider.maximumValueImage === circle, true);
    rejects('minimumValueImage 给字符串', () => {
      // @ts-expect-error 要 UIImage
      slider.minimumValueImage = 'star.fill';
    });
    rejects('minimumValueImage 给别的原生对象', () => {
      // @ts-expect-error 要 UIImage
      slider.minimumValueImage = UIColor.redColor;
    });
    assert('被拒之后原来的图还在', slider.minimumValueImage === star, true);
    slider.minimumValueImage = null;
    slider.maximumValueImage = null;
    assert('写 null 清掉', slider.minimumValueImage, null);

    // ---- 按状态设的三张图 ----
    slider.setThumbImage(star, { forState: ['normal'] });
    assert('setThumbImage 之后按状态取回来是同一个对象',
           slider.thumbImageForState('normal') === star, true);
    // 实测：没设过的状态回退到 normal 那张，不是 null
    assert('没设过的状态回退到 normal', slider.thumbImageForState('highlighted') === star, true);
    slider.setThumbImage(circle, { forState: ['highlighted'] });
    assert('highlighted 单独设了就用它自己的',
           slider.thumbImageForState('highlighted') === circle, true);
    slider.setMinimumTrackImage(star, { forState: ['normal'] });
    assert('setMinimumTrackImage', slider.minimumTrackImageForState('normal') === star, true);
    slider.setMaximumTrackImage(circle, { forState: ['normal'] });
    assert('setMaximumTrackImage', slider.maximumTrackImageForState('normal') === circle, true);
    assert('currentMinimumTrackImage 是当前状态那张', slider.currentMinimumTrackImage === star, true);
    assert('currentMaximumTrackImage 同上', slider.currentMaximumTrackImage === circle, true);
    // 实测（没进窗口的滑块）：设了滑块图之后 currentThumbImage 仍然是 null。
    // 进了窗口是不是一样没量过，所以这里只打出来，不断言
    console.log('  · 设了滑块图之后 currentThumbImage =', String(slider.currentThumbImage));
    rejects('setThumbImage 缺 forState', () => {
      // @ts-expect-error forState 不能少
      slider.setThumbImage(star, {});
    });
    rejects('setThumbImage 状态名写错', () => {
      // @ts-expect-error 没有这个状态
      slider.setThumbImage(star, { forState: ['pressed'] });
    });
    rejects('setThumbImage 给的不是图', () => {
      // @ts-expect-error 要 UIImage
      slider.setThumbImage(UIColor.redColor, { forState: ['normal'] });
    });
    rejects('thumbImageForState 状态名写错', () => {
      // @ts-expect-error 没有这个状态
      slider.thumbImageForState('pressed');
    });
    slider.setThumbImage(null, { forState: ['highlighted'] });
    slider.setThumbImage(null, { forState: ['normal'] });
    slider.setMinimumTrackImage(null, { forState: ['normal'] });
    slider.setMaximumTrackImage(null, { forState: ['normal'] });
    assert('三张图都能用 null 清掉',
           [slider.thumbImageForState('normal'), slider.minimumTrackImageForState('normal'),
            slider.maximumTrackImageForState('normal')].join(','), ',,');

    // ---- 轨道和滑块在哪 ----
    const bounds = { x: 0, y: 0, width: 300, height: 34 };
    const track = slider.trackRectForBounds(bounds);
    assert('trackRectForBounds 给的是 CGRect', track instanceof CGRect, true);
    assert('轨道在给的范围里面', track.width > 0 && track.width <= 300 && track.x >= 0, true);
    const atMin = slider.thumbRectForBounds(bounds, { trackRect: track, value: 0 });
    const atMax = slider.thumbRectForBounds(bounds, { trackRect: track, value: 1 });
    assert('thumbRectForBounds 给的是 CGRect', atMin instanceof CGRect, true);
    assert('值越大滑块越靠右', atMax.x > atMin.x, true);
    assert('两头的图没设时，minimumValueImageRectForBounds 是空的',
           slider.minimumValueImageRectForBounds(bounds).width, 0);
    assert('maximumValueImageRectForBounds 同上',
           slider.maximumValueImageRectForBounds(bounds).width, 0);
    rejects('thumbRectForBounds 缺 trackRect', () => {
      // @ts-expect-error trackRect 和 value 都不能少
      slider.thumbRectForBounds(bounds, { value: 0 });
    });
    rejects('thumbRectForBounds 缺 value', () => {
      // @ts-expect-error 同上
      slider.thumbRectForBounds(bounds, { trackRect: track });
    });
    rejects('trackRectForBounds 给的不是矩形', () => {
      // @ts-expect-error 要矩形
      slider.trackRectForBounds(300);
    });

    // 刻度那一组要再接两个类，还没做
    absent(slider, ['trackConfiguration']);
  }

  // =====================================================================
  // UIStepper
  // =====================================================================
  console.log('  --- UIStepper ---');
  {
    const stepper = new UIStepper();
    assert('UIStepper 是 UIControl', stepper instanceof UIControl, true);
    assert('默认 value', stepper.value, 0);
    assert('默认 minimumValue', stepper.minimumValue, 0);
    assert('默认 maximumValue', stepper.maximumValue, 100);
    assert('默认 stepValue', stepper.stepValue, 1);
    assert('默认 isContinuous', stepper.isContinuous, true);
    assert('默认 autorepeat', stepper.autorepeat, true);
    assert('默认 wraps', stepper.wraps, false);

    stepper.value = 5;
    assert('value 可写', stepper.value, 5);
    stepper.value = 0.3;
    assert('value 是双精度，0.3 就是 0.3；也不按 stepValue 取整', stepper.value, 0.3);
    stepper.value = 500;
    assert('超过上限：钉在 maximumValue', stepper.value, 100);
    stepper.value = -5;
    assert('低于下限：钉在 minimumValue', stepper.value, 0);
    stepper.wraps = true;
    assert('wraps 可写', stepper.wraps, true);
    stepper.value = 500;
    // 实测：wraps 只管用户点按钮时回绕，程序写值仍然是钉住
    assert('开了 wraps，程序写超出的值仍然是钉住', stepper.value, 100);
    stepper.wraps = false;
    rejects('value 转不出数', () => {
      // @ts-expect-error 转不出数
      stepper.value = 'many';
    });
    assert('被拒之后原值没动', stepper.value, 100);

    stepper.stepValue = 0.5;
    assert('stepValue 可写', stepper.stepValue, 0.5);
    // 实测：UIKit 在这里抛 NSInvalidArgumentException，所以先拦成 TypeError
    rejects('stepValue = 0', () => { stepper.stepValue = 0; });
    rejects('stepValue 是负数', () => { stepper.stepValue = -1; });
    assert('被拒之后 stepValue 没动', stepper.stepValue, 0.5);

    stepper.maximumValue = 10;
    assert('maximumValue 可写', stepper.maximumValue, 10);
    assert('压低上限，value 跟着被钉下来', stepper.value, 10);
    stepper.minimumValue = -10;
    assert('minimumValue 可写', stepper.minimumValue, -10);
    // 实测：头文件说下限必须小于上限，实际不报错，上限被抬到和下限一样
    stepper.minimumValue = 200;
    assert('下限写得比上限大：上限被抬上来', stepper.maximumValue, 200);
    assert('value 也跟着', stepper.value, 200);

    stepper.autorepeat = false;
    assert('autorepeat 可写', stepper.autorepeat, false);
    stepper.isContinuous = false;
    assert('isContinuous 可写', stepper.isContinuous, false);

    // 实测：这四组图在 iOS 27.2 上写进去读回来是 null，没接
    absent(stepper, ['setIncrementImage', 'setDecrementImage', 'setBackgroundImage',
                     'setDividerImage', 'incrementImageForState', 'decrementImageForState',
                     'backgroundImageForState', 'dividerImageForLeftSegmentState']);
  }

  // =====================================================================
  // UISegmentedControl
  // =====================================================================
  console.log('  --- UISegmentedControl ---');
  {
    const empty = new UISegmentedControl();
    assert('UISegmentedControl 是 UIControl', empty instanceof UIControl, true);
    assert('不给分段：numberOfSegments', empty.numberOfSegments, 0);
    assert('默认没有选中的，selectedSegmentIndex 是 -1', empty.selectedSegmentIndex, -1);
    assert('默认 isMomentary', empty.isMomentary, false);
    assert('默认 apportionsSegmentWidthsByContent', empty.apportionsSegmentWidthsByContent, false);
    assert('默认 selectedSegmentTintColor', empty.selectedSegmentTintColor, null);
    assert('给 null 和不给一样', new UISegmentedControl(null).numberOfSegments, 0);
    assert('给空数组也一样', new UISegmentedControl([]).numberOfSegments, 0);

    // 文字和图片可以混着给；数字按字符串用
    // @ts-expect-error 类型定义只收字符串和图，运行时把数字转成字符串
    const seg = new UISegmentedControl(['日', '周', star, 5]);
    assert('构造时给四段', seg.numberOfSegments, 4);
    assert('第 0 段的标题', seg.titleForSegmentAtIndex(0), '日');
    assert('图片段没有标题', seg.titleForSegmentAtIndex(2), null);
    assert('图片段的图是给的那个对象', seg.imageForSegmentAtIndex(2) === star, true);
    assert('文字段没有图', seg.imageForSegmentAtIndex(0), null);
    assert('数字转成了字符串', seg.titleForSegmentAtIndex(3), '5');
    assert('构造完没有选中的', seg.selectedSegmentIndex, -1);
    assert('每段默认宽 0（自动）', seg.widthForSegmentAtIndex(0), 0);
    assert('每段默认可用', seg.isEnabledForSegmentAtIndex(0), true);
    const offset0 = seg.contentOffsetForSegmentAtIndex(0);
    assert('contentOffsetForSegmentAtIndex 给的是 CGSize', offset0 instanceof CGSize, true);
    assert('默认偏移是 0, 0', offset0.width + ',' + offset0.height, '0,0');

    rejects('构造时给的不是数组', () => {
      // @ts-expect-error 要数组
      new UISegmentedControl('日周月');
    });
    rejects('数组里有 null', () => {
      // @ts-expect-error 每项要字符串或图
      new UISegmentedControl(['日', null]);
    });
    rejects('数组里有别的原生对象', () => {
      // @ts-expect-error 每项要字符串或图
      new UISegmentedControl([UIColor.redColor]);
    });
    rejects('数组里有普通对象', () => {
      // @ts-expect-error 每项要字符串或图
      new UISegmentedControl([{ title: '日' }]);
    });
    rejects('numberOfSegments 只读', () => {
      // @ts-expect-error 只读
      seg.numberOfSegments = 9;
    });

    // ---- 选中 ----
    seg.selectedSegmentIndex = 1;
    assert('selectedSegmentIndex 可写', seg.selectedSegmentIndex, 1);
    seg.selectedSegmentIndex = 2.9;
    assert('下标给小数：向零取整', seg.selectedSegmentIndex, 2);
    seg.selectedSegmentIndex = 1;
    // 实测：UIKit 对越界的下标什么都不做也不报错，-2 还会被原样存下来
    rejects('selectedSegmentIndex 越界', () => { seg.selectedSegmentIndex = 4; });
    rejects('selectedSegmentIndex 小于 -1', () => { seg.selectedSegmentIndex = -2; });
    rejects('selectedSegmentIndex 转不出数', () => {
      // @ts-expect-error 转不出数
      seg.selectedSegmentIndex = 'first';
    });
    assert('被拒之后选中的没动', seg.selectedSegmentIndex, 1);
    seg.selectedSegmentIndex = -1;
    assert('写 -1：取消选中', seg.selectedSegmentIndex, -1);
    seg.selectedSegmentIndex = 1;

    // ---- 插入和删除 ----
    seg.insertSegmentWithTitle('年', { atIndex: 0 });
    assert('insertSegmentWithTitle 之后多一段', seg.numberOfSegments, 5);
    assert('插在了第 0 段', seg.titleForSegmentAtIndex(0), '年');
    assert('原来的往后挪', seg.titleForSegmentAtIndex(1), '日');
    assert('在选中的那段前面插入：选中的下标跟着加一', seg.selectedSegmentIndex, 2);
    seg.insertSegmentWithTitle('末', { atIndex: 99, animated: true });
    assert('atIndex 超过段数：插在最后', seg.titleForSegmentAtIndex(seg.numberOfSegments - 1), '末');
    seg.insertSegmentWithImage(circle, { atIndex: 1 });
    assert('insertSegmentWithImage', seg.imageForSegmentAtIndex(1) === circle, true);
    assert('现在七段', seg.numberOfSegments, 7);
    rejects('insertSegmentWithTitle 缺 atIndex', () => {
      // @ts-expect-error atIndex 不能少
      seg.insertSegmentWithTitle('x', {});
    });
    rejects('atIndex 是负数', () => { seg.insertSegmentWithTitle('x', { atIndex: -1 }); });
    rejects('atIndex 转不出数', () => { seg.insertSegmentWithTitle('x', { atIndex: NaN }); });
    rejects('insertSegmentWithImage 给的不是图', () => {
      // @ts-expect-error 要 UIImage
      seg.insertSegmentWithImage('star.fill', { atIndex: 0 });
    });
    assert('被拒的几次都没插进去', seg.numberOfSegments, 7);

    seg.removeSegmentAtIndex(1);
    assert('removeSegmentAtIndex 之后少一段', seg.numberOfSegments, 6);
    assert('后面的往前补', seg.titleForSegmentAtIndex(1), '日');
    seg.removeSegmentAtIndex(5, { animated: true });
    assert('带 animated 也是当场就少', seg.numberOfSegments, 5);
    // 实测：UIKit 对越界的下标什么都不做
    rejects('removeSegmentAtIndex 越界', () => { seg.removeSegmentAtIndex(5); });
    rejects('removeSegmentAtIndex 是负数', () => { seg.removeSegmentAtIndex(-1); });
    assert('被拒之后段数没动', seg.numberOfSegments, 5);
    // 现在是 年 日 周 ★ 5，选中的是「周」
    assert('选中的还是「周」', seg.titleForSegmentAtIndex(seg.selectedSegmentIndex), '周');
    seg.removeSegmentAtIndex(seg.selectedSegmentIndex);
    // 实测：这时 UIKit 读出来是 -2。运行时把所有负数都归成 -1
    assert('删掉选中的那段：变成没有选中的', seg.selectedSegmentIndex, -1);

    // ---- 每段的内容 ----
    // 现在是 年 日 ★ 5
    seg.setTitle('月', { forSegmentAtIndex: 0 });
    assert('setTitle', seg.titleForSegmentAtIndex(0), '月');
    // 一段只能有标题或图，二选一（头文件：can only have image or title, not both）
    seg.setTitle('星', { forSegmentAtIndex: 2 });
    assert('给图片段设标题：标题有了', seg.titleForSegmentAtIndex(2), '星');
    assert('图没了', seg.imageForSegmentAtIndex(2), null);
    seg.setImage(star, { forSegmentAtIndex: 2 });
    assert('给文字段设图：图有了', seg.imageForSegmentAtIndex(2) === star, true);
    assert('标题没了', seg.titleForSegmentAtIndex(2), null);
    seg.setTitle(null, { forSegmentAtIndex: 1 });
    assert('标题写 null', seg.titleForSegmentAtIndex(1), null);
    // @ts-expect-error 类型定义要字符串，运行时会转
    seg.setTitle(7, { forSegmentAtIndex: 1 });
    assert('标题给数字：转成字符串', seg.titleForSegmentAtIndex(1), '7');
    seg.setImage(null, { forSegmentAtIndex: 2 });
    assert('图写 null', seg.imageForSegmentAtIndex(2), null);

    seg.setWidth(80, { forSegmentAtIndex: 0 });
    assert('setWidth', seg.widthForSegmentAtIndex(0), 80);
    seg.setWidth(0, { forSegmentAtIndex: 0 });
    assert('宽写回 0：自动', seg.widthForSegmentAtIndex(0), 0);
    seg.setEnabled(false, { forSegmentAtIndex: 0 });
    assert('setEnabled(false)', seg.isEnabledForSegmentAtIndex(0), false);
    assert('别的段不受影响', seg.isEnabledForSegmentAtIndex(1), true);
    seg.setEnabled(true, { forSegmentAtIndex: 0 });
    seg.setContentOffset({ width: 2, height: 3 }, { forSegmentAtIndex: 0 });
    const moved = seg.contentOffsetForSegmentAtIndex(0);
    assert('setContentOffset', moved.width + ',' + moved.height, '2,3');
    seg.setContentOffset(new CGSize(0, 0), { forSegmentAtIndex: 0 });

    // 实测：这十个方法下标越界时 UIKit 抛 NSRangeException
    rejects('setTitle 下标越界', () => { seg.setTitle('x', { forSegmentAtIndex: 4 }); });
    rejects('setTitle 缺 forSegmentAtIndex', () => {
      // @ts-expect-error forSegmentAtIndex 不能少
      seg.setTitle('x', {});
    });
    rejects('setImage 下标越界', () => { seg.setImage(star, { forSegmentAtIndex: 4 }); });
    rejects('setImage 给的不是图', () => {
      // @ts-expect-error 要 UIImage
      seg.setImage('star.fill', { forSegmentAtIndex: 0 });
    });
    rejects('setWidth 下标越界', () => { seg.setWidth(10, { forSegmentAtIndex: 4 }); });
    rejects('setWidth 转不出数', () => {
      // @ts-expect-error 转不出数
      seg.setWidth('wide', { forSegmentAtIndex: 0 });
    });
    rejects('setEnabled 下标越界', () => { seg.setEnabled(false, { forSegmentAtIndex: 4 }); });
    rejects('setContentOffset 下标越界', () => {
      seg.setContentOffset({ width: 1, height: 1 }, { forSegmentAtIndex: 4 });
    });
    rejects('setContentOffset 给的不是 size', () => {
      // @ts-expect-error 要 { width, height }
      seg.setContentOffset(3, { forSegmentAtIndex: 0 });
    });
    rejects('titleForSegmentAtIndex 越界', () => { seg.titleForSegmentAtIndex(4); });
    rejects('titleForSegmentAtIndex 是负数', () => { seg.titleForSegmentAtIndex(-1); });
    rejects('imageForSegmentAtIndex 越界', () => { seg.imageForSegmentAtIndex(4); });
    rejects('widthForSegmentAtIndex 越界', () => { seg.widthForSegmentAtIndex(4); });
    rejects('isEnabledForSegmentAtIndex 越界', () => { seg.isEnabledForSegmentAtIndex(4); });
    rejects('contentOffsetForSegmentAtIndex 越界', () => { seg.contentOffsetForSegmentAtIndex(4); });
    rejects('下标转不出数', () => {
      // @ts-expect-error 转不出数
      seg.titleForSegmentAtIndex('first');
    });

    // ---- 整体的几个开关 ----
    seg.isMomentary = true;
    assert('isMomentary 可写', seg.isMomentary, true);
    seg.isMomentary = false;
    seg.apportionsSegmentWidthsByContent = true;
    assert('apportionsSegmentWidthsByContent 可写', seg.apportionsSegmentWidthsByContent, true);
    seg.selectedSegmentTintColor = '#007aff';
    assert('selectedSegmentTintColor 可写', seg.selectedSegmentTintColor, '#007aff');
    seg.selectedSegmentTintColor = null;
    assert('selectedSegmentTintColor 写 null', seg.selectedSegmentTintColor, null);

    seg.selectedSegmentIndex = 0;
    seg.removeAllSegments();
    assert('removeAllSegments 之后一段都没有', seg.numberOfSegments, 0);
    assert('也没有选中的了', seg.selectedSegmentIndex, -1);

    // UIAction 那一组、导航条里的外观定制、文字属性，都没接
    absent(seg, ['insertSegmentWithAction', 'setAction', 'actionForSegmentAtIndex',
                 'segmentIndexForActionIdentifier', 'setBackgroundImage', 'setDividerImage',
                 'setTitleTextAttributes', 'setContentPositionAdjustment',
                 'segmentedControlStyle']);
  }

  // =====================================================================
  // UIPageControl
  // =====================================================================
  console.log('  --- UIPageControl ---');
  {
    const pages = new UIPageControl();
    assert('UIPageControl 是 UIControl', pages instanceof UIControl, true);
    assert('默认 numberOfPages', pages.numberOfPages, 0);
    assert('默认 currentPage', pages.currentPage, 0);
    assert('默认 hidesForSinglePage', pages.hidesForSinglePage, false);
    assert('默认 pageIndicatorTintColor', pages.pageIndicatorTintColor, null);
    assert('默认 currentPageIndicatorTintColor', pages.currentPageIndicatorTintColor, null);
    assert('默认 backgroundStyle', pages.backgroundStyle, 'automatic');
    assert('默认 direction', pages.direction, 'natural');
    assert('默认 interactionState', pages.interactionState, 'none');
    assert('默认 allowsContinuousInteraction', pages.allowsContinuousInteraction, true);
    assert('默认 preferredIndicatorImage', pages.preferredIndicatorImage, null);
    assert('默认 preferredCurrentPageIndicatorImage', pages.preferredCurrentPageIndicatorImage, null);

    pages.currentPage = 3;
    assert('一页都没有时写 currentPage：钉在 0', pages.currentPage, 0);
    pages.numberOfPages = 5;
    assert('numberOfPages 可写', pages.numberOfPages, 5);
    pages.currentPage = 3;
    assert('currentPage 可写', pages.currentPage, 3);
    pages.currentPage = 9;
    assert('超过最后一页：钉在最后一页', pages.currentPage, 4);
    pages.currentPage = -1;
    assert('负的页码：钉在 0', pages.currentPage, 0);
    pages.currentPage = 4;
    pages.numberOfPages = 2;
    assert('页数减少，currentPage 跟着被钉下来', pages.currentPage, 1);
    // 实测：UIKit 把负的页数当 0。运行时拦掉，和手势的次数一样
    rejects('numberOfPages 是负数', () => { pages.numberOfPages = -3; });
    rejects('numberOfPages 转不出数', () => {
      // @ts-expect-error 转不出数
      pages.numberOfPages = 'many';
    });
    assert('被拒之后页数没动', pages.numberOfPages, 2);
    pages.numberOfPages = 3.7;
    assert('页数给小数：向零取整', pages.numberOfPages, 3);

    pages.hidesForSinglePage = true;
    assert('hidesForSinglePage 可写', pages.hidesForSinglePage, true);
    pages.allowsContinuousInteraction = false;
    assert('allowsContinuousInteraction 可写', pages.allowsContinuousInteraction, false);
    pages.backgroundStyle = 'prominent';
    assert('backgroundStyle 可写', pages.backgroundStyle, 'prominent');
    pages.backgroundStyle = 'minimal';
    assert('backgroundStyle = minimal', pages.backgroundStyle, 'minimal');
    pages.direction = 'topToBottom';
    assert('direction 可写', pages.direction, 'topToBottom');
    let directions = 0;
    for (const d of /** @type {const} */ (['natural', 'leftToRight', 'rightToLeft',
                                            'topToBottom', 'bottomToTop'])) {
      pages.direction = d;
      if (pages.direction === d) directions += 1;
    }
    assert('五个方向都写得进去', directions, 5);
    pages.direction = 'natural';   // 下面量大小，要横着排
    assert('不认识的 backgroundStyle：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这种样式
      pages.backgroundStyle = 'glass';
    }, () => pages.backgroundStyle), ENUM_IGNORED);
    assert('不认识的 direction：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这个方向
      pages.direction = 'up';
    }, () => pages.direction), ENUM_IGNORED);
    rejects('interactionState 只读', () => {
      // @ts-expect-error 只读
      pages.interactionState = 'discrete';
    });

    pages.pageIndicatorTintColor = 'secondaryLabel';
    assert('pageIndicatorTintColor 可写', pages.pageIndicatorTintColor, 'secondaryLabel');
    pages.currentPageIndicatorTintColor = '#ff3b30';
    assert('currentPageIndicatorTintColor 可写', pages.currentPageIndicatorTintColor, '#ff3b30');
    pages.pageIndicatorTintColor = null;
    pages.currentPageIndicatorTintColor = null;
    assert('两个颜色都能写回 null',
           [pages.pageIndicatorTintColor, pages.currentPageIndicatorTintColor].join(','), ',');

    // ---- 指示点的图 ----
    pages.preferredIndicatorImage = circle;
    assert('preferredIndicatorImage 原样读回来', pages.preferredIndicatorImage === circle, true);
    pages.preferredCurrentPageIndicatorImage = star;
    assert('preferredCurrentPageIndicatorImage 同上',
           pages.preferredCurrentPageIndicatorImage === star, true);
    rejects('preferredIndicatorImage 给的不是图', () => {
      // @ts-expect-error 要 UIImage
      pages.preferredIndicatorImage = 'circle.fill';
    });
    assert('没单独设过的页：indicatorImageForPage 是 null', pages.indicatorImageForPage(0), null);
    pages.setIndicatorImage(star, { forPage: 1 });
    assert('setIndicatorImage', pages.indicatorImageForPage(1) === star, true);
    assert('别的页不受影响', pages.indicatorImageForPage(0), null);
    pages.setCurrentPageIndicatorImage(circle, { forPage: 1 });
    assert('setCurrentPageIndicatorImage', pages.currentPageIndicatorImageForPage(1) === circle, true);
    // 实测：页码越界时 UIKit 抛 NSInternalInconsistencyException。
    // 头文件写的范围是 0..numberOfPages，实际最后一个合法的是 numberOfPages - 1
    rejects('setIndicatorImage 页码越界', () => { pages.setIndicatorImage(star, { forPage: 3 }); });
    rejects('setIndicatorImage 页码是负数', () => { pages.setIndicatorImage(star, { forPage: -1 }); });
    rejects('setIndicatorImage 缺 forPage', () => {
      // @ts-expect-error forPage 不能少
      pages.setIndicatorImage(star, {});
    });
    rejects('setIndicatorImage 给的不是图', () => {
      // @ts-expect-error 要 UIImage
      pages.setIndicatorImage('star.fill', { forPage: 0 });
    });
    rejects('indicatorImageForPage 页码越界', () => { pages.indicatorImageForPage(3); });
    rejects('setCurrentPageIndicatorImage 页码越界', () => {
      pages.setCurrentPageIndicatorImage(star, { forPage: 9 });
    });
    rejects('currentPageIndicatorImageForPage 页码越界', () => {
      pages.currentPageIndicatorImageForPage(9);
    });
    pages.setIndicatorImage(null, { forPage: 1 });
    assert('setIndicatorImage(null)：回到默认', pages.indicatorImageForPage(1), null);
    pages.setCurrentPageIndicatorImage(null, { forPage: 1 });
    pages.preferredIndicatorImage = null;
    pages.preferredCurrentPageIndicatorImage = null;
    assert('preferredIndicatorImage 写 null', pages.preferredIndicatorImage, null);

    // ---- 要多大 ----
    const three = pages.sizeForNumberOfPages(3);
    assert('sizeForNumberOfPages 给的是 CGSize', three instanceof CGSize, true);
    assert('三页的宽和高都大于 0', three.width > 0 && three.height > 0, true);
    assert('十页比三页宽', pages.sizeForNumberOfPages(10).width > three.width, true);
    // 实测：UIKit 在这里抛 NSInvalidArgumentException
    rejects('sizeForNumberOfPages 给负数', () => { pages.sizeForNumberOfPages(-1); });

    // 进度那一组要再接两个类和一个要同步答话的 delegate，没做；另外两个已废弃
    absent(pages, ['progress', 'defersCurrentPageDisplay', 'updateCurrentPageDisplay']);
  }

  // =====================================================================
  // UIDatePicker
  // =====================================================================
  console.log('  --- UIDatePicker ---');
  {
    const t0 = Date.now();
    const picker = new UIDatePicker();
    assert('UIDatePicker 是 UIControl', picker instanceof UIControl, true);
    assert('默认 datePickerMode', picker.datePickerMode, 'dateAndTime');
    assert('默认 preferredDatePickerStyle', picker.preferredDatePickerStyle, 'automatic');
    // 实测：iPhone 上 automatic 落到 compact
    assert('默认实际用的样式 datePickerStyle', picker.datePickerStyle, 'compact');
    assert('默认 minimumDate', picker.minimumDate, null);
    assert('默认 maximumDate', picker.maximumDate, null);
    assert('默认 minuteInterval', picker.minuteInterval, 1);
    assert('默认 roundsToMinuteInterval', picker.roundsToMinuteInterval, true);
    assert('不在倒计时模式时 countDownDuration 读出来是 0', picker.countDownDuration, 0);
    const born = picker.date;
    assert('date 读出来是 Date', born instanceof Date, true);
    assert('默认是创建那一刻', Math.abs(born.getTime() - t0) < 5000, true);
    assert('每次读是一个新的 Date 对象', picker.date !== picker.date, true);

    // ---- 日期 ----
    picker.date = new Date(1700000000123);
    assert('date 可写，毫秒不丢', picker.date.getTime(), 1700000000123);
    picker.setDate(new Date(1700000042500));
    assert('setDate', picker.date.getTime(), 1700000042500);
    picker.setDate(new Date(1700000000000), { animated: true });
    assert('setDate 带 animated：值当场就变', picker.date.getTime(), 1700000000000);
    rejects('date 写 null', () => {
      // @ts-expect-error date 不可空
      picker.date = null;
    });
    rejects('date 写字符串', () => {
      // @ts-expect-error 要 Date
      picker.date = '2026-01-01';
    });
    rejects('date 写时间戳', () => {
      // @ts-expect-error 要 Date，不收数字
      picker.date = 1700000000000;
    });
    rejects('date 写无效的 Date', () => { picker.date = new Date(NaN); });
    rejects('setDate 给的不是 Date', () => {
      // @ts-expect-error 要 Date
      picker.setDate(1700000000000);
    });
    assert('被拒之后日期没动', picker.date.getTime(), 1700000000000);

    const lo = new Date(1700000000000);
    const hi = new Date(1700086400000);
    picker.minimumDate = lo;
    picker.maximumDate = hi;
    assert('minimumDate 可写', picker.minimumDate && picker.minimumDate.getTime(), lo.getTime());
    assert('maximumDate 可写', picker.maximumDate && picker.maximumDate.getTime(), hi.getTime());
    picker.date = new Date(1800000000000);
    assert('晚于 maximumDate：钉在 maximumDate', picker.date.getTime(), hi.getTime());
    picker.date = new Date(1600000000000);
    assert('早于 minimumDate：钉在 minimumDate', picker.date.getTime(), lo.getTime());
    rejects('minimumDate 写字符串', () => {
      // @ts-expect-error 要 Date 或 null
      picker.minimumDate = 'yesterday';
    });
    rejects('maximumDate 写无效的 Date', () => { picker.maximumDate = new Date(NaN); });
    picker.minimumDate = null;
    picker.maximumDate = null;
    assert('写 null：不限', [picker.minimumDate, picker.maximumDate].join(','), ',');
    // @ts-expect-error 类型定义不收 undefined，运行时当 null
    picker.minimumDate = undefined;
    assert('minimumDate 写 undefined：也是不限', picker.minimumDate, null);

    // ---- 分钟的间隔 ----
    picker.date = new Date(1700000042500);
    picker.minuteInterval = 15;
    assert('minuteInterval 可写', picker.minuteInterval, 15);
    // 实测：1700000042500 是 22:14:02.5，改成 15 分钟一档之后变成 22:00:02
    assert('日期被取整到间隔上', picker.date.getTime(), 1699999202000);
    picker.roundsToMinuteInterval = false;
    assert('roundsToMinuteInterval 可写', picker.roundsToMinuteInterval, false);
    picker.date = new Date(1700000042500);
    assert('关掉取整之后日期写什么是什么', picker.date.getTime(), 1700000042500);
    picker.roundsToMinuteInterval = true;
    // 实测：不合法的间隔 UIKit 什么都不做也不报错，读回来还是旧值
    rejects('minuteInterval 除不尽 60', () => { picker.minuteInterval = 7; });
    rejects('minuteInterval = 0', () => { picker.minuteInterval = 0; });
    rejects('minuteInterval 超过 30', () => { picker.minuteInterval = 60; });
    rejects('minuteInterval 转不出数', () => {
      // @ts-expect-error 转不出数
      picker.minuteInterval = 'quarter';
    });
    assert('被拒之后间隔没动', picker.minuteInterval, 15);
    picker.minuteInterval = 1;

    // ---- 模式和样式 ----
    picker.datePickerMode = 'date';
    assert('datePickerMode 可写', picker.datePickerMode, 'date');
    picker.datePickerMode = 'time';
    assert('datePickerMode = time', picker.datePickerMode, 'time');
    assert('不认识的 datePickerMode：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这种模式
      picker.datePickerMode = 'week';
    }, () => picker.datePickerMode), ENUM_IGNORED);
    picker.preferredDatePickerStyle = 'wheels';
    assert('preferredDatePickerStyle 可写', picker.preferredDatePickerStyle, 'wheels');
    assert('实际样式跟着变', picker.datePickerStyle, 'wheels');
    picker.preferredDatePickerStyle = 'inline';
    assert('inline', picker.datePickerStyle, 'inline');
    picker.preferredDatePickerStyle = 'compact';
    assert('compact', picker.datePickerStyle, 'compact');
    assert('不认识的 preferredDatePickerStyle：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这种样式
      picker.preferredDatePickerStyle = 'popup';
    }, () => picker.preferredDatePickerStyle), ENUM_IGNORED);
    rejects('datePickerStyle 只读', () => {
      // @ts-expect-error 只读
      picker.datePickerStyle = 'wheels';
    });

    // 倒计时和年月只有滚轮样式。实测：配上 compact 或 inline，UIKit 抛
    // NSInternalInconsistencyException，先写哪个都一样。运行时先拦
    rejects('compact 样式下切到倒计时', () => { picker.datePickerMode = 'countDownTimer'; });
    rejects('compact 样式下切到年月', () => { picker.datePickerMode = 'yearAndMonth'; });
    assert('被拒之后模式没动', picker.datePickerMode, 'time');
    picker.preferredDatePickerStyle = 'automatic';
    picker.datePickerMode = 'yearAndMonth';
    assert('automatic 样式下切到年月：可以', picker.datePickerMode, 'yearAndMonth');
    assert('实际样式自动落到滚轮', picker.datePickerStyle, 'wheels');
    picker.datePickerMode = 'countDownTimer';
    assert('切到倒计时', picker.datePickerMode, 'countDownTimer');
    assert('实际样式还是滚轮', picker.datePickerStyle, 'wheels');
    rejects('倒计时模式下把样式改成 inline', () => { picker.preferredDatePickerStyle = 'inline'; });
    rejects('倒计时模式下把样式改成 compact', () => { picker.preferredDatePickerStyle = 'compact'; });
    assert('被拒之后样式没动', picker.preferredDatePickerStyle, 'automatic');
    picker.preferredDatePickerStyle = 'wheels';

    // ---- 倒计时的时长（秒）----
    // 实测：进了倒计时模式读出来是 60，不是头文件写的 0
    assert('倒计时模式下 countDownDuration 起步是 60 秒', picker.countDownDuration, 60);
    picker.countDownDuration = 125;
    assert('写 125 秒：零头被丢掉，剩整分钟', picker.countDownDuration, 120);
    picker.countDownDuration = 86399;
    assert('上限 23:59', picker.countDownDuration, 86340);
    // 实测：超出范围时 UIKit 不报错，悄悄变回 60
    rejects('countDownDuration 超过 23:59', () => { picker.countDownDuration = 86400; });
    rejects('countDownDuration 是负数', () => { picker.countDownDuration = -60; });
    rejects('countDownDuration 转不出数', () => {
      // @ts-expect-error 转不出数
      picker.countDownDuration = 'an hour';
    });
    assert('被拒之后时长没动', picker.countDownDuration, 86340);
    picker.countDownDuration = 600;
    // 实测：别的模式下写时长，UIKit 直接丢掉（写 300 读回来是 0）。运行时拦掉
    const other = new UIDatePicker();
    rejects('不在倒计时模式时写 countDownDuration', () => { other.countDownDuration = 300; });

    // 地区、日历、时区这三样在桥上怎么表示还没定，没接
    absent(picker, ['locale', 'calendar', 'timeZone']);
  }

  // =====================================================================
  // 屏幕上摆一份，等事件
  // =====================================================================
  const host = ctx.section('数值控件（拨一拨）', 272);
  const column = new UIStackView();
  column.axis = 'vertical';
  column.alignment = 'leading';
  column.spacing = 12;
  column.translatesAutoresizingMaskIntoConstraints = false;
  host.addSubview(column);

  const sw = new UISwitch();
  sw.isOn = true;
  const slider = new UISlider();
  slider.maximumValue = 100;
  slider.value = 40;
  const stepper = new UIStepper();
  const seg = new UISegmentedControl(['日', '周', '月']);
  seg.selectedSegmentIndex = 1;
  const pages = new UIPageControl();
  pages.numberOfPages = 5;
  pages.currentPage = 2;
  // 页码的点是白的，垫一块底色才看得见
  pages.backgroundStyle = 'prominent';
  const picker = new UIDatePicker();

  /** @type {[string, UIControl][]} */
  const shown = [['UISwitch', sw], ['UISlider', slider], ['UIStepper', stepper],
                 ['UISegmentedControl', seg], ['UIPageControl', pages], ['UIDatePicker', picker]];
  for (const [, control] of shown) column.addArrangedSubview(control);
  NSLayoutConstraint.activateConstraints([
    column.leadingAnchor.constraintEqualToAnchor(host.leadingAnchor, { constant: 16 }),
    column.trailingAnchor.constraintEqualToAnchor(host.trailingAnchor, { constant: -16 }),
    column.topAnchor.constraintEqualToAnchor(host.topAnchor),
    // 滑块自己没有宽度，让它铺满这一列
    slider.widthAnchor.constraintEqualToAnchor(column.widthAnchor),
  ]);

  // 每个控件数自己收到几次 change
  /** @type {Map<UIControl, number>} */
  const changes = new Map();
  /** @type {string[]} */
  const wrongTarget = [];
  for (const [name, control] of shown) {
    changes.set(control, 0);
    control.addEventListener('change', (e) => {
      changes.set(control, (changes.get(control) || 0) + 1);
      if (e.target !== control) wrongTarget.push(name);
    });
  }
  const total = () => [...changes.values()].reduce((a, b) => a + b, 0);

  assert('不认识的事件名：当自定义事件', customEventWorks(sw, 'not-a-real-event'), '收到一次');
  // click 也是 16 个控件事件里的，订得上、退得掉
  const noop = () => {};
  sw.addEventListener('click', noop);
  sw.removeEventListener('click', noop);

  // 程序改值不派发 change——只有用户拨动才派发。
  // **这一条的期望没量过**：是按 UIKit 的惯例写的（头文件在 setOn:animated:
  // 和 setValue:animated: 上写着 does not send action）
  sw.isOn = false;
  sw.setOn(true, { animated: false });
  slider.value = 60;
  slider.setValue(40);
  stepper.value = 3;
  seg.selectedSegmentIndex = 2;
  pages.currentPage = 3;
  picker.date = new Date(1700000000000);
  picker.setDate(new Date());

  setTimeout(() => {
    assert('程序改值：六个控件一次 change 都没收到（期望没量过）', total(), 0);

    // 主动触发，走的是原生的 sendActionsForControlEvents，证明六个类都接上了
    // UIControl 那条现成的订阅
    for (const [, control] of shown) control.sendActionsForControlEvents(['change']);
    /** @param {number} left */
    const wait = (left) => {
      if (total() < shown.length && left > 0) { setTimeout(() => wait(left - 1), 20); return; }
      for (const [name, control] of shown) {
        assert(name + ' 收到主动触发的 change', changes.get(control), 1);
      }
      assert('事件的 target 都是控件自己', wrongTarget.join(','), '');

      // 留给真实触摸：拨一下打一行
      sw.addEventListener('change', () => {
        console.log('  ✓ 真实触摸：开关 isOn =', sw.isOn);
      });
      slider.addEventListener('change', () => {
        console.log('  ✓ 真实触摸：滑块 value =', slider.value);
      });
      stepper.addEventListener('change', () => {
        console.log('  ✓ 真实触摸：步进器 value =', stepper.value);
      });
      seg.addEventListener('change', () => {
        console.log('  ✓ 真实触摸：分段选中第', seg.selectedSegmentIndex, '段');
      });
      pages.addEventListener('change', () => {
        console.log('  ✓ 真实触摸：页码 currentPage =', pages.currentPage,
                    '，interactionState =', pages.interactionState);
      });
      picker.addEventListener('change', () => {
        console.log('  ✓ 真实触摸：日期选择器 date =', picker.date.toISOString());
      });
      console.log('  ✓ 屏幕上从上到下：开关、滑块、步进器、分段、页码、日期，等着被拨');
    };
    wait(100);
  }, 300);
}
