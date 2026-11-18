// 动图：GIF、APNG、动画 WebP。取图时读出帧，放进图片视图自己播。
import { ANIM_WEBP_BYTES } from './animated-image-bytes.js';

/** @param {import("../main.js").StepContext} ctx */
export function stepAnimatedImage(ctx) {
  const { assert } = ctx;
  const host = ctx.section('动图：GIF、APNG、WebP 放进图片视图自己播（最后一格是图层）', 84);
  console.log('  --- 动图 ---');

  const FRAMES_KEY = 'nacreImageFrames';
  /** @param {number[] | null} list */
  const rounded = (list) => (list === null ? 'null' : list.map((n) => n.toFixed(3)).join(','));
  /** @param {UIView} view */
  const isPlaying = (view) => (view.layer.animationKeys() || []).includes(FRAMES_KEY);

  // ===== 1. 帧信息：三种格式，三条取图路径 =====
  const gif = UIImage.imageNamed('JS/assets/anim.gif');
  const once = UIImage.imageNamed('JS/assets/anim-once.gif');
  // 不带扩展名：imageNamed 按 .png 找，APNG 也要认得出来
  const apng = UIImage.imageNamed('JS/assets/anim-apng');
  const webp = UIImage.imageNamed('JS/assets/anim.webp');
  const still = UIImage.imageNamed('JS/assets/dot');
  if (!gif || !once || !apng || !webp || !still) {
    console.log('  ✗ 验收用的动图没找到，这一组没法验');
    return;
  }

  assert('GIF：帧数', gif.images === null ? 0 : gif.images.length, 4);
  assert('GIF：每帧时长（秒）', rounded(gif.frameDurations), '0.100,0.100,0.100,0.100');
  assert('GIF：播一遍的时长（秒）', gif.duration.toFixed(3), '0.400');
  assert('GIF：一直循环读出来是 Infinity', gif.loopCount, Infinity);
  assert('动图的 size 还是那张图的大小', gif.size.width + 'x' + gif.size.height, '48x48');
  if (gif.images !== null) {
    assert('帧是 UIImage', gif.images[0] instanceof UIImage, true);
    assert('第一帧和这张图不是同一个对象', gif.images[0] === gif, false);
    assert('帧自己是静态图', gif.images[0].images, null);
    assert('同一帧读两次是同一个对象', gif.images[1] === gif.images[1], true);
    assert('帧的大小和整张图一样', gif.images[3].size.width, 48);
  }

  // 文件里写的是每帧 0.01 秒。系统把过短的时长抬到 0.1 秒，和浏览器一样
  assert('过短的帧时长被抬到 0.1 秒', rounded(once.frameDurations), '0.100,0.100,0.100');
  assert('没写循环信息的 GIF：播 1 遍', once.loopCount, 1);

  assert('APNG：不带扩展名也找得到，帧数', apng.images === null ? 0 : apng.images.length, 3);
  assert('APNG：播 2 遍', apng.loopCount, 2);

  assert('WebP：帧数', webp.images === null ? 0 : webp.images.length, 4);
  assert('WebP：每帧时长不一样也读得出来', rounded(webp.frameDurations),
         '0.100,0.250,0.100,0.100');
  assert('WebP：播一遍的时长（秒）', webp.duration.toFixed(3), '0.550');
  assert('WebP：播 4 遍', webp.loopCount, 4);

  assert('静态图：images 是 null', still.images, null);
  assert('静态图：frameDurations 是 null', still.frameDurations, null);
  assert('静态图：loopCount 是 null', still.loopCount, null);

  // 从动图派生出来的图是静态的：帧信息跟的是那一张图，不跟派生的新图
  assert('改渲染模式得到的新图是静态的',
         gif.imageWithRenderingMode('alwaysTemplate').images, null);
  assert('九宫格得到的新图是静态的',
         gif.resizableImage({ withCapInsets: new UIEdgeInsets(1, 1, 1, 1) }).images, null);

  // 5 帧、2048×2048，解出来 80 MB，超过预算：只给第一帧，运行时打一条警告
  const huge = UIImage.imageNamed('JS/assets/anim-huge.gif');
  assert('超预算的动图：图还在', huge !== null, true);
  if (huge) {
    assert('超预算的动图：只有第一帧，不播', huge.images, null);
    assert('超预算的动图：大小照常读得到', huge.size.width, 2048);
  }

  // 字节来的（fetch 下来的图走这条）
  const blob = new Blob([ANIM_WEBP_BYTES], { type: 'image/webp' });
  const fromBytes = UIImage.imageWithData(blob);
  assert('imageWithData：帧数', fromBytes && fromBytes.images ? fromBytes.images.length : 0, 4);
  const atScale2 = UIImage.imageWithData(blob, { scale: 2 });
  if (atScale2 && atScale2.images) {
    assert('imageWithData 带 scale：帧跟着是 2 倍', atScale2.images[0].scale, 2);
    assert('imageWithData 带 scale：帧的 size 减半', atScale2.images[0].size.width, 24);
  } else {
    console.log('  ✗ imageWithData 带 scale 没读出帧');
  }

  // ===== 2. 图片视图：给动图就播，换掉就停 =====
  /** @param {number} index @param {UIImage} image */
  const show = (index, image) => {
    const view = new UIImageView();
    view.frame = new CGRect(16 + index * 76, 10, 64, 64);
    view.image = image;
    host.addSubview(view);
    return view;
  };
  const gifView = show(0, gif);
  const apngView = show(1, apng);
  const webpView = show(2, webp);
  show(3, once);

  assert('写进去的图原样读回来', webpView.image === webp, true);
  assert('给了动图：图层上挂着帧动画', isPlaying(webpView), true);
  const playing = webpView.layer.animationForKey(FRAMES_KEY);
  if (playing instanceof CAKeyframeAnimation) {
    assert('帧动画动的是 contents', playing.keyPath, 'contents');
    assert('帧与帧之间不过渡', playing.calculationMode, 'discrete');
    assert('帧动画的时长 = 播一遍的时长', playing.duration.toFixed(3), '0.550');
    assert('帧动画的次数 = 文件里的循环次数', playing.repeatCount, 4);
    assert('一帧一个值', playing.values === null ? 0 : playing.values.length, 4);
    // 比 values 多一个：第 i 帧从 keyTimes[i] 显示到 keyTimes[i+1]
    assert('keyTimes 按每帧时长排', rounded(playing.keyTimes), '0.000,0.182,0.636,0.818,1.000');
    assert('离开窗口也不摘（removedOnCompletion 是 false）', playing.removedOnCompletion, false);
    assert('播完停在最后一帧', playing.fillMode, 'forwards');
  } else {
    console.log('  ✗ 没读到帧动画');
  }
  const looping = gifView.layer.animationForKey(FRAMES_KEY);
  assert('一直循环的动图：次数是 Infinity', looping ? looping.repeatCount : null, Infinity);
  // isAnimating 说的是 UIKit 自己的 animationImages，不是这个
  assert('isAnimating 不反映动图文件的播放', webpView.isAnimating, false);

  apngView.image = still;
  assert('换成静态图：帧动画摘掉', isPlaying(apngView), false);
  apngView.image = apng;
  assert('再换回动图：又挂上', isPlaying(apngView), true);
  apngView.image = null;
  assert('清掉图片：帧动画摘掉', isPlaying(apngView), false);
  apngView.image = apng;

  // 高亮图是动图时，高亮期间播它
  const press = new UIImageView();
  press.image = still;
  press.highlightedImage = gif;
  assert('高亮图是动图，没高亮时不播', isPlaying(press), false);
  press.isHighlighted = true;
  assert('高亮了：播高亮图', isPlaying(press), true);
  press.isHighlighted = false;
  assert('取消高亮：停', isPlaying(press), false);

  // ===== 3. 底层：图层的 contents，和自己挂的帧动画 =====
  const layer = new CALayer();
  layer.frame = new CGRect(16 + 4 * 76, 10, 64, 64);
  assert('新图层没有内容', layer.contents, null);
  const frames = webp.images;
  if (frames !== null) {
    layer.contents = frames[0];
    assert('contents 写进去的对象原样读回来', layer.contents === frames[0], true);
    host.layer.addSublayer(layer);

    const flip = CAKeyframeAnimation.animationWithKeyPath('contents');
    flip.values = frames;
    flip.calculationMode = 'discrete';
    flip.duration = webp.duration;
    // loopCount 可以直接给 repeatCount，Infinity 也可以
    flip.repeatCount = gif.loopCount === null ? 1 : gif.loopCount;
    assert('loopCount 直接赋给 repeatCount', flip.repeatCount, Infinity);
    assert('values 收图片', flip.values === null ? 0 : flip.values.length, 4);
    assert('values 读出来是 UIImage',
           flip.values !== null && flip.values[0] instanceof UIImage, true);
    layer.addAnimation(flip, { forKey: 'flip' });
    assert('自己挂的帧动画在图层上', (layer.animationKeys() || []).includes('flip'), true);

    const fade = CABasicAnimation.animationWithKeyPath('contents');
    fade.fromValue = frames[0];
    fade.toValue = frames[1];
    assert('fromValue 收图片，读出来是 UIImage', fade.fromValue instanceof UIImage, true);

    try {
      const wrong = CAKeyframeAnimation.animationWithKeyPath('contents');
      wrong.values = [1, 2];
      console.log('  ✗ contents 的 values 给了数字居然没抛');
    } catch (err) {
      assert('contents 的 values 给数字会抛', err instanceof TypeError, true);
    }
  }
  try {
    // @ts-expect-error contents 只收 UIImage
    layer.contents = '不是图片';
    console.log('  ✗ contents 给了字符串居然没抛');
  } catch (err) {
    assert('contents 给字符串会抛', err instanceof TypeError, true);
  }
  const blank = new CALayer();
  blank.contents = still;
  blank.contents = null;
  assert('contents 写 null 是清空', blank.contents, null);

  // ===== 4. 要等的那几条 =====
  (async () => {
    // 文件路径来的
    const path = application.fileSystem.temporary + '/acceptance-anim.webp';
    await application.fileSystem.writeBytes(path, blob);
    const fromFile = UIImage.imageWithContentsOfFile(path);
    assert('imageWithContentsOfFile：帧数',
           fromFile && fromFile.images ? fromFile.images.length : 0, 4);

    // 后台解码：给回来的是一张新图，帧信息都还在
    const ready = await webp.prepareForDisplay();
    assert('prepareForDisplay：动图给回来的不是 null', ready !== null, true);
    if (ready) {
      assert('prepareForDisplay：是一张新图', ready === webp, false);
      assert('prepareForDisplay：帧数还在', ready.images ? ready.images.length : 0, 4);
      assert('prepareForDisplay：每帧时长还在', rounded(ready.frameDurations),
             '0.100,0.250,0.100,0.100');
      assert('prepareForDisplay：循环次数还在', ready.loopCount, 4);
      assert('prepareForDisplay：帧自己还是静态图',
             ready.images ? ready.images[0].images : 'x', null);
      webpView.image = ready;
      assert('解码过的动图放进图片视图照样播', isPlaying(webpView), true);
    }
    const thumbnail = await webp.prepareThumbnail(new CGSize(24, 24));
    assert('缩略图是静态的（第一帧）', thumbnail !== null && thumbnail.images === null, true);
    const readyStill = await still.prepareForDisplay();
    assert('prepareForDisplay：静态图照旧', readyStill !== null && readyStill.images === null, true);

    // 视图离开窗口再回来，帧动画还在（系统会摘掉 removedOnCompletion 为 true 的）
    gifView.removeFromSuperview();
    await new Promise((resolve) => setTimeout(resolve, 400));
    assert('移出父视图 0.4 秒后帧动画还挂着', isPlaying(gifView), true);
    host.addSubview(gifView);
    assert('加回去之后还在', isPlaying(gifView), true);
    console.log('  ✓ 动图这一组跑完了');
  })().catch((err) => console.log('  ✗ 动图的异步部分抛了:', err && err.message));
}
