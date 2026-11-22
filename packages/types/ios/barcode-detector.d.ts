// 识别图片里的条码：BarcodeDetector（照 Web 的 Shape Detection API）。

/**
 * 条码的格式，名字照 Web。
 *
 * - `'aztec'`、`'data_matrix'`、`'pdf417'`、`'qr_code'` —— 二维码一类
 * - `'code_128'`、`'code_39'`、`'code_93'`、`'codabar'`、`'itf'` —— 一维码
 * - `'ean_13'`、`'ean_8'`、`'upc_a'`、`'upc_e'` —— 商品条码
 *
 * 这台设备实际认得哪几种，用 `BarcodeDetector.getSupportedFormats()` 查。
 */
type BarcodeFormat =
  | 'aztec' | 'code_128' | 'code_39' | 'code_93' | 'codabar' | 'data_matrix'
  | 'ean_13' | 'ean_8' | 'itf' | 'pdf417' | 'qr_code' | 'upc_a' | 'upc_e';

/** `new BarcodeDetector()` 的选项。 */
interface BarcodeDetectorOptions {
  /** 只找这几种格式。不写是这台设备认得的全部；写了就不能是空数组。 */
  formats?: BarcodeFormat[];
}

/**
 * 找到的一个条码。坐标的单位是图片的像素，原点在图片的左上角。
 */
interface DetectedBarcode {
  /** 条码里的内容。内容不是文字时是空串。 */
  readonly rawValue: string;
  /** 条码的格式。 */
  readonly format: BarcodeFormat;
  /** 框住条码的矩形，像素。 */
  readonly boundingBox: { readonly x: number; readonly y: number; readonly width: number; readonly height: number };
  /** 条码的四个角，像素：左上、右上、右下、左下，顺时针。 */
  readonly cornerPoints: ReadonlyArray<{ readonly x: number; readonly y: number }>;
}

/**
 * 在一张图片里找条码。识别在后台做，不卡界面。
 *
 * ```js
 * const detector = new BarcodeDetector({ formats: ['qr_code'] });
 * const codes = await detector.detect(image);
 * for (const code of codes) console.log(code.rawValue);
 * ```
 */
declare class BarcodeDetector {
  /**
   * 写了不认识的格式名，或者 `formats` 是空数组，抛 `TypeError`。
   */
  constructor(options?: BarcodeDetectorOptions | null);
  /** 这台设备认得的格式。 */
  static getSupportedFormats(): Promise<BarcodeFormat[]>;
  /**
   * 找图片里的条码，兑现成找到的全部，一个都没有是空数组。
   *
   * `image` 是一个 `UIImage`，或者装着图片文件字节（PNG、JPEG 一类）的 `Blob`。
   * 别的值，或者字节解不出图片，以 `TypeError` 拒绝。
   */
  detect(image: UIImage | Blob): Promise<DetectedBarcode[]>;
}
