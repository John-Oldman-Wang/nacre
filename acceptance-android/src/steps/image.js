// 图片：ImageDecoder（来源、读头、解码成 Bitmap 或 Drawable、解码时的设置）、Bitmap、
// BitmapDrawable、AnimatedImageDrawable（动图的播放和 animationstart / animationend）、ImageView。
//
// 解码一律在后台做、返回 Promise；Java 自己抛的异常是 Promise 以异常的简单类名被拒。
// 测试用的图在 acceptance-android/assets/images/，由 scripts/make-test-images.py 生成：
//   halves.png  40 × 30，左半边纯红、右半边纯蓝
//   alpha.png   20 × 10，半透明的红（不透明的图 Android 不算预乘，验预乘要用它）
//   spin.gif    8 × 8，两帧（红、绿），每帧 100 毫秒，无限循环
//
// 最后一段把图和动图挂到屏幕上，看动图真的播、播完来事件。

/**
 * 抛了什么：没抛是「没抛」，抛了是错误的 name
 * @param {() => unknown} fn
 */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : typeof err;
  }
}

/**
 * Promise 被拒的原因：兑现了是「没拒」，被拒了是错误的 name
 * @param {() => Promise<unknown>} fn
 */
async function rejected(fn) {
  try {
    await fn();
    return '没拒';
  } catch (err) {
    return err instanceof Error ? err.name : typeof err;
  }
}

/**
 * 被拒时的错误信息（没拒是空串）
 * @param {() => Promise<unknown>} fn
 */
async function rejectMessage(fn) {
  try {
    await fn();
    return '';
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

/**
 * 跑 fn，收下这期间打的警告（console.warn 的第一个参数），用 ' | ' 连起来；没有警告是空串
 * @param {() => unknown} fn
 */
function warnings(fn) {
  const original = console.warn;
  /** @type {string[]} */
  const seen = [];
  console.warn = (/** @type {unknown} */ first) => { seen.push(String(first)); };
  try {
    fn();
  } finally {
    console.warn = original;
  }
  return seen.join(' | ');
}

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// halves.png 的字节（和 assets/images/halves.png 一样），用来验从 Blob、ArrayBuffer 解码
const HALVES_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAACgAAAAeCAIAAADRv8uKAAAALUlEQVR4nO3NsQkAAAzDsPz/dPpDSzeBV6M0WXdYe1nBYDAY' +
  'DAaDwWAwGPwMD5MCq41dYrpXAAAAAElFTkSuQmCC';

function halvesBytes() {
  const text = atob(HALVES_PNG_BASE64);
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
  return bytes;
}

/** @param {import("../main.js").StepContext} ctx */
export async function stepImage(ctx) {
  const { assert } = ctx;
  const activity = application.activity;
  /** @type {any} 故意写错类型的地方用它 */
  let bad;
  /** @type {any} */
  const G = globalThis;

  // ===== 有哪些类、哪些不能 new =====
  console.log('  --- 图片：类 ---');
  assert('ImageDecoder 是全局的类', typeof G.ImageDecoder, 'function');
  assert('Bitmap 是全局的类', typeof G.Bitmap, 'function');
  assert('BitmapDrawable 是全局的类', typeof G.BitmapDrawable, 'function');
  assert('AnimatedImageDrawable 是全局的类', typeof G.AnimatedImageDrawable, 'function');
  assert('ImageView 是全局的类', typeof G.ImageView, 'function');
  assert('不接 BitmapFactory', typeof G.BitmapFactory, 'undefined');
  assert('ImageDecoder.Source 挂在 ImageDecoder 上', typeof ImageDecoder.Source, 'function');
  assert('ImageDecoder.ImageInfo 挂在 ImageDecoder 上', typeof ImageDecoder.ImageInfo, 'function');
  assert('全局上没有带点的名字', G['ImageDecoder.Source'], undefined);
  assert('new ImageDecoder() 抛 TypeError', thrown(() => new G.ImageDecoder()), 'TypeError');
  assert('new ImageDecoder.Source() 抛 TypeError', thrown(() => new G.ImageDecoder.Source()), 'TypeError');
  assert('new ImageDecoder.ImageInfo() 抛 TypeError', thrown(() => new G.ImageDecoder.ImageInfo()), 'TypeError');
  assert('new Bitmap() 抛 TypeError', thrown(() => new G.Bitmap()), 'TypeError');
  assert('new AnimatedImageDrawable() 抛 TypeError', thrown(() => new G.AnimatedImageDrawable()), 'TypeError');
  assert('BitmapDrawable 继承 Drawable', BitmapDrawable.prototype instanceof Drawable, true);
  assert('AnimatedImageDrawable 继承 Drawable', AnimatedImageDrawable.prototype instanceof Drawable, true);
  assert('Drawable 是 EventTarget', Drawable.prototype instanceof EventTarget, true);
  assert('ImageView 继承 View', ImageView.prototype instanceof View, true);

  // ===== isMimeTypeSupported =====
  assert('isMimeTypeSupported("image/png")', ImageDecoder.isMimeTypeSupported('image/png'), true);
  assert('isMimeTypeSupported("image/gif")', ImageDecoder.isMimeTypeSupported('image/gif'), true);
  assert('isMimeTypeSupported("image/webp")', ImageDecoder.isMimeTypeSupported('image/webp'), true);
  assert('isMimeTypeSupported("text/plain")', ImageDecoder.isMimeTypeSupported('text/plain'), false);
  assert('isMimeTypeSupported 不给参数抛 TypeError',
         thrown(() => /** @type {any} */ (ImageDecoder).isMimeTypeSupported()), 'TypeError');

  // ===== createSource =====
  console.log('  --- 图片：来源 ---');
  const pngAsset = ImageDecoder.createSource('images/halves.png');
  const gifAsset = ImageDecoder.createSource('images/spin.gif');
  assert('createSource(路径) 得到 ImageDecoder.Source', pngAsset instanceof ImageDecoder.Source, true);
  const bytes = halvesBytes();
  const fromBlob = ImageDecoder.createSource(new Blob([bytes], { type: 'image/png' }));
  const fromBuffer = ImageDecoder.createSource(bytes.buffer.slice(0));
  const fromView = ImageDecoder.createSource(bytes);
  assert('createSource(Blob)', fromBlob instanceof ImageDecoder.Source, true);
  assert('createSource(ArrayBuffer)', fromBuffer instanceof ImageDecoder.Source, true);
  assert('createSource(Uint8Array)', fromView instanceof ImageDecoder.Source, true);
  assert('createSource 不给参数抛 TypeError',
         thrown(() => /** @type {any} */ (ImageDecoder).createSource()), 'TypeError');
  bad = 42;
  assert('createSource(42) 抛 TypeError', thrown(() => ImageDecoder.createSource(bad)), 'TypeError');
  bad = {};
  assert('createSource({}) 抛 TypeError', thrown(() => ImageDecoder.createSource(bad)), 'TypeError');
  bad = null;
  assert('createSource(null) 抛 TypeError', thrown(() => ImageDecoder.createSource(bad)), 'TypeError');

  // ===== decodeHeader =====
  console.log('  --- 图片：读头 ---');
  const pngInfo = await ImageDecoder.decodeHeader(pngAsset);
  assert('decodeHeader 得到 ImageInfo', pngInfo instanceof ImageDecoder.ImageInfo, true);
  assert('PNG 的宽', pngInfo.size.width, 40);
  assert('PNG 的高', pngInfo.size.height, 30);
  assert('PNG 的类型', pngInfo.mimeType, 'image/png');
  assert('PNG 不是动图', pngInfo.isAnimated, false);
  assert('ImageInfo 的字段只读',
         thrown(() => { /** @type {any} */ (pngInfo).mimeType = 'x'; }), 'TypeError');
  const gifInfo = await ImageDecoder.decodeHeader(gifAsset);
  assert('GIF 的宽高', gifInfo.size.width + '×' + gifInfo.size.height, '8×8');
  assert('GIF 的类型', gifInfo.mimeType, 'image/gif');
  assert('GIF 是动图', gifInfo.isAnimated, true);
  assert('从 Blob 读头', (await ImageDecoder.decodeHeader(fromBlob)).size.width, 40);
  bad = {};
  assert('decodeHeader({}) 以 TypeError 被拒', await rejected(() => ImageDecoder.decodeHeader(bad)), 'TypeError');
  assert('assets 里没有的文件以 FileNotFoundException 被拒',
         await rejected(() => ImageDecoder.decodeHeader(ImageDecoder.createSource('images/nope.png'))),
         'FileNotFoundException');
  const garbage = ImageDecoder.createSource(new Blob(['not an image']));
  assert('不是图片的字节以 DecodeException 被拒',
         await rejected(() => ImageDecoder.decodeHeader(garbage)), 'DecodeException');

  // ===== decodeBitmap =====
  console.log('  --- 图片：解码成 Bitmap ---');
  // 默认的 allocator 由系统定（文档：一般放在显存里，小图可能不是），所以这里只看宽高
  const plainDecoded = await ImageDecoder.decodeBitmap(pngAsset);
  assert('decodeBitmap 得到 Bitmap', plainDecoded instanceof Bitmap, true);
  assert('Bitmap 的宽', plainDecoded.width, 40);
  assert('Bitmap 的高', plainDecoded.height, 30);
  const hw = await ImageDecoder.decodeBitmap(pngAsset, { allocator: 'hardware' });
  assert("allocator: 'hardware' 解成放在显存里的图", hw.config, 'hardware');
  assert('显存里的图不可改', hw.isMutable, false);
  assert('显存里的图读不了像素：IllegalStateException', thrown(() => hw.getPixel(0, 0)), 'IllegalStateException');

  const sw = await ImageDecoder.decodeBitmap(pngAsset, { allocator: 'software' });
  assert("allocator: 'software' 的 config", sw.config, 'argb8888');
  assert('左半边是红的', sw.getPixel(5, 5), '#ff0000');
  assert('右半边是蓝的', sw.getPixel(35, 25), '#0000ff');
  assert('不透明的图 hasAlpha()', sw.hasAlpha(), false);
  assert('byteCount = 40 × 30 × 4', sw.byteCount, 4800);
  assert('allocationByteCount 不比 byteCount 小', sw.allocationByteCount >= 4800, true);
  assert('不透明的图 isPremultiplied 是 false', sw.isPremultiplied, false);
  assert('isRecycled 默认是 false', sw.isRecycled, false);
  assert('width 只读', thrown(() => { /** @type {any} */ (sw).width = 1; }), 'TypeError');
  assert('同一个来源再解一次', (await ImageDecoder.decodeBitmap(pngAsset)).width, 40);

  // 从字节解码
  const viaBlob = await ImageDecoder.decodeBitmap(fromBlob, { allocator: 'software' });
  assert('从 Blob 解码，读到红', viaBlob.getPixel(1, 1), '#ff0000');
  const viaBuffer = await ImageDecoder.decodeBitmap(fromBuffer, { allocator: 'software' });
  assert('从 ArrayBuffer 解码，读到蓝', viaBuffer.getPixel(39, 0), '#0000ff');
  const viaView = await ImageDecoder.decodeBitmap(fromView, { allocator: 'software' });
  assert('从 Uint8Array 解码', viaView.width + '×' + viaView.height, '40×30');

  // 密度：没设是 null
  sw.density = 320;
  assert('density 写 320 读回', sw.density, 320);
  sw.density = null;
  assert('density 写 null 读回 null（DENSITY_NONE）', sw.density, null);
  sw.density = '480';
  assert("density 写 '480' 照 Web IDL 转成数", sw.density, 480);
  bad = 'abc';
  assert("density 写 'abc' 抛 TypeError", thrown(() => { sw.density = bad; }), 'TypeError');

  // getPixel 的参数
  assert('getPixel 越界：IllegalArgumentException', thrown(() => sw.getPixel(40, 0)), 'IllegalArgumentException');
  bad = 'a';
  assert("getPixel('a', 0) 抛 TypeError", thrown(() => sw.getPixel(bad, 0)), 'TypeError');
  assert('getPixel 少给参数抛 TypeError', thrown(() => /** @type {any} */ (sw).getPixel(0)), 'TypeError');

  // ===== 解码时的设置 =====
  console.log('  --- 图片：解码时的设置 ---');
  const small = await ImageDecoder.decodeBitmap(pngAsset, {
    allocator: 'software', targetSize: { width: 20, height: 15 } });
  assert('targetSize 缩到 20×15', small.width + '×' + small.height, '20×15');
  assert('缩小后左边还是红', small.getPixel(2, 2), '#ff0000');
  assert('缩小后右边还是蓝', small.getPixel(17, 12), '#0000ff');
  const sampled = await ImageDecoder.decodeBitmap(pngAsset, { allocator: 'software', targetSampleSize: 2 });
  assert('targetSampleSize 2 是 20×15', sampled.width + '×' + sampled.height, '20×15');
  const cropped = await ImageDecoder.decodeBitmap(pngAsset, {
    allocator: 'software', crop: { left: 20, top: 0, right: 40, bottom: 30 } });
  assert('crop 取右半边：宽 20', cropped.width, 20);
  assert('crop 取右半边：是蓝的', cropped.getPixel(0, 0), '#0000ff');
  const mutable = await ImageDecoder.decodeBitmap(pngAsset, { mutableRequired: true });
  assert('mutableRequired 得到可改的图', mutable.isMutable, true);
  const alphaAsset = ImageDecoder.createSource('images/alpha.png');
  const premul = await ImageDecoder.decodeBitmap(alphaAsset, { allocator: 'software' });
  assert('带透明度的图 hasAlpha()', premul.hasAlpha(), true);
  assert('带透明度的图默认 isPremultiplied 是 true', premul.isPremultiplied, true);
  const unpremul = await ImageDecoder.decodeBitmap(alphaAsset, {
    allocator: 'software', unpremultipliedRequired: true });
  assert('unpremultipliedRequired 之后 isPremultiplied 是 false', unpremul.isPremultiplied, false);
  const lowRam = await ImageDecoder.decodeBitmap(pngAsset, { allocator: 'software', memorySizePolicy: 'lowRam' });
  assert("memorySizePolicy: 'lowRam' 下不透明的图解成 rgb565", lowRam.config, 'rgb565');
  const alphaMask = await ImageDecoder.decodeBitmap(pngAsset, {
    allocator: 'software', decodeAsAlphaMaskEnabled: true });
  assert('decodeAsAlphaMaskEnabled 对三个通道的图不起作用', alphaMask.config, 'argb8888');
  assert('options 给 null 当成空的', (await ImageDecoder.decodeBitmap(pngAsset, null)).width, 40);
  assert('hardware 加 mutableRequired 以 IllegalStateException 被拒',
         await rejected(() => ImageDecoder.decodeBitmap(pngAsset, { allocator: 'hardware', mutableRequired: true })),
         'IllegalStateException');
  assert('targetSize 0×0 以 IllegalArgumentException 被拒',
         await rejected(() => ImageDecoder.decodeBitmap(pngAsset, { targetSize: { width: 0, height: 0 } })),
         'IllegalArgumentException');
  bad = { allocator: 'gpu' };
  assert("allocator: 'gpu' 以 TypeError 被拒", await rejected(() => ImageDecoder.decodeBitmap(pngAsset, bad)),
         'TypeError');
  assert('allocator 写错时列出全部可选值',
         await rejectMessage(() => ImageDecoder.decodeBitmap(pngAsset, bad)),
         'allocator has no value "gpu"; expected one of: default / software / sharedMemory / hardware');
  bad = { memorySizePolicy: 'small' };
  assert("memorySizePolicy: 'small' 以 TypeError 被拒",
         await rejected(() => ImageDecoder.decodeBitmap(pngAsset, bad)), 'TypeError');
  bad = { targetSize: 'big' };
  assert("targetSize: 'big' 以 TypeError 被拒", await rejected(() => ImageDecoder.decodeBitmap(pngAsset, bad)),
         'TypeError');
  bad = { targetSize: { width: 'a', height: 1 } };
  assert('targetSize 的宽不是数以 TypeError 被拒',
         await rejected(() => ImageDecoder.decodeBitmap(pngAsset, bad)), 'TypeError');
  bad = { crop: { left: 0 } };
  assert('crop 少了边以 TypeError 被拒', await rejected(() => ImageDecoder.decodeBitmap(pngAsset, bad)),
         'TypeError');
  bad = {};
  assert('decodeBitmap({}) 以 TypeError 被拒', await rejected(() => ImageDecoder.decodeBitmap(bad)), 'TypeError');
  assert('不是图片的字节解码以 DecodeException 被拒',
         await rejected(() => ImageDecoder.decodeBitmap(garbage)), 'DecodeException');
  const firstFrame = await ImageDecoder.decodeBitmap(gifAsset, { allocator: 'software' });
  assert('动图 decodeBitmap 得到第一帧：8×8', firstFrame.width + '×' + firstFrame.height, '8×8');
  assert('动图的第一帧是红的', firstFrame.getPixel(4, 4), '#ff0000');

  // ===== Bitmap 的类方法：缩放、裁切 =====
  console.log('  --- 图片：缩放和裁切 ---');
  const big = Bitmap.createScaledBitmap(sw, 80, 60, true);
  assert('createScaledBitmap 得到新的 Bitmap', big instanceof Bitmap && big !== sw, true);
  assert('createScaledBitmap 的宽高', big.width + '×' + big.height, '80×60');
  assert('放大后左边是红', big.getPixel(10, 10), '#ff0000');
  assert('放大后右边是蓝', big.getPixel(70, 50), '#0000ff');
  assert('createScaledBitmap 宽是 0：IllegalArgumentException',
         thrown(() => Bitmap.createScaledBitmap(sw, 0, 10, true)), 'IllegalArgumentException');
  bad = {};
  assert('createScaledBitmap({}) 抛 TypeError', thrown(() => Bitmap.createScaledBitmap(bad, 1, 1, true)), 'TypeError');
  assert('createScaledBitmap 少给参数抛 TypeError',
         thrown(() => /** @type {any} */ (Bitmap).createScaledBitmap(sw, 1, 1)), 'TypeError');
  const right = Bitmap.createBitmap(sw, 20, 0, 20, 30);
  assert('createBitmap 裁出右半边：20×30', right.width + '×' + right.height, '20×30');
  assert('裁出来的是蓝的', right.getPixel(1, 1), '#0000ff');
  assert('createBitmap 超出范围：IllegalArgumentException',
         thrown(() => Bitmap.createBitmap(sw, 30, 0, 20, 30)), 'IllegalArgumentException');
  assert('createBitmap 只给一个参数抛 TypeError',
         thrown(() => /** @type {any} */ (Bitmap).createBitmap(sw)), 'TypeError');

  // recycle
  const doomed = Bitmap.createScaledBitmap(sw, 4, 4, false);
  doomed.recycle();
  assert('recycle 之后 isRecycled 是 true', doomed.isRecycled, true);
  assert('recycle 之后读像素：IllegalStateException', thrown(() => doomed.getPixel(0, 0)), 'IllegalStateException');
  assert('recycle 两次不抛', thrown(() => doomed.recycle()), '没抛');

  // ===== BitmapDrawable =====
  console.log('  --- 图片：BitmapDrawable ---');
  const plain = Bitmap.createScaledBitmap(sw, 40, 30, false);
  plain.density = null;
  const bd = new BitmapDrawable(plain);
  assert('BitmapDrawable 的 bitmap 就是给它的那个', bd.bitmap, plain);
  assert('BitmapDrawable 是 Drawable', bd instanceof Drawable, true);
  assert('密度没设的图固有宽就是像素宽', bd.intrinsicWidth, 40);
  assert('bitmap 只读', thrown(() => { /** @type {any} */ (bd).bitmap = null; }), 'TypeError');
  assert('new BitmapDrawable(null) 能建，bitmap 是 null', new BitmapDrawable(null).bitmap, null);
  assert('new BitmapDrawable() 抛 TypeError', thrown(() => /** @type {any} */ (new G.BitmapDrawable())), 'TypeError');
  bad = {};
  assert('new BitmapDrawable({}) 抛 TypeError', thrown(() => new BitmapDrawable(bad)), 'TypeError');
  assert('tileModeX 默认是 null', bd.tileModeX, null);
  bd.tileModeX = 'repeat';
  assert("tileModeX 写 'repeat' 读回", bd.tileModeX, 'repeat');
  bd.tileModeY = 'mirror';
  assert("tileModeY 写 'mirror' 读回", bd.tileModeY, 'mirror');
  bd.tileModeX = null;
  assert('tileModeX 写 null 读回 null', bd.tileModeX, null);
  bd.tileModeX = 'clamp';
  assert('tileModeX 写错：一条警告',
         warnings(() => { bd.tileModeX = /** @type {any} */ ('tile'); }),
         '[Nacre] tileModeX has no value "tile"; expected one of: clamp / repeat / mirror / decal, ignored');
  assert('tileModeX 写错后不变', bd.tileModeX, 'clamp');
  bd.setTileModeXY('decal', 'repeat');
  assert('setTileModeXY 设两个方向', bd.tileModeX + ',' + bd.tileModeY, 'decal,repeat');
  bd.setTileModeXY(null, null);
  assert('setTileModeXY(null, null) 不平铺', String(bd.tileModeX) + ',' + String(bd.tileModeY), 'null,null');
  bad = 'tile';
  assert('setTileModeXY 写错抛 TypeError', thrown(() => bd.setTileModeXY(bad, null)), 'TypeError');
  assert('isFilterBitmap 默认是 true', bd.isFilterBitmap, true);
  bd.isFilterBitmap = false;
  assert('isFilterBitmap 写 false 读回', bd.isFilterBitmap, false);
  class Tiled extends BitmapDrawable {}
  assert('BitmapDrawable 能在 JS 里继承', new Tiled(plain) instanceof BitmapDrawable, true);

  // ===== ImageView =====
  console.log('  --- 图片：ImageView ---');
  const iv = new ImageView(activity);
  assert('new ImageView 是 View', iv instanceof View, true);
  assert('new ImageView() 抛 TypeError', thrown(() => /** @type {any} */ (new G.ImageView())), 'TypeError');
  assert('drawable 默认是 null', iv.drawable, null);
  iv.setImageBitmap(sw);
  assert('setImageBitmap 之后 drawable 是 BitmapDrawable', iv.drawable instanceof BitmapDrawable, true);
  assert('那个 BitmapDrawable 拿着这张图', /** @type {BitmapDrawable} */ (iv.drawable).bitmap, sw);
  iv.setImageDrawable(bd);
  assert('setImageDrawable 之后 drawable 就是它', iv.drawable, bd);
  iv.setImageDrawable(null);
  assert('setImageDrawable(null) 清掉', iv.drawable, null);
  // 照 Java：setImageBitmap 总是用 ImageView 自己的那个 BitmapDrawable，给 null 是它不拿图
  iv.setImageBitmap(null);
  assert('setImageBitmap(null) 之后 drawable 是不拿图的 BitmapDrawable',
         iv.drawable instanceof BitmapDrawable && iv.drawable.bitmap === null, true);
  bad = {};
  assert('setImageBitmap({}) 抛 TypeError', thrown(() => iv.setImageBitmap(bad)), 'TypeError');
  bad = 'x';
  assert("setImageDrawable('x') 抛 TypeError", thrown(() => iv.setImageDrawable(bad)), 'TypeError');
  assert('drawable 只读', thrown(() => { /** @type {any} */ (iv).drawable = null; }), 'TypeError');

  assert('scaleType 默认是 fitCenter', iv.scaleType, 'fitCenter');
  for (const t of ['matrix', 'fitXY', 'fitStart', 'fitCenter', 'fitEnd', 'center', 'centerCrop', 'centerInside']) {
    iv.scaleType = /** @type {any} */ (t);
    assert('scaleType 写 ' + t + ' 读回', iv.scaleType, t);
  }
  assert('scaleType 写错：一条警告',
         warnings(() => { iv.scaleType = /** @type {any} */ ('cover'); }),
         '[Nacre] scaleType has no value "cover"; expected one of: matrix / fitXY / fitStart / fitCenter / ' +
         'fitEnd / center / centerCrop / centerInside, ignored');
  assert('scaleType 写错后不变', iv.scaleType, 'centerInside');
  assert('adjustViewBounds 默认是 false', iv.adjustViewBounds, false);
  iv.adjustViewBounds = true;
  assert('adjustViewBounds 写 true 读回', iv.adjustViewBounds, true);
  assert('maxWidth 默认是 null（不限）', iv.maxWidth, null);
  iv.maxWidth = 100;
  assert('maxWidth 写 100 读回', iv.maxWidth, 100);
  iv.maxWidth = null;
  assert('maxWidth 写 null 读回 null', iv.maxWidth, null);
  iv.maxHeight = '50';
  assert("maxHeight 写 '50' 照 Web IDL 转成数", iv.maxHeight, 50);
  bad = 'abc';
  assert("maxHeight 写 'abc' 抛 TypeError", thrown(() => { iv.maxHeight = bad; }), 'TypeError');
  assert('imageAlpha 默认是 255', iv.imageAlpha, 255);
  iv.imageAlpha = 128;
  assert('imageAlpha 写 128 读回', iv.imageAlpha, 128);
  assert('cropToPadding 默认是 false', iv.cropToPadding, false);
  iv.cropToPadding = true;
  assert('cropToPadding 写 true 读回', iv.cropToPadding, true);
  assert("setColorFilter('#ff0000') 能调", thrown(() => iv.setColorFilter('#ff0000')), '没抛');
  assert("setColorFilter('#ff000080', 'multiply') 能调", thrown(() => iv.setColorFilter('#ff000080', 'multiply')),
         '没抛');
  bad = 'tint';
  assert('setColorFilter 的模式写错抛 TypeError', thrown(() => iv.setColorFilter('#ff0000', bad)), 'TypeError');
  assert('setColorFilter 的颜色写错抛 TypeError', thrown(() => iv.setColorFilter('#GGG')), 'TypeError');
  assert('setColorFilter 不给参数抛 TypeError', thrown(() => /** @type {any} */ (iv).setColorFilter()), 'TypeError');
  assert('clearColorFilter 能调', thrown(() => iv.clearColorFilter()), '没抛');

  // ===== decodeDrawable 和 AnimatedImageDrawable =====
  console.log('  --- 图片：动图 ---');
  const still = await ImageDecoder.decodeDrawable(pngAsset);
  assert('静态图 decodeDrawable 得到 BitmapDrawable', still instanceof BitmapDrawable, true);
  assert('它的 bitmap 宽 40', /** @type {BitmapDrawable} */ (still).bitmap?.width, 40);
  const stillSmall = await ImageDecoder.decodeDrawable(pngAsset, { targetSize: { width: 20, height: 15 } });
  assert('decodeDrawable 也认 targetSize', /** @type {BitmapDrawable} */ (stillSmall).bitmap?.width, 20);
  assert('decodeDrawable 不是图片以 DecodeException 被拒',
         await rejected(() => ImageDecoder.decodeDrawable(garbage)), 'DecodeException');
  const anim = /** @type {AnimatedImageDrawable} */ (await ImageDecoder.decodeDrawable(gifAsset));
  assert('动图 decodeDrawable 得到 AnimatedImageDrawable', anim instanceof AnimatedImageDrawable, true);
  assert('AnimatedImageDrawable 是 EventTarget', anim instanceof EventTarget, true);
  assert('动图的固有宽高', anim.intrinsicWidth > 0 && anim.intrinsicWidth === anim.intrinsicHeight, true);
  assert('文件里写的是无限循环', anim.repeatCount, 'infinite');
  assert('刚解出来没在播', anim.isRunning, false);
  anim.repeatCount = 2;
  assert('repeatCount 写 2 读回', anim.repeatCount, 2);
  anim.repeatCount = 'infinite';
  assert("repeatCount 写 'infinite' 读回", anim.repeatCount, 'infinite');
  assert('repeatCount 写 -5：IllegalArgumentException', thrown(() => { anim.repeatCount = -5; }),
         'IllegalArgumentException');
  assert('repeatCount 写错名字：一条警告',
         warnings(() => { anim.repeatCount = /** @type {any} */ ('forever'); }),
         '[Nacre] repeatCount has no value "forever"; expected one of: infinite, ignored');
  assert('repeatCount 写错后不变', anim.repeatCount, 'infinite');
  assert('isRunning 只读', thrown(() => { /** @type {any} */ (anim).isRunning = true; }), 'TypeError');

  // ===== 挂到屏幕上：动图真的播、播完来事件 =====
  console.log('  --- 图片：挂到屏幕上 ---');
  const screen = new LinearLayout(activity);
  screen.setPadding(48, 400, 48, 0);
  const picture = new ImageView(activity);
  picture.setImageBitmap(big);
  const spinner = new ImageView(activity);
  spinner.setImageDrawable(anim);
  screen.addView(picture);
  screen.addView(spinner);
  activity.setContentView(screen);
  assert('ImageView 拿着动图', spinner.drawable, anim);

  /** @type {string[]} */
  const events = [];
  /** @param {string} type */
  const waitFor = (type) => new Promise((resolve) => {
    anim.addEventListener(type, () => resolve(true), { once: true });
    setTimeout(() => resolve(false), 3000);
  });
  anim.addEventListener('animationstart', (e) => { events.push(e.type); });
  anim.addEventListener('animationend', (e) => { events.push(e.type); });

  // 播一遍（不重复）：两帧各 100 毫秒，播完自己停
  anim.repeatCount = 0;
  const started = waitFor('animationstart');
  const ended = waitFor('animationend');
  anim.start();
  assert('start() 之后来 animationstart', await started, true);
  assert('播完一遍来 animationend', await ended, true);
  assert('播完之后 isRunning 是 false', anim.isRunning, false);

  // 无限循环时 stop() 停下，也来 animationend
  anim.repeatCount = 'infinite';
  const started2 = waitFor('animationstart');
  anim.start();
  assert('再 start() 又来 animationstart', await started2, true);
  await sleep(500);
  assert('无限循环 500 毫秒之后还在播', anim.isRunning, true);
  const ended2 = waitFor('animationend');
  anim.stop();
  assert('stop() 之后 isRunning 是 false', anim.isRunning, false);
  assert('stop() 之后来 animationend', await ended2, true);
  assert('事件的顺序', events.join(','), 'animationstart,animationend,animationstart,animationend');
  anim.start();
  await sleep(500);
  assert('图片和动图在屏幕上画了半秒', screen.childCount, 2);
  anim.stop();
}
