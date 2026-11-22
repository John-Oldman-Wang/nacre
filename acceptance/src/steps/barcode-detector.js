// 识别图片里的条码：BarcodeDetector（核心，照 Web 的 Shape Detection API）。
//
// 素材在 acceptance/assets/：
//   qr-one.png  400×400 像素，一个二维码，内容 https://example.com/a。码（连同
//               四周的白边）画在 (120, 20)，216 像素见方。码靠上放，上下留白不一样，
//               坐标的原点放反了（Vision 是左下原点）一眼看得出来
//   qr-two.png  640×400 像素，两个二维码并排：左边 https://example.com/b、
//               右边 https://example.com/c
//   dot.png     一个点，没有码
//
// 期望的框是在 Mac 上用同一个框架（Vision）量的：qr-one 里的码框在
// (128, 28, 200, 200) 像素左右。下面的断言留了 10 像素的余量，不抠到个位

const FORMATS = ['aztec', 'code_128', 'code_39', 'code_93', 'codabar', 'data_matrix',
                 'ean_13', 'ean_8', 'itf', 'pdf417', 'qr_code', 'upc_a', 'upc_e'];

/** @param {() => unknown} fn */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : String(err);
  }
}

/** @param {unknown} p */
async function rejected(p) {
  if (!(p instanceof Promise)) return '不是 Promise';
  try {
    await p;
    return '兑现了';
  } catch (err) {
    return err instanceof Error ? err.name : String(err);
  }
}

/**
 * @param {number} value
 * @param {number} expected
 * @param {number} slack
 */
const near = (value, expected, slack) => Math.abs(value - expected) <= slack;

/**
 * 一个码的框和四个角都在图片里面
 * @param {DetectedBarcode} code
 * @param {number} width
 * @param {number} height
 */
function insideImage(code, width, height) {
  const box = code.boundingBox;
  const boxInside = box.x >= 0 && box.y >= 0 && box.width > 0 && box.height > 0 &&
                    box.x + box.width <= width && box.y + box.height <= height;
  const cornersInside = code.cornerPoints.every((p) => p.x >= 0 && p.x <= width &&
                                                       p.y >= 0 && p.y <= height);
  return boxInside && cornersInside;
}

/** @param {import("../main.js").StepContext} ctx */
export async function stepBarcodeDetector(ctx) {
  const { assert } = ctx;
  console.log('--- BarcodeDetector ---');
  if (typeof BarcodeDetector !== 'function') {
    assert('BarcodeDetector：全局上有这个类', typeof BarcodeDetector, 'function');
    return;
  }

  // ---- 类 ----
  assert('BarcodeDetector：不继承任何类',
         Object.getPrototypeOf(BarcodeDetector.prototype), Object.prototype);
  class Sub extends BarcodeDetector {}
  assert('BarcodeDetector：子类 new 时抛 TypeError', thrown(() => new Sub()), 'TypeError');

  // ---- getSupportedFormats ----
  const supportedPromise = BarcodeDetector.getSupportedFormats();
  assert('getSupportedFormats：返回 Promise', supportedPromise instanceof Promise, true);
  const supported = await supportedPromise;
  console.log('  · 实测：这台设备认得 ' + supported.join(', '));
  assert('getSupportedFormats：兑现成数组', Array.isArray(supported), true);
  assert('getSupportedFormats：认得 qr_code', supported.includes('qr_code'), true);
  assert('getSupportedFormats：名字都是 Web 的那 13 个之一',
         supported.every((f) => FORMATS.includes(f)), true);
  assert('getSupportedFormats：没有重复', new Set(supported).size, supported.length);

  // ---- 构造 ----
  assert('构造：不带参数', thrown(() => new BarcodeDetector()), '没抛');
  assert('构造：空的 options', thrown(() => new BarcodeDetector({})), '没抛');
  assert('构造：options 是 null', thrown(() => new BarcodeDetector(null)), '没抛');
  assert('构造：formats 是 undefined 视为没带',
         thrown(() => new BarcodeDetector({ formats: undefined })), '没抛');
  assert('构造：formats 写 qr_code', thrown(() => new BarcodeDetector({ formats: ['qr_code'] })), '没抛');
  assert('构造：13 个名字全写上', thrown(() => new BarcodeDetector({
    formats: /** @type {BarcodeFormat[]} */ (FORMATS) })), '没抛');
  // @ts-expect-error 故意写错的格式名
  assert('构造：不认识的格式名抛 TypeError', thrown(() => new BarcodeDetector({ formats: ['qr'] })), 'TypeError');
  // @ts-expect-error Web 的 unknown 不能拿来构造
  assert('构造：unknown 抛 TypeError', thrown(() => new BarcodeDetector({ formats: ['unknown'] })), 'TypeError');
  assert('构造：formats 是空数组抛 TypeError', thrown(() => new BarcodeDetector({ formats: [] })), 'TypeError');
  // @ts-expect-error formats 要是数组
  assert('构造：formats 是字符串抛 TypeError', thrown(() => new BarcodeDetector({ formats: 'qr_code' })), 'TypeError');

  // ---- 素材 ----
  const one = UIImage.imageNamed('JS/assets/qr-one');
  const two = UIImage.imageNamed('JS/assets/qr-two');
  const dot = UIImage.imageNamed('JS/assets/dot');
  if (one === null || two === null || dot === null) {
    assert('素材：qr-one、qr-two、dot 三张图都在', false, true);
    return;
  }
  assert('素材：qr-one 是 400×400', one.size.width + '×' + one.size.height + ' @' + one.scale, '400×400 @1');

  const detector = new BarcodeDetector();

  // ---- 一个码 ----
  const pending = detector.detect(one);
  assert('detect：返回 Promise', pending instanceof Promise, true);
  const found = await pending;
  assert('detect：一个码的图认出一个', found.length, 1);
  const code = found[0];
  if (code !== undefined) {
    console.log('  · 实测：框 ' + JSON.stringify(code.boundingBox) + '，角 ' +
                JSON.stringify(code.cornerPoints));
    assert('detect：rawValue 是码里的内容', code.rawValue, 'https://example.com/a');
    assert('detect：format 是 qr_code', code.format, 'qr_code');
    assert('detect：框和四个角都在图片里面', insideImage(code, 400, 400), true);
    const box = code.boundingBox;
    assert('detect：框的位置是像素、原点在左上（约 128, 28）',
           near(box.x, 128, 10) && near(box.y, 28, 10), true);
    assert('detect：框的大小是像素（约 200×200）',
           near(box.width, 200, 10) && near(box.height, 200, 10), true);
    assert('detect：四个角', code.cornerPoints.length, 4);
    const [tl, tr, br, bl] = code.cornerPoints;
    assert('detect：角按左上、右上、右下、左下排',
           tl !== undefined && tr !== undefined && br !== undefined && bl !== undefined &&
           near(tl.x, 128, 10) && near(tl.y, 28, 10) && near(tr.x, 328, 10) && near(tr.y, 28, 10) &&
           near(br.x, 328, 10) && near(br.y, 228, 10) && near(bl.x, 128, 10) && near(bl.y, 228, 10),
           true);
  }

  // ---- 两个码 ----
  const both = await detector.detect(two);
  assert('detect：两个码的图认出两个', both.length, 2);
  const sorted = both.slice().sort((a, b) => a.boundingBox.x - b.boundingBox.x);
  assert('detect：左边那个是 b、右边那个是 c', sorted.map((c) => c.rawValue).join(' '),
         'https://example.com/b https://example.com/c');
  assert('detect：两个码都在图片里面', both.every((c) => insideImage(c, 640, 400)), true);

  // ---- Blob ----
  const fs = application.fileSystem;
  const bytes = await fs.readBytes(fs.assets + '/qr-one.png');
  const fromBlob = await detector.detect(new Blob([bytes], { type: 'image/png' }));
  assert('detect：Blob 里的图片字节也认得', fromBlob.map((c) => c.rawValue).join(' '),
         'https://example.com/a');
  const sameBox = fromBlob[0] !== undefined && code !== undefined &&
                  near(fromBlob[0].boundingBox.x, code.boundingBox.x, 1) &&
                  near(fromBlob[0].boundingBox.y, code.boundingBox.y, 1);
  assert('detect：Blob 和 UIImage 给的框一样', sameBox, true);

  // ---- 没有码、只找某几种 ----
  assert('detect：没有码兑现空数组', (await detector.detect(dot)).length, 0);
  const onlyEan = new BarcodeDetector({ formats: ['ean_13'] });
  assert('detect：只找 ean_13 时二维码不算', (await onlyEan.detect(one)).length, 0);
  const onlyQr = new BarcodeDetector({ formats: ['qr_code'] });
  assert('detect：只找 qr_code 时认得出', (await onlyQr.detect(two)).length, 2);

  // ---- 同时识别几张 ----
  const all = await Promise.all([detector.detect(one), detector.detect(two), detector.detect(one)]);
  assert('detect：同时识别三张', all.map((r) => r.length).join(','), '1,2,1');

  // ---- 拒绝 ----
  // @ts-expect-error 故意传错的参数
  assert('detect：数以 TypeError 拒绝', await rejected(detector.detect(123)), 'TypeError');
  // @ts-expect-error 故意传错的参数
  assert('detect：null 以 TypeError 拒绝', await rejected(detector.detect(null)), 'TypeError');
  // @ts-expect-error 故意传错的参数
  assert('detect：不是图片的原生对象以 TypeError 拒绝', await rejected(detector.detect(new UIView())),
         'TypeError');
  assert('detect：Blob 里不是图片，以 TypeError 拒绝',
         await rejected(detector.detect(new Blob(['not an image']))), 'TypeError');
}
