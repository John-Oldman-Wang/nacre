// 识别图片里的条码：BarcodeDetector（照 Web 的 Shape Detection API）。
// 原生在 NacreBarcodeDetector.mm；为什么这么搭见那个文件开头。
//
// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    constructNative,
    defineNativeClass,
    describeValue,
    finalCheck,
    has,
    kHandle,
    nativeCallAsync,
    nativeClassCallValue,
  } = ctx;

  // Web 的 BarcodeFormat 里除了 unknown 的全部。unknown 只出现在结果里，不能拿来构造；
  // 而这里不找 Web 没有名字的码，所以结果里也不会有它
  const FORMATS = ['aztec', 'code_128', 'code_39', 'code_93', 'codabar', 'data_matrix',
                   'ean_13', 'ean_8', 'itf', 'pdf417', 'qr_code', 'upc_a', 'upc_e'];

  // 照 Web IDL 转 options.formats（sequence<BarcodeFormat>）：要是可迭代的对象，
  // 每一项按字符串转，再认名字
  function toFormats(value) {
    if (value === null || typeof value !== 'object' || typeof value[Symbol.iterator] !== 'function') {
      throw new TypeError('BarcodeDetector formats must be an array of format names, got ' +
                          describeValue(value));
    }
    const list = Array.from(value, (item) => String(item));
    for (const name of list) {
      if (!FORMATS.includes(name)) {
        throw new TypeError('BarcodeDetector formats has no value ' + JSON.stringify(name) +
                            '; expected one of: ' + FORMATS.join(', '));
      }
    }
    // Web 的规定：给了就不能是空的
    if (list.length === 0) throw new TypeError('BarcodeDetector formats must not be empty');
    return list;
  }

  // 上层的类，不继承任何类：不发事件，也不是 iOS 的对象
  defineNativeClass('BarcodeDetector', class BarcodeDetector {
    constructor(options) {
      finalCheck(new.target);
      const o = options == null ? {} : options;
      if (typeof o !== 'object' && typeof o !== 'function') {
        throw new TypeError('BarcodeDetector options must be an object, got ' + describeValue(o));
      }
      const formats = has(o, 'formats') ? toFormats(o.formats) : null;
      constructNative(this, new.target, 'BarcodeDetector', [formats]);
    }
    /** 这台设备认得的格式 */
    static getSupportedFormats() {
      try {
        return Promise.resolve(nativeClassCallValue('BarcodeDetector', 'supportedFormats', []));
      } catch (err) {
        return Promise.reject(err);
      }
    }
    /** 找图片里的条码。image 是 UIImage 或装着图片字节的 Blob；在后台识别 */
    detect(image) {
      // 返回 Promise 的方法，参数不对时照 Web IDL 拒绝，不同步抛
      if (this == null || this[kHandle] === undefined) {
        return Promise.reject(new TypeError('detect: Illegal invocation'));
      }
      if (!(image instanceof UIImage) && !(image instanceof Blob)) {
        return Promise.reject(new TypeError('detect needs a UIImage or a Blob, got ' +
                                            describeValue(image)));
      }
      try {
        return nativeCallAsync(this, 'detect', [image]);
      } catch (err) {
        return Promise.reject(err);
      }
    }
  });
})
