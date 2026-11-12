// UIImage 的四条取图路径、UIImageView、以及 fetch 下来的网络图。

/** @param {import("../main.js").StepContext} ctx */
export function stepImage(ctx) {
  const { assert } = ctx;
  const host = ctx.section('UIImage / UIImageView：居中、填满、九宫格、着色、网络图', 180);

  // ===== 图片 =====
  console.log('  --- UIImage ---');
  {
    // 1. bundle 里的普通文件。JS/ 是 folder reference，目录结构原样进
    // bundle，所以名字里带路径。实测 imageNamed 认子目录（但不递归搜）。
    const dot = UIImage.imageNamed('JS/assets/dot');
    if (dot === null) {
      console.log('  ✗ JS/assets/dot 没找到');
    } else {
      // size 是**点**：三个文件分别是 10/20/30 像素，读出来都该是 10x10
      assert('size 是点，不随倍率变', dot.size.width + 'x' + dot.size.height, '10x10');
      assert('@2x/@3x 被自动选中（倍率 > 1）', dot.scale > 1, true);
      assert('像素 = size × scale', dot.size.width * dot.scale >= 20, true);
      assert('普通图片不是 symbol', dot.isSymbolImage, false);
      assert('方向默认朝上', dot.imageOrientation, 'up');
      assert('普通图片没有九宫格边距', dot.capInsets.top, 0);
      assert('静态图 duration 为 0', dot.duration, 0);
    }

    // 2. 找不到是**合法答案**，返回 null 而不是抛
    assert('名字不存在返回 null', UIImage.imageNamed('根本没有这张图'), null);
    assert('路径读不到也返回 null',
         UIImage.imageWithContentsOfFile('/nonexistent/x.png'), null);

    // 3. SF Symbols：上千个图标，不占包体积
    const star = UIImage.systemImageNamed('star.fill');
    assert('SF Symbol 拿得到', star !== null, true);
    if (star) {
      assert('isSymbolImage 为真', star.isSymbolImage, true);
      // 实测纠正：SF Symbol 的 renderingMode 是 'automatic'，不是
      // 'alwaysTemplate'。「按 tintColor 上色」是**绘制上下文**决定的，
      // 不写在图片上——automatic 的意思正是「由用的地方决定」。
      assert('symbol 的渲染模式是 automatic', star.renderingMode, 'automatic');
    }

    // 4. 不可变性：这些方法返回新图，原图不动
    if (star) {
      const originalMode = star.imageWithRenderingMode('alwaysOriginal');
      assert('改渲染模式返回新对象', originalMode === star, false);
      assert('新图的渲染模式变了', originalMode.renderingMode, 'alwaysOriginal');
      assert('原图没被改', star.renderingMode, 'automatic');
    }

    // 5. 九宫格：四条边不拉伸，只拉中间。小图铺大容器的正解。
    const frame = UIImage.imageNamed('JS/assets/frame');
    if (frame === null) {
      console.log('  ✗ JS/assets/frame 没找到');
    } else {
      assert('原图没有 capInsets', frame.capInsets.left, 0);
      const stretchable = frame.resizableImage({
        withCapInsets: new UIEdgeInsets(6, 6, 6, 6),
      });
      assert('九宫格边距读得回来', stretchable.capInsets.left, 6);
      // 实测纠正：resizableImageWithCapInsets: 这个单参重载默认是 tile，
      // 要 stretch 得用带 resizingMode 的那个重载显式指定
      assert('单参重载默认平铺', stretchable.resizingMode, 'tile');
      const tiled = frame.resizableImage({
        withCapInsets: new UIEdgeInsets(6, 6, 6, 6),
        resizingMode: 'stretch',
      });
      assert('显式指定 stretch 才拉伸', tiled.resizingMode, 'stretch');
      // 普通对象也认（写入宽、读出窄）
      const fromPlainObject = frame.resizableImage({
        withCapInsets: { top: 2, left: 3, bottom: 4, right: 5 },
      });
      assert('capInsets 收普通对象', fromPlainObject.capInsets.right, 5);
      assert('读出来的是 UIEdgeInsets',
           fromPlainObject.capInsets instanceof UIEdgeInsets, true);
    }

    // 6. 枚举写错要抛，不静默忽略也不退回默认值
    try {
      // @ts-expect-error 'template' 不是合法的渲染模式
      star.imageWithRenderingMode('template');
      console.log('  ✗ 枚举写错居然通过了');
    } catch (err) {
      console.log('  ✓ 渲染模式写错被拒:', err.message);
    }

    // 7. Blob → UIImage：字节全程不进 V8 堆。
    // 这里用手搓的 2x2 PNG，fetch 下来的 Blob 走的是同一条路。
    const pngBytes = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 2,
      0, 0, 0, 2, 8, 6, 0, 0, 0, 114, 182, 13, 36, 0, 0, 0, 17, 73, 68, 65, 84,
      120, 218, 99, 248, 127, 144, 253, 63, 8, 51, 192, 24, 0, 101, 94, 11, 25,
      206, 178, 233, 129, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
    ]);
    const blob = new Blob([pngBytes], { type: 'image/png' });
    const fromBytes = UIImage.imageWithData(blob);
    assert('Blob 解得出图', fromBytes !== null, true);
    if (fromBytes) {
      assert('没给 scale 时按 1 算', fromBytes.scale, 1);
      assert('2x2 像素、scale 1 → size 2x2',
           fromBytes.size.width + 'x' + fromBytes.size.height, '2x2');
    }
    const atScale2 = UIImage.imageWithData(blob, { scale: 2 });
    assert('给了 scale 之后 size 减半', atScale2 === null ? '?' : atScale2.size.width, 1);
    assert('不是图片的字节返回 null',
         UIImage.imageWithData(new Blob(['这不是图片'])), null);
  }

  // ===== UIImageView =====
  console.log('  --- UIImageView ---');
  {
    const dotImage = UIImage.imageNamed('JS/assets/dot');
    const iv = new UIImageView();
    assert('UIImageView 是 UIView', iv instanceof UIView, true);
    assert('默认没有图', iv.image, null);

    iv.image = dotImage;
    assert('写进去读回来是同一个对象', iv.image === dotImage, true);

    // 固有尺寸就是图片尺寸——第 3c 步做完 Auto Layout 之后，
    // 「比例对不上」这个问题大半会自己消失
    assert('intrinsicContentSize 等于图片尺寸',
         iv.intrinsicContentSize.width, dotImage === null ? '?' : dotImage.size.width);

    // 小图放进大容器：靠 contentMode，不是 UIImageView 自己的事
    iv.contentMode = 'scaleAspectFit';
    iv.clipsToBounds = true;      // scaleAspectFill 时必须配，否则溢出画到外面
    assert('contentMode 写入生效', iv.contentMode, 'scaleAspectFit');

    const symbol = UIImage.systemImageNamed('star.fill');
    iv.highlightedImage = symbol;
    assert('highlightedImage 读回来', iv.highlightedImage === symbol, true);
    iv.isHighlighted = true;
    assert('isHighlighted 写入生效', iv.isHighlighted, true);
    iv.isHighlighted = false;
    assert('逐帧动画没在跑', iv.isAnimating, false);

    // 上屏：左边原尺寸居中（小图不该被放大），右边等比填满并裁掉溢出
    const centeredView = new UIImageView();
    centeredView.image = dotImage;
    centeredView.contentMode = 'center';
    centeredView.backgroundColor = UIColor.secondarySystemBackgroundColor;
    centeredView.frame = new CGRect(16, 0, 100, 60);
    host.addSubview(centeredView);

    const fillView = new UIImageView();
    fillView.image = dotImage;
    fillView.contentMode = 'scaleAspectFill';
    fillView.clipsToBounds = true;
    fillView.frame = new CGRect(132, 0, 100, 60);
    host.addSubview(fillView);

    // 九宫格铺满：20pt 的边框图拉成 100x60，四角不变形
    const nineSliceView = new UIImageView();
    const frameImage = UIImage.imageNamed('JS/assets/frame');
    if (frameImage) {
      nineSliceView.image = frameImage.resizableImage({
        withCapInsets: new UIEdgeInsets(6, 6, 6, 6),
      });
    }
    nineSliceView.frame = new CGRect(248, 0, 100, 60);
    host.addSubview(nineSliceView);

    // 模板图 + tintColor：同一张 symbol 按颜色重新上色
    const tintedView = new UIImageView();
    tintedView.image = symbol;
    tintedView.tintColor = UIColor.systemPinkColor;
    tintedView.contentMode = 'scaleAspectFit';
    tintedView.frame = new CGRect(16, 70, 60, 40);
    host.addSubview(tintedView);
    assert('tintColor 读回来是语义色的名字', tintedView.tintColor, 'systemPink');

    // 后台解码：解码默认在绘制时发生（主线程），这个把它挪到后台
    if (dotImage) {
      dotImage.prepareForDisplay().then((ready) => {
        assert('prepareForDisplay 给回一张图', ready !== null, true);
        assert('解好的图尺寸不变',
             ready === null ? '?' : ready.size.width, dotImage.size.width);
      });
      dotImage.prepareThumbnail(new CGSize(5, 5)).then((thumbnail) => {
        assert('prepareThumbnail 给回一张图', thumbnail !== null, true);
      });
    }
  }

  // ===== 真实的网络图片：fetch → Blob → UIImage =====
  //
  // 这是第 6 步（fetch / Blob）的直接收益：字节从 NSURLSession 下来之后
  // 一路留在原生的 NSData 里，变成 UIImage 再上屏，**全程不进 V8 堆**。
  // JS 侧从头到尾只拿着两个句柄。
  const remoteView = new UIImageView();
  remoteView.contentMode = 'scaleAspectFill';
  remoteView.clipsToBounds = true;
  remoteView.backgroundColor = UIColor.secondarySystemBackgroundColor;
  remoteView.frame = new CGRect(92, 70, 160, 110);
  host.addSubview(remoteView);

  (async () => {
    const imageURL = 'https://picsum.photos/200/200?random=1';
    console.log('  --- 网络图片 ---');
    const t0 = Date.now();
    try {
      const res = await fetch(imageURL);
      assert('HTTP 状态', res.ok, true);
      const blob = await res.blob();
      console.log('  ✓ 下载完成', blob.size, '字节，type =', blob.type,
                  '，耗时', Date.now() - t0, 'ms');

      const img = UIImage.imageWithData(blob);
      if (img === null) {
        console.log('  ✗ 字节解不成图片');
        return;
      }
      assert('网络图解出来了', img.size.width + 'x' + img.size.height, '200x200');
      assert('没给 scale，按 1 算', img.scale, 1);

      // 解码挪到后台再上屏。200x200 其实不至于掉帧，但大图必须这么做——
      // 不走这条，解码会发生在第一次绘制时，也就是主线程。
      const ready = await img.prepareForDisplay();
      assert('后台解码后尺寸不变',
           ready === null ? '?' : ready.size.width, 200);
      remoteView.image = ready ?? img;
      console.log('  ✓ 网络图已上屏，全程', Date.now() - t0, 'ms（字节没进过 V8 堆）');
    } catch (err) {
      // 没网就是没网，说清楚而不是装作通过了
      console.log('  ! 网络图片这一段没跑成:', err.message,
                  '（需要能访问 picsum.photos）');
    }
  })();
}
