// 图片：AImageDecoder（读头、解码成 Bitmap 或 Drawable、解码时的设置）、Bitmap、BitmapDrawable、
// AnimatedImageDrawable（动图的播放和 animationstart / animationend）、ImageView。
//
// 照「接类的总则」（2026-11-26）重写：
// - 解码一律在后台做、返回 Promise。来源直接给：Blob、ArrayBuffer、typed array，或者 assets 里的路径。
//   参数在 JS 里当场查，查出来的错和 Java 自己抛的异常都是 Promise 被拒。
// - Bitmap 和动图是值对象：建出来就有原生对象，不分自由和挂上。像素尺寸、解码尺寸是 px。
// - BitmapDrawable 只在 JS 里记状态，每用在一个挂着的视图上按那个页面建一个原生对象（外观组那一套）。
// - 动图只有解出来的那一个原生对象，每用在一个视图上是一个薄的原生 Drawable，画的都是它。
// - ImageView 的成员都是状态：读回写进去的值；长度是 dp。
//
// 测试用的图在 acceptance-android/assets/images/，由 scripts/make-test-images.py 生成：
//   halves.png  40 × 30，左半边纯红、右半边纯蓝
//   alpha.png   20 × 10，半透明的红（不透明的图 Android 不算预乘，验预乘要用它）
//   spin.gif    8 × 8，两帧（红、绿），每帧 100 毫秒，无限循环

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
 * Promise 被拒的原因：兑现了是「没拒」，被拒了是错误的 name；没返回 Promise（当场抛了）是「当场抛了」
 * @param {() => Promise<unknown>} fn
 */
async function rejected(fn) {
  let p;
  try {
    p = fn();
  } catch (err) {
    return '当场抛了 ' + (err instanceof Error ? err.name : typeof err);
  }
  try {
    await p;
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

/**
 * 跑 fn，抛了的和打的警告都收下来：没有是空串
 * @param {() => unknown} fn
 */
function problems(fn) {
  /** @type {string[]} */
  const seen = [];
  const w = warnings(() => {
    try {
      fn();
    } catch (err) {
      seen.push(err instanceof Error ? err.name + ': ' + err.message : String(err));
    }
  });
  if (w !== '') seen.push(w);
  return seen.join(' | ');
}

/** @param {number} ms */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** @param {unknown} v */
const json = (v) => JSON.stringify(v);

/** 布局组的 frame：排出来的宽，dp；还没排过版是 null @param {View} v @returns {number | null} */
const frameWidth = (v) => { const f = /** @type {any} */ (v).frame; return f === null ? null : f.width; };
/** @param {View} v @returns {number | null} */
const frameHeight = (v) => { const f = /** @type {any} */ (v).frame; return f === null ? null : f.height; };
/** 两个数差不到 tolerance 算一样 @param {number | null} a @param {number} b @param {number} tolerance */
const near = (a, b, tolerance) => a !== null && Math.abs(a - b) < tolerance;

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
  const activity = /** @type {Activity} */ (ctx.activity);
  /** @type {any} 故意写错类型的地方用它 */
  let bad;
  /** @type {any} */
  const G = globalThis;

  // ===== 有哪些类、哪些不能 new =====
  console.log('  --- 图片：类 ---');
  assert('AImageDecoder 是全局的类', typeof G.AImageDecoder, 'function');
  // Java 的 ImageDecoder 和 Web（WebCodecs）的 ImageDecoder 同名，撞了加 A，Web 的名字空出来
  assert('全局上没有 ImageDecoder：这个名字是 Web 的', typeof G.ImageDecoder, 'undefined');
  assert('AImageDecoder 的类名是 AImageDecoder', G.AImageDecoder.name, 'AImageDecoder');
  /** @type {string} */
  let ctorMessage = '';
  try { new G.AImageDecoder(); } catch (err) { ctorMessage = err instanceof Error ? err.message : String(err); }
  assert('new AImageDecoder() 的报错里是 AImageDecoder',
         ctorMessage.includes('AImageDecoder') && !/(^|[^A])ImageDecoder/.test(ctorMessage), true);
  assert('decodeHeader 的报错里是 AImageDecoder',
         (await rejectMessage(() => /** @type {any} */ (G.AImageDecoder).decodeHeader())).includes("on 'AImageDecoder'"),
         true);
  /** @type {string} */
  let infoMessage = '';
  try { new G.AImageDecoder.ImageInfo(); } catch (err) { infoMessage = err instanceof Error ? err.message : String(err); }
  assert('new AImageDecoder.ImageInfo() 的报错里是 AImageDecoder',
         infoMessage.includes('AImageDecoder') && !/(^|[^A])ImageDecoder/.test(infoMessage), true);
  /** @type {string} */
  let bitmapMessage = '';
  try { new G.Bitmap(); } catch (err) { bitmapMessage = err instanceof Error ? err.message : String(err); }
  assert('new Bitmap() 的报错指向 AImageDecoder',
         bitmapMessage.includes('AImageDecoder') && !/(^|[^A])ImageDecoder/.test(bitmapMessage), true);
  assert('Bitmap 是全局的类', typeof G.Bitmap, 'function');
  assert('BitmapDrawable 是全局的类', typeof G.BitmapDrawable, 'function');
  assert('AnimatedImageDrawable 是全局的类', typeof G.AnimatedImageDrawable, 'function');
  assert('ImageView 是全局的类', typeof G.ImageView, 'function');
  assert('不接 BitmapFactory', typeof G.BitmapFactory, 'undefined');
  assert('AImageDecoder.ImageInfo 挂在 AImageDecoder 上', typeof AImageDecoder.ImageInfo, 'function');
  assert('没有 AImageDecoder.Source 了', G.AImageDecoder.Source, undefined);
  assert('没有 AImageDecoder.createSource 了', G.AImageDecoder.createSource, undefined);
  assert('全局上没有带点的名字', G['AImageDecoder.Source'], undefined);
  assert('new AImageDecoder() 抛 TypeError', thrown(() => new G.AImageDecoder()), 'TypeError');
  assert('new AImageDecoder.ImageInfo() 抛 TypeError', thrown(() => new G.AImageDecoder.ImageInfo()), 'TypeError');
  assert('new Bitmap() 抛 TypeError', thrown(() => new G.Bitmap()), 'TypeError');
  assert('new AnimatedImageDrawable() 抛 TypeError', thrown(() => new G.AnimatedImageDrawable()), 'TypeError');
  assert('BitmapDrawable 继承 Drawable', BitmapDrawable.prototype instanceof Drawable, true);
  assert('AnimatedImageDrawable 继承 Drawable', AnimatedImageDrawable.prototype instanceof Drawable, true);
  assert('ImageView 继承 View', ImageView.prototype instanceof View, true);

  // ===== isMimeTypeSupported =====
  assert('isMimeTypeSupported("image/png")', AImageDecoder.isMimeTypeSupported('image/png'), true);
  assert('isMimeTypeSupported("image/gif")', AImageDecoder.isMimeTypeSupported('image/gif'), true);
  assert('isMimeTypeSupported("image/webp")', AImageDecoder.isMimeTypeSupported('image/webp'), true);
  assert('isMimeTypeSupported("text/plain")', AImageDecoder.isMimeTypeSupported('text/plain'), false);
  assert('isMimeTypeSupported 不给参数抛 TypeError',
         thrown(() => /** @type {any} */ (AImageDecoder).isMimeTypeSupported()), 'TypeError');

  // ===== decodeHeader：来源直接给 =====
  console.log('  --- 图片：读头 ---');
  const PNG = 'images/halves.png';
  const GIF = 'images/spin.gif';
  const bytes = halvesBytes();
  const pngInfo = await AImageDecoder.decodeHeader(PNG);
  assert('decodeHeader(路径) 得到 ImageInfo', pngInfo instanceof AImageDecoder.ImageInfo, true);
  assert('PNG 的宽，px', pngInfo.size.width, 40);
  assert('PNG 的高，px', pngInfo.size.height, 30);
  assert('PNG 的类型', pngInfo.mimeType, 'image/png');
  assert('PNG 不是动图', pngInfo.isAnimated, false);
  assert('ImageInfo.size 是冻结的', Object.isFrozen(pngInfo.size), true);
  assert('ImageInfo 的字段只读', thrown(() => { /** @type {any} */ (pngInfo).mimeType = 'x'; }), 'TypeError');
  const gifInfo = await AImageDecoder.decodeHeader(GIF);
  assert('GIF 的宽高', gifInfo.size.width + '×' + gifInfo.size.height, '8×8');
  assert('GIF 的类型', gifInfo.mimeType, 'image/gif');
  assert('GIF 是动图', gifInfo.isAnimated, true);
  assert('从 Blob 读头', (await AImageDecoder.decodeHeader(new Blob([bytes], { type: 'image/png' }))).size.width, 40);
  assert('从 ArrayBuffer 读头', (await AImageDecoder.decodeHeader(bytes.buffer.slice(0))).size.height, 30);
  assert('从 Uint8Array 读头', (await AImageDecoder.decodeHeader(bytes)).size.width, 40);
  assert('从 DataView 读头', (await AImageDecoder.decodeHeader(new DataView(bytes.buffer))).size.width, 40);
  // typed array 只取它看得见的那一段
  const padded = new Uint8Array(bytes.length + 8);
  padded.set(bytes, 4);
  assert('typed array 只取它那一段', (await AImageDecoder.decodeHeader(padded.subarray(4, 4 + bytes.length))).size.width,
         40);
  assert('decodeHeader 不给参数以 TypeError 被拒',
         await rejected(() => /** @type {any} */ (AImageDecoder).decodeHeader()), 'TypeError');
  for (const v of [42, {}, null, undefined, true]) {
    bad = v;
    assert('decodeHeader(' + String(json(v)) + ') 以 TypeError 被拒',
           await rejected(() => AImageDecoder.decodeHeader(bad)), 'TypeError');
  }
  assert('assets 里没有的文件以 FileNotFoundException 被拒',
         await rejected(() => AImageDecoder.decodeHeader('images/nope.png')), 'FileNotFoundException');
  const garbage = new Blob(['not an image']);
  assert('不是图片的字节以 DecodeException 被拒', await rejected(() => AImageDecoder.decodeHeader(garbage)),
         'DecodeException');

  // ===== decodeBitmap =====
  console.log('  --- 图片：解码成 Bitmap ---');
  // 默认的 allocator 由系统定（文档：一般放在显存里，小图可能不是），所以这里只看宽高
  const plainDecoded = await AImageDecoder.decodeBitmap(PNG);
  assert('decodeBitmap 得到 Bitmap', plainDecoded instanceof Bitmap, true);
  assert('Bitmap 的宽，px', plainDecoded.width, 40);
  assert('Bitmap 的高，px', plainDecoded.height, 30);
  const hw = await AImageDecoder.decodeBitmap(PNG, { allocator: 'hardware' });
  assert("allocator: 'hardware' 解成放在显存里的图", hw.config, 'hardware');
  assert('显存里的图不可改', hw.isMutable, false);
  assert('显存里的图读不了像素：InvalidStateError', thrown(() => hw.getPixel(0, 0)), 'InvalidStateError');

  const sw = await AImageDecoder.decodeBitmap(PNG, { allocator: 'software' });
  assert("allocator: 'software' 的 config", sw.config, 'argb8888');
  assert('左半边是红的', sw.getPixel(5, 5), '#ff0000');
  assert('右半边是蓝的', sw.getPixel(35, 25), '#0000ff');
  assert('hasAlpha 是属性：不透明的图是 false', sw.hasAlpha, false);
  assert('byteCount = 40 × 30 × 4', sw.byteCount, 4800);
  assert('allocationByteCount 不比 byteCount 小', sw.allocationByteCount >= 4800, true);
  assert('不透明的图 isPremultiplied 是 false', sw.isPremultiplied, false);
  assert('isRecycled 默认是 false', sw.isRecycled, false);
  assert('解出来的图密度没设：density 是 null', sw.density, null);
  for (const name of ['width', 'height', 'config', 'byteCount', 'allocationByteCount', 'isMutable',
                      'isPremultiplied', 'hasAlpha', 'isRecycled']) {
    assert(name + ' 只读', thrown(() => { /** @type {any} */ (sw)[name] = 1; }), 'TypeError');
  }
  assert('同一个路径再解一次', (await AImageDecoder.decodeBitmap(PNG)).width, 40);

  // 从字节解码
  const viaBlob = await AImageDecoder.decodeBitmap(new Blob([bytes]), { allocator: 'software' });
  assert('从 Blob 解码，读到红', viaBlob.getPixel(1, 1), '#ff0000');
  const viaBuffer = await AImageDecoder.decodeBitmap(bytes.buffer.slice(0), { allocator: 'software' });
  assert('从 ArrayBuffer 解码，读到蓝', viaBuffer.getPixel(39, 0), '#0000ff');
  const viaView = await AImageDecoder.decodeBitmap(bytes, { allocator: 'software' });
  assert('从 Uint8Array 解码', viaView.width + '×' + viaView.height, '40×30');

  // 密度：每英寸多少像素，没设是 null
  sw.density = 320;
  assert('density 写 320 读回', sw.density, 320);
  sw.density = null;
  assert('density 写 null 读回 null', sw.density, null);
  bad = '480';
  sw.density = bad;
  assert("density 写 '480' 照 Web IDL 转成数", sw.density, 480);
  bad = 'abc';
  assert("density 写 'abc' 抛 TypeError", thrown(() => { sw.density = bad; }), 'TypeError');
  assert('density 写 0 抛 RangeError（没设写 null）', thrown(() => { sw.density = 0; }), 'RangeError');
  assert('density 写 -1 抛 RangeError', thrown(() => { sw.density = -1; }), 'RangeError');
  assert('density 写错之后不变', sw.density, 480);
  sw.density = null;

  // getPixel 的参数
  assert('getPixel 越界抛 RangeError', thrown(() => sw.getPixel(40, 0)), 'RangeError');
  assert('getPixel 负的抛 RangeError', thrown(() => sw.getPixel(0, -1)), 'RangeError');
  bad = 'a';
  assert("getPixel('a', 0) 抛 TypeError", thrown(() => sw.getPixel(bad, 0)), 'TypeError');
  assert('getPixel 少给参数抛 TypeError', thrown(() => /** @type {any} */ (sw).getPixel(0)), 'TypeError');
  assert("getPixel('1', '1') 照 Web IDL 转成数", sw.getPixel(/** @type {any} */ ('1'), /** @type {any} */ ('1')),
         '#ff0000');

  // ===== 解码时的设置 =====
  console.log('  --- 图片：解码时的设置 ---');
  const small = await AImageDecoder.decodeBitmap(PNG, { allocator: 'software', targetSize: { width: 20, height: 15 } });
  assert('targetSize 缩到 20×15', small.width + '×' + small.height, '20×15');
  assert('缩小后左边还是红', small.getPixel(2, 2), '#ff0000');
  assert('缩小后右边还是蓝', small.getPixel(17, 12), '#0000ff');
  const sampled = await AImageDecoder.decodeBitmap(PNG, { allocator: 'software', targetSampleSize: 2 });
  assert('targetSampleSize 2 是 20×15', sampled.width + '×' + sampled.height, '20×15');
  const cropped = await AImageDecoder.decodeBitmap(PNG, {
    allocator: 'software', crop: { x: 20, y: 0, width: 20, height: 30 } });
  assert('crop { x, y, width, height } 取右半边：20×30', cropped.width + '×' + cropped.height, '20×30');
  assert('crop 取右半边：是蓝的', cropped.getPixel(0, 0), '#0000ff');
  const croppedSmall = await AImageDecoder.decodeBitmap(PNG, {
    allocator: 'software', targetSize: { width: 20, height: 15 }, crop: { x: 0, y: 0, width: 10, height: 15 } });
  assert('先缩小再裁（crop 按缩小之后的大小算）：10×15 是红的',
         croppedSmall.width + '×' + croppedSmall.height + ' ' + croppedSmall.getPixel(9, 14), '10×15 #ff0000');
  const mutable = await AImageDecoder.decodeBitmap(PNG, { mutableRequired: true });
  assert('mutableRequired 得到可改的图', mutable.isMutable, true);
  const premul = await AImageDecoder.decodeBitmap('images/alpha.png', { allocator: 'software' });
  assert('带透明度的图 hasAlpha', premul.hasAlpha, true);
  assert('带透明度的图默认 isPremultiplied 是 true', premul.isPremultiplied, true);
  const unpremul = await AImageDecoder.decodeBitmap('images/alpha.png', {
    allocator: 'software', unpremultipliedRequired: true });
  assert('unpremultipliedRequired 之后 isPremultiplied 是 false', unpremul.isPremultiplied, false);
  const lowRam = await AImageDecoder.decodeBitmap(PNG, { allocator: 'software', memorySizePolicy: 'lowRam' });
  assert("memorySizePolicy: 'lowRam' 下不透明的图解成 rgb565", lowRam.config, 'rgb565');
  const alphaMask = await AImageDecoder.decodeBitmap(PNG, { allocator: 'software', decodeAsAlphaMaskEnabled: true });
  assert('decodeAsAlphaMaskEnabled 对三个通道的图不起作用', alphaMask.config, 'argb8888');
  assert('options 给 null 当成空的', (await AImageDecoder.decodeBitmap(PNG, null)).width, 40);
  assert('options 里是 undefined 的成员当没给',
         (await AImageDecoder.decodeBitmap(PNG, { targetSize: undefined, allocator: undefined })).width, 40);
  bad = 'big';
  assert("options 是 'big' 以 TypeError 被拒", await rejected(() => AImageDecoder.decodeBitmap(PNG, bad)), 'TypeError');

  // 写错：类型不对、名字不对是 TypeError，超出范围是 RangeError，都是 Promise 被拒
  /** @type {[string, any, string][]} */
  const badOptions = [
    ["allocator: 'gpu'", { allocator: 'gpu' }, 'TypeError'],
    ["memorySizePolicy: 'small'", { memorySizePolicy: 'small' }, 'TypeError'],
    ["targetSize: 'big'", { targetSize: 'big' }, 'TypeError'],
    ['targetSize 的宽不是数', { targetSize: { width: 'a', height: 1 } }, 'TypeError'],
    ['targetSize 少了高', { targetSize: { width: 10 } }, 'TypeError'],
    ['targetSize 是 0×0', { targetSize: { width: 0, height: 0 } }, 'RangeError'],
    ['targetSize 是负的', { targetSize: { width: -4, height: 3 } }, 'RangeError'],
    ['targetSampleSize 是 0', { targetSampleSize: 0 }, 'RangeError'],
    ["targetSampleSize 是 'x'", { targetSampleSize: 'x' }, 'TypeError'],
    ['targetSize 和 targetSampleSize 一起给', { targetSize: { width: 20, height: 15 }, targetSampleSize: 2 },
     'TypeError'],
    ['crop 少了 height', { crop: { x: 0, y: 0, width: 10 } }, 'TypeError'],
    ['crop 是 Java 的写法 { left, top, right, bottom }', { crop: { left: 0, top: 0, right: 10, bottom: 10 } },
     'TypeError'],
    ['crop 的 x 是负的', { crop: { x: -1, y: 0, width: 10, height: 10 } }, 'RangeError'],
    ['crop 的宽是 0', { crop: { x: 0, y: 0, width: 0, height: 10 } }, 'RangeError'],
    ["'hardware' 加 mutableRequired", { allocator: 'hardware', mutableRequired: true }, 'TypeError'],
    ["'hardware' 加 decodeAsAlphaMaskEnabled", { allocator: 'hardware', decodeAsAlphaMaskEnabled: true },
     'TypeError'],
  ];
  for (const [label, options, expected] of badOptions) {
    assert('decodeBitmap：' + label + ' 以 ' + expected + ' 被拒',
           await rejected(() => AImageDecoder.decodeBitmap(PNG, options)), expected);
  }
  assert('allocator 写错时列出全部可选值',
         await rejectMessage(() => AImageDecoder.decodeBitmap(PNG, { allocator: /** @type {any} */ ('gpu') })),
         'allocator has no value "gpu"; expected one of: default / software / sharedMemory / hardware');
  assert('crop 超出图的范围：Java 的 IllegalStateException',
         await rejected(() => AImageDecoder.decodeBitmap(PNG, { crop: { x: 30, y: 0, width: 20, height: 30 } })),
         'IllegalStateException');
  assert('不是图片的字节解码以 DecodeException 被拒', await rejected(() => AImageDecoder.decodeBitmap(garbage)),
         'DecodeException');
  const firstFrame = await AImageDecoder.decodeBitmap(GIF, { allocator: 'software' });
  assert('动图 decodeBitmap 得到第一帧：8×8', firstFrame.width + '×' + firstFrame.height, '8×8');
  assert('动图的第一帧是红的', firstFrame.getPixel(4, 4), '#ff0000');

  // ===== Bitmap 的类方法：缩放、裁切 =====
  console.log('  --- 图片：缩放和裁切 ---');
  const big = Bitmap.createScaledBitmap(sw, { width: 80, height: 60 });
  assert('createScaledBitmap 得到新的 Bitmap', big instanceof Bitmap && big !== sw, true);
  assert('createScaledBitmap 的宽高，px', big.width + '×' + big.height, '80×60');
  assert('放大后左边是红', big.getPixel(10, 10), '#ff0000');
  assert('放大后右边是蓝', big.getPixel(70, 50), '#0000ff');
  const nearest = Bitmap.createScaledBitmap(sw, { width: 80, height: 60, filter: false });
  assert('filter: false 也能缩放', nearest.width, 80);
  assert('不可改的图、大小一样时 Java 把原图原样还回来：是同一个对象',
         Bitmap.createScaledBitmap(hw, { width: 40, height: 30 }), hw);
  assert("createScaledBitmap 的宽是 0 抛 RangeError",
         thrown(() => Bitmap.createScaledBitmap(sw, { width: 0, height: 10 })), 'RangeError');
  assert('createScaledBitmap 少了 height 抛 TypeError',
         thrown(() => Bitmap.createScaledBitmap(sw, /** @type {any} */ ({ width: 10 }))), 'TypeError');
  assert('createScaledBitmap 照 Java 按位置传抛 TypeError',
         thrown(() => /** @type {any} */ (Bitmap).createScaledBitmap(sw, 80, 60, true)), 'TypeError');
  bad = {};
  assert('createScaledBitmap({}) 抛 TypeError',
         thrown(() => Bitmap.createScaledBitmap(bad, { width: 1, height: 1 })), 'TypeError');
  assert('createScaledBitmap 不给参数抛 TypeError',
         thrown(() => /** @type {any} */ (Bitmap).createScaledBitmap()), 'TypeError');

  const right = Bitmap.createBitmap(sw, { x: 20, y: 0, width: 20, height: 30 });
  assert('createBitmap 裁出右半边：20×30', right.width + '×' + right.height, '20×30');
  assert('裁出来的是蓝的', right.getPixel(1, 1), '#0000ff');
  assert('createBitmap 超出原图抛 RangeError',
         thrown(() => Bitmap.createBitmap(sw, { x: 30, y: 0, width: 20, height: 30 })), 'RangeError');
  assert('createBitmap 的 y 是负的抛 RangeError',
         thrown(() => Bitmap.createBitmap(sw, { x: 0, y: -1, width: 2, height: 2 })), 'RangeError');
  assert('createBitmap 的宽是 0 抛 RangeError',
         thrown(() => Bitmap.createBitmap(sw, { x: 0, y: 0, width: 0, height: 2 })), 'RangeError');
  assert('createBitmap 少了 x 抛 TypeError',
         thrown(() => Bitmap.createBitmap(sw, /** @type {any} */ ({ y: 0, width: 2, height: 2 }))), 'TypeError');
  assert('createBitmap 照 Java 按位置传抛 TypeError',
         thrown(() => /** @type {any} */ (Bitmap).createBitmap(sw, 20, 0, 20, 30)), 'TypeError');
  assert('createBitmap 只给原图抛 TypeError', thrown(() => /** @type {any} */ (Bitmap).createBitmap(sw)), 'TypeError');

  // recycle：放掉像素占的内存
  const doomed = Bitmap.createScaledBitmap(sw, { width: 4, height: 4 });
  doomed.recycle();
  assert('recycle 之后 isRecycled 是 true', doomed.isRecycled, true);
  assert('回收了的图读像素：InvalidStateError', thrown(() => doomed.getPixel(0, 0)), 'InvalidStateError');
  assert('回收了的图拿去缩放：InvalidStateError',
         thrown(() => Bitmap.createScaledBitmap(doomed, { width: 2, height: 2 })), 'InvalidStateError');
  assert('回收了的图拿去裁：InvalidStateError',
         thrown(() => Bitmap.createBitmap(doomed, { x: 0, y: 0, width: 2, height: 2 })), 'InvalidStateError');
  assert('回收了的图拿去建 BitmapDrawable：InvalidStateError', thrown(() => new BitmapDrawable(doomed)),
         'InvalidStateError');
  assert('recycle 两次不抛', thrown(() => doomed.recycle()), '没抛');
  assert('回收了的图 width 还读得到', doomed.width, 4);

  // ===== BitmapDrawable：只在 JS 里记状态 =====
  console.log('  --- 图片：BitmapDrawable ---');
  const plain = Bitmap.createScaledBitmap(sw, { width: 40, height: 30, filter: false });
  const bd = new BitmapDrawable(plain);
  assert('BitmapDrawable 的 bitmap 就是给它的那个', bd.bitmap, plain);
  assert('BitmapDrawable 是 Drawable', bd instanceof Drawable, true);
  assert('new BitmapDrawable(null) 能建，bitmap 是 null', new BitmapDrawable(null).bitmap, null);
  assert('new BitmapDrawable() 抛 TypeError', thrown(() => new G.BitmapDrawable()), 'TypeError');
  bad = {};
  assert('new BitmapDrawable({}) 抛 TypeError', thrown(() => new BitmapDrawable(bad)), 'TypeError');
  bd.bitmap = big;
  assert('bitmap 可写，读回写进去的', bd.bitmap, big);
  bd.bitmap = null;
  assert('bitmap 写 null', bd.bitmap, null);
  bad = 'x';
  assert("bitmap 写 'x' 抛 TypeError", thrown(() => { bd.bitmap = bad; }), 'TypeError');
  assert('bitmap 写回收了的图抛 InvalidStateError', thrown(() => { bd.bitmap = doomed; }), 'InvalidStateError');
  assert('bitmap 写错之后不变', bd.bitmap, null);
  bd.bitmap = plain;
  assert('alpha 默认 1（Drawable 的）', bd.alpha, 1);
  assert('tileModeX 默认是 null（不平铺）', bd.tileModeX, null);
  assert('tileModeY 默认是 null', bd.tileModeY, null);
  bd.tileModeX = 'repeat';
  assert("tileModeX 写 'repeat' 读回", bd.tileModeX, 'repeat');
  bd.tileModeY = 'mirror';
  assert("tileModeY 写 'mirror' 读回", bd.tileModeY, 'mirror');
  bd.tileModeX = 'decal';
  assert("tileModeX 写 'decal'（Android 12 起）读回", bd.tileModeX, 'decal');
  bd.tileModeX = null;
  assert('tileModeX 写 null 读回 null', bd.tileModeX, null);
  bd.tileModeX = 'clamp';
  assert('tileModeX 写错：一条警告',
         warnings(() => { bd.tileModeX = /** @type {any} */ ('tile'); }),
         '[Nacre] tileModeX has no value "tile"; expected one of: clamp / repeat / mirror / decal, ignored');
  assert('tileModeX 写错后不变', bd.tileModeX, 'clamp');
  assert('isFilterBitmap 默认是 true', bd.isFilterBitmap, true);
  bd.isFilterBitmap = /** @type {any} */ (0);
  assert('isFilterBitmap 写 0 照 Web IDL 转成 false', bd.isFilterBitmap, false);
  assert('没有 setTileModeXY 了', /** @type {any} */ (bd).setTileModeXY, undefined);
  assert('没有 intrinsicWidth（从 bitmap 推得出来）', /** @type {any} */ (bd).intrinsicWidth, undefined);
  class Tiled extends BitmapDrawable {}
  const tiled = new Tiled(plain);
  assert('BitmapDrawable 能在 JS 里继承', tiled instanceof BitmapDrawable && tiled.bitmap === plain, true);

  // ===== ImageView：自由时全部成员 =====
  console.log('  --- 图片：ImageView ---');
  const iv = new ImageView();
  assert('new ImageView() 是 View', iv instanceof View, true);
  assert('自由的 ImageView 不属于任何页面', iv.activity, null);
  assert('new ImageView(activity) 多给的参数不管', thrown(() => new G.ImageView(activity)), '没抛');
  assert('drawable 默认是 null', iv.drawable, null);
  iv.drawable = bd;
  assert('drawable 写 BitmapDrawable 读回', iv.drawable, bd);
  const color = new ColorDrawable('#00ff00');
  iv.drawable = color;
  assert('drawable 写别的 Drawable（ColorDrawable）读回', iv.drawable, color);
  iv.drawable = null;
  assert('drawable 写 null', iv.drawable, null);
  bad = 'x';
  assert("drawable 写 'x' 抛 TypeError", thrown(() => { iv.drawable = bad; }), 'TypeError');
  bad = sw;
  assert('drawable 写 Bitmap 抛 TypeError（要包成 BitmapDrawable）', thrown(() => { iv.drawable = bad; }), 'TypeError');
  for (const name of ['setImageBitmap', 'setImageDrawable', 'setColorFilter', 'clearColorFilter']) {
    assert('没有 ' + name + ' 了', /** @type {any} */ (iv)[name], undefined);
  }

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
  iv.scaleType = 'centerCrop';
  iv.adjustViewBounds = true;
  assert('adjustViewBounds 写 true 读回', iv.adjustViewBounds, true);
  assert('写了 adjustViewBounds 之后 scaleType 还是写进去的', iv.scaleType, 'centerCrop');
  assert('maxWidth 默认是 null（不限）', iv.maxWidth, null);
  iv.maxWidth = 100.5;
  assert('maxWidth 写 100.5（dp）读回', iv.maxWidth, 100.5);
  iv.maxWidth = null;
  assert('maxWidth 写 null 读回 null', iv.maxWidth, null);
  bad = '50';
  iv.maxHeight = bad;
  assert("maxHeight 写 '50' 照 Web IDL 转成数", iv.maxHeight, 50);
  bad = 'abc';
  assert("maxHeight 写 'abc' 抛 TypeError", thrown(() => { iv.maxHeight = bad; }), 'TypeError');
  assert('maxHeight 写 -1 抛 RangeError', thrown(() => { iv.maxHeight = -1; }), 'RangeError');
  assert('maxHeight 写错之后不变', iv.maxHeight, 50);
  assert('imageAlpha 默认是 1', iv.imageAlpha, 1);
  iv.imageAlpha = 0.5;
  assert('imageAlpha 写 0.5 读回（0–1）', iv.imageAlpha, 0.5);
  assert('imageAlpha 写 128 抛 RangeError（不是 Java 的 0–255）', thrown(() => { iv.imageAlpha = 128; }), 'RangeError');
  bad = 'x';
  assert("imageAlpha 写 'x' 抛 TypeError", thrown(() => { iv.imageAlpha = bad; }), 'TypeError');
  assert('cropToPadding 默认是 false', iv.cropToPadding, false);
  iv.cropToPadding = true;
  assert('cropToPadding 写 true 读回', iv.cropToPadding, true);

  // 着色：null 或 { color, mode }；mode 不写是 'srcAtop'
  assert('colorFilter 默认是 null', iv.colorFilter, null);
  iv.colorFilter = { color: '#FF0000' };
  const filter = iv.colorFilter;
  assert('colorFilter 读出颜色原样、mode 补上默认的 srcAtop',
         filter === null ? null : filter.color + ' ' + filter.mode, '#FF0000 srcAtop');
  assert('colorFilter 读出来是冻结的', Object.isFrozen(filter), true);
  assert('colorFilter 读两次是同一个', iv.colorFilter, filter);
  iv.colorFilter = { color: 'rgba(0, 0, 255, 0.5)', mode: 'multiply' };
  assert('colorFilter 写 { color, mode }', json(iv.colorFilter), '{"color":"rgba(0, 0, 255, 0.5)","mode":"multiply"}');
  assert('colorFilter 的颜色写错：一条警告',
         warnings(() => { iv.colorFilter = { color: '#GGG' }; }),
         '[Nacre] colorFilter: "#GGG" is not a valid color, ignored');
  assert('colorFilter 的 mode 写错：一条警告',
         warnings(() => { iv.colorFilter = { color: '#ff0000', mode: /** @type {any} */ ('tint') }; }).startsWith(
           '[Nacre] colorFilter.mode has no value "tint"; expected one of: clear / src / dst / srcOver'), true);
  assert('colorFilter 写错之后不变', json(iv.colorFilter), '{"color":"rgba(0, 0, 255, 0.5)","mode":"multiply"}');
  bad = {};
  assert('colorFilter 少了 color 抛 TypeError', thrown(() => { iv.colorFilter = bad; }), 'TypeError');
  bad = '#ff0000';
  assert('colorFilter 写一个颜色字符串抛 TypeError', thrown(() => { iv.colorFilter = bad; }), 'TypeError');
  iv.colorFilter = null;
  assert('colorFilter 写 null 去掉', iv.colorFilter, null);

  // ===== decodeDrawable 和动图（值对象，不用挂上） =====
  console.log('  --- 图片：decodeDrawable 和动图 ---');
  const still = await AImageDecoder.decodeDrawable(PNG);
  assert('静态图 decodeDrawable 得到 BitmapDrawable', still instanceof BitmapDrawable, true);
  assert('它的 bitmap 宽 40', /** @type {BitmapDrawable} */ (still).bitmap?.width, 40);
  const stillSmall = await AImageDecoder.decodeDrawable(PNG, { targetSize: { width: 20, height: 15 } });
  assert('decodeDrawable 也认 targetSize', /** @type {BitmapDrawable} */ (stillSmall).bitmap?.width, 20);
  assert('decodeDrawable 加 mutableRequired 以 TypeError 被拒',
         await rejected(() => AImageDecoder.decodeDrawable(PNG, { mutableRequired: true })), 'TypeError');
  assert('decodeDrawable 不是图片以 DecodeException 被拒', await rejected(() => AImageDecoder.decodeDrawable(garbage)),
         'DecodeException');
  const anim = /** @type {AnimatedImageDrawable} */ (await AImageDecoder.decodeDrawable(GIF));
  assert('动图 decodeDrawable 得到 AnimatedImageDrawable', anim instanceof AnimatedImageDrawable, true);
  assert('AnimatedImageDrawable 是 EventTarget', anim instanceof EventTarget, true);
  assert('动图的 alpha 默认 1（Drawable 的）', anim.alpha, 1);
  anim.alpha = 0.75;
  assert('动图的 alpha 写 0.75 读回', anim.alpha, 0.75);
  anim.alpha = 1;
  assert('文件里写的是无限循环', anim.repeatCount, 'infinite');
  assert('刚解出来没在播', anim.isRunning, false);
  anim.repeatCount = 2;
  assert('repeatCount 写 2 读回', anim.repeatCount, 2);
  anim.repeatCount = /** @type {any} */ ('3');
  assert("repeatCount 写 '3'：是字符串，按名字认，不认识打警告", anim.repeatCount, 2);
  anim.repeatCount = 'infinite';
  assert("repeatCount 写 'infinite' 读回", anim.repeatCount, 'infinite');
  assert('repeatCount 写 -5 抛 RangeError', thrown(() => { anim.repeatCount = -5; }), 'RangeError');
  assert('repeatCount 写错名字：一条警告',
         warnings(() => { anim.repeatCount = /** @type {any} */ ('forever'); }),
         '[Nacre] repeatCount has no value "forever"; expected one of: infinite, ignored');
  assert('repeatCount 写错后不变', anim.repeatCount, 'infinite');
  assert('isRunning 只读', thrown(() => { /** @type {any} */ (anim).isRunning = true; }), 'TypeError');
  assert('没有 intrinsicWidth', /** @type {any} */ (anim).intrinsicWidth, undefined);
  // 值对象：没挂在哪个视图上也能 start / stop（Java 也是：画到它时才真的动）
  assert('没挂上时 start() 不抛', thrown(() => anim.start()), '没抛');
  assert('没挂上时 stop() 不抛', thrown(() => anim.stop()), '没抛');
  assert('stop() 之后 isRunning 是 false', anim.isRunning, false);

  // ===== 挂上 =====
  console.log('  --- 图片：挂上 ---');
  const screen = new LinearLayout();
  screen.orientation = 'vertical';
  screen.paddingTop = 120;
  /** @param {ImageView} v */
  const wrap = (v) => { v.layout = { width: 'wrapContent', height: 'wrapContent' }; return v; };

  // 自由时把每一项都写过的一个，挂上时没有警告、没有抛
  const full = wrap(new ImageView());
  Object.assign(full, {
    drawable: new BitmapDrawable(big), scaleType: 'centerCrop', adjustViewBounds: true, maxWidth: 60, maxHeight: 60,
    imageAlpha: 0.8, cropToPadding: true, colorFilter: { color: '#80ff0000', mode: 'srcIn' },
  });
  screen.addView(full);

  // 图的密度：160 dpi 的图一个像素是 1 dp，没设密度的图一个像素就是屏幕上的一个像素。
  // 从 80×60 的图里裁两张 40×30 的：不能从 sw 缩放成同样大小，那样 Java 还回来的就是 sw 自己，两个是同一张图
  const at160 = Bitmap.createBitmap(big, { x: 0, y: 0, width: 40, height: 30 });
  at160.density = 160;
  const noDensity = Bitmap.createBitmap(big, { x: 0, y: 0, width: 40, height: 30 });
  noDensity.density = null;
  assert('裁出来的两张是不同的图', at160 !== noDensity && at160.density === 160 && noDensity.density === null, true);
  const ivAt160 = wrap(new ImageView());
  ivAt160.drawable = new BitmapDrawable(at160);
  const ivNoDensity = wrap(new ImageView());
  ivNoDensity.drawable = new BitmapDrawable(noDensity);
  // maxWidth（dp）在 adjustViewBounds 时限住宽，高按比例跟着
  const large = Bitmap.createScaledBitmap(sw, { width: 400, height: 300 });
  large.density = 160;
  const capped = wrap(new ImageView());
  capped.drawable = new BitmapDrawable(large);
  capped.adjustViewBounds = true;
  capped.maxWidth = 50;
  screen.addView(ivAt160);
  screen.addView(ivNoDensity);
  screen.addView(capped);

  // 同一个 BitmapDrawable 用在两个视图上，一个当图、一个当背景
  const sharedBd = new BitmapDrawable(at160);
  const sharedA = wrap(new ImageView());
  sharedA.drawable = sharedBd;
  const sharedB = new View();
  sharedB.layout = { width: 40, height: 20 };
  sharedB.background = sharedBd;
  screen.addView(sharedA);
  screen.addView(sharedB);

  assert('每一项都写过的树挂上，没有警告、没有抛', problems(() => { activity.contentView = screen; }), '');
  assert('挂上之后 ImageView 属于这个页面', full.activity, activity);
  await sleep(500);
  const density = /** @type {any} */ (activity).configuration.density;
  console.log('  实测：1 dp = ' + density + ' 像素；160 dpi 的 40 像素的图排出来 ' + frameWidth(ivAt160) +
              ' dp，没设密度的 ' + frameWidth(ivNoDensity) + ' dp；限宽 50 dp 的 ' + frameWidth(capped) + '×' +
              frameHeight(capped) + ' dp');
  assert('160 dpi 的 40 像素宽的图：40 dp', near(frameWidth(ivAt160), 40, 0.5), true);
  assert('没设密度的 40 像素宽的图：40 个屏幕像素', near(frameWidth(ivNoDensity), 40 / density, 0.5), true);
  assert('adjustViewBounds 加 maxWidth 50（dp）：宽 50 dp', near(frameWidth(capped), 50, 0.5), true);
  assert('adjustViewBounds：高按图的比例跟着（3:4）', near(frameHeight(capped), (frameWidth(capped) ?? 0) * 0.75, 0.5),
         true);

  // 挂着时每一项都改一遍：当场同步，没有警告、没有抛
  assert('挂着时改每一项，没有警告、没有抛', problems(() => {
    full.drawable = new BitmapDrawable(sw);
    full.scaleType = 'fitXY';
    full.adjustViewBounds = false;
    full.adjustViewBounds = true;
    full.maxWidth = null;
    full.maxHeight = 30;
    full.imageAlpha = 0.3;
    full.cropToPadding = false;
    full.colorFilter = { color: '#0000ff' };
    full.colorFilter = null;
    full.drawable = new ColorDrawable('#123456');
    full.drawable = null;
    sharedBd.tileModeX = 'repeat';
    sharedBd.tileModeY = 'mirror';
    sharedBd.isFilterBitmap = false;
    sharedBd.alpha = 0.5;
    sharedBd.bitmap = noDensity;
    sharedBd.bitmap = at160;
  }), '');
  assert('写了 adjustViewBounds 之后 scaleType 还是写进去的（挂着时）', full.scaleType, 'fitXY');

  // 换了图，排版跟着变：BitmapDrawable 的 bitmap 改了，那一处重建
  const swapped = wrap(new ImageView());
  const swappable = new BitmapDrawable(at160);
  swapped.drawable = swappable;
  screen.addView(swapped);
  await sleep(300);
  swappable.bitmap = large;
  await sleep(300);
  assert('挂着时换了 bitmap：排出来的宽跟着变（400 像素、160 dpi 是 400 dp，被屏幕宽限住）',
         (frameWidth(swapped) ?? 0) > 40, true);

  // ===== recycle：挂着的视图在用就拒绝 =====
  console.log('  --- 图片：recycle ---');
  const inUse = Bitmap.createScaledBitmap(sw, { width: 20, height: 20 });
  const inUseView = wrap(new ImageView());
  inUseView.drawable = new BitmapDrawable(inUse);
  screen.addView(inUseView);
  assert('挂着的视图在用的图 recycle()：InvalidStateError', thrown(() => inUse.recycle()), 'InvalidStateError');
  assert('拒绝之后没回收', inUse.isRecycled, false);
  // 当背景、放在水波的内容里也算在用
  const inRipple = Bitmap.createScaledBitmap(sw, { width: 20, height: 20 });
  const rippleHost = new View();
  rippleHost.layout = { width: 20, height: 20 };
  const ripple = new RippleDrawable('#40000000');
  ripple.content = new BitmapDrawable(inRipple);
  rippleHost.background = ripple;
  screen.addView(rippleHost);
  assert('水波的内容在用的图 recycle()：InvalidStateError', thrown(() => inRipple.recycle()), 'InvalidStateError');
  // 拿下来就不算在用了
  screen.removeView(inUseView);
  assert('视图拿下来之后能 recycle()', thrown(() => inUse.recycle()), '没抛');
  assert('回收了', inUse.isRecycled, true);
  // 只在自由的视图上用的图随便回收
  const freeUse = Bitmap.createScaledBitmap(sw, { width: 20, height: 20 });
  const freeView = new ImageView();
  freeView.drawable = new BitmapDrawable(freeUse);
  assert('只有自由的视图在用：能 recycle()', thrown(() => freeUse.recycle()), '没抛');
  // 用着回收了的图的视图再挂上：画出来是空的，不崩、没有警告
  assert('用着回收了的图的视图再挂上，没有警告、没有抛', problems(() => {
    screen.addView(inUseView);
    screen.addView(freeView);
  }), '');
  await sleep(500);
  assert('挂上之后页面还在画（App 没崩）', inUseView.activity, activity);

  // ===== 动图：一个原生对象，几个视图画的都是它 =====
  console.log('  --- 图片：动图挂到屏幕上 ---');
  const spinnerA = wrap(new ImageView());
  const spinnerB = new ImageView();
  spinnerB.layout = { width: 60, height: 30 };
  const spinnerBg = new View();
  spinnerBg.layout = { width: 30, height: 30 };
  assert('同一个动图用在三处（两个 ImageView、一个背景），没有警告、没有抛', problems(() => {
    spinnerA.drawable = anim;
    spinnerB.drawable = anim;
    spinnerBg.background = anim;
    screen.addView(spinnerA);
    screen.addView(spinnerB);
    screen.addView(spinnerBg);
  }), '');
  assert('ImageView 拿着动图', spinnerA.drawable === anim && spinnerB.drawable === anim, true);
  await sleep(300);
  /** @type {string[]} */
  const events = [];
  anim.addEventListener('animationstart', (e) => { events.push(e.type); });
  anim.addEventListener('animationend', (e) => { events.push(e.type); });
  /** @param {string} type */
  const waitFor = (type) => new Promise((resolve) => {
    anim.addEventListener(type, () => resolve(true), { once: true });
    setTimeout(() => resolve(false), 3000);
  });

  // 播一遍（不重复）：两帧各 100 毫秒，播完自己停
  anim.repeatCount = 0;
  const started = waitFor('animationstart');
  const ended = waitFor('animationend');
  anim.start();
  assert('start() 之后来 animationstart', await started, true);
  assert('播完一遍来 animationend', await ended, true);
  await sleep(200);
  assert('三处画的是同一个动图：事件只来一次，不是每处一次', events.join(','), 'animationstart,animationend');
  assert('播完之后 isRunning 是 false', anim.isRunning, false);

  // 无限循环时 stop() 停下，也来 animationend
  anim.repeatCount = 'infinite';
  const started2 = waitFor('animationstart');
  anim.start();
  assert('再 start() 又来 animationstart', await started2, true);
  await sleep(500);
  assert('无限循环 500 毫秒之后还在播', anim.isRunning, true);
  // 播着的时候改透明度、换地方、拿下来一处：没有警告、没有抛
  assert('播着的时候改透明度、拿下来一处再放回去，没有警告、没有抛', problems(() => {
    anim.alpha = 0.5;
    spinnerA.imageAlpha = 0.5;
    spinnerB.colorFilter = { color: '#0000ff' };
    screen.removeView(spinnerB);
    screen.addView(spinnerB, { index: 0 });
  }), '');
  const ended2 = waitFor('animationend');
  anim.stop();
  assert('stop() 之后 isRunning 是 false', anim.isRunning, false);
  assert('stop() 之后来 animationend', await ended2, true);
  await sleep(200);
  assert('事件的顺序', events.join(','), 'animationstart,animationend,animationstart,animationend');

  // ===== 密度变了：BitmapDrawable 按新密度重建 =====
  console.log('  --- 图片：密度变了 ---');
  /** @type {string[]} */
  const densityWarnings = [];
  const originalWarn = console.warn;
  console.warn = (/** @type {unknown} */ first) => { densityWarnings.push(String(first)); };
  try {
    for (const dpi of ['560', 'restore']) {
      /** @type {Promise<boolean>} */
      const changed = new Promise((resolve) => {
        const timer = setTimeout(() => resolve(false), 8000);
        activity.addEventListener('windowinsetschange', () => { clearTimeout(timer); resolve(true); }, { once: true });
      });
      console.log('[acceptance] density ' + dpi);
      assert('密度 ' + dpi + '：等到了配置变化', await changed, true);
      await sleep(1000);
      const now = /** @type {any} */ (activity).configuration.density;
      console.log('  实测：密度 ' + now + ' 时，160 dpi 的图排出来 ' + frameWidth(ivAt160) + ' dp，没设密度的 ' +
                  frameWidth(ivNoDensity) + ' dp');
      assert('密度 ' + dpi + '：160 dpi 的 40 像素宽的图还是 40 dp', near(frameWidth(ivAt160), 40, 0.5), true);
      assert('密度 ' + dpi + '：没设密度的图还是 40 个屏幕像素', near(frameWidth(ivNoDensity), 40 / now, 0.5), true);
    }
  } finally {
    console.warn = originalWarn;
  }
  assert('密度变了两次，按新密度重建时没有警告', densityWarnings.join(' | '), '');

  activity.contentView = null;
  assert('整页拿下来之后，原来在用的图能 recycle()', thrown(() => at160.recycle()), '没抛');
}
