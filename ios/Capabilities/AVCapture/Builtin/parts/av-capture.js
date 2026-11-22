// 相机取景和扫码的 JS 那一半：AVCaptureSession 一组。原生在 NacreAVCapture.mm，
// 为什么这么搭见那个文件开头。
//
// 这是能力包自己的 part：跟着 NacreAVCapture.framework 走，运行时在核心的 part
// 全部跑完之后，用同一个 ctx 调它一次。
//
// 原生类：AVCaptureDevice、AVCaptureInput / AVCaptureDeviceInput、
// AVCaptureOutput / AVCaptureMetadataOutput、AVCaptureSession、
// AVCaptureVideoPreviewLayer。
// JS 的值：AVMetadataObject / AVMetadataMachineReadableCodeObject（detect 事件带的）。
(function (ctx) {
  'use strict';

  const {
    POINT_FIELDS,
    RECT_FIELDS,
    constructNative,
    define,
    defineField,
    defineNativeClass,
    describeValue,
    disown,
    has,
    internalEventHandlers,
    kSubscribe,
    nativeCall,
    nativeCallAsync,
    nativeCallObject,
    nativeClassCall,
    nativeClassCallValue,
    nativeClassObject,
    nativeClasses,
    nativeGet,
    nativeGetObjectArray,
    nativeGetOwned,
    nativeOnly,
    nativeSet,
    nativeSetOwned,
    own,
    ownAll,
    ownOne,
    requireNative,
    shellOnly,
    structArg,
    subscribeNative,
    toNumber,
    toPoint,
    toRect,
    toText,
  } = ctx;

  // ---------- 运行时内部的两个句柄类，不放到全局上 ----------
  //
  // NacreMetadataBatch：一帧识别出来的原生对象（换算到图层时要交回去）
  // NacreAVCaptureAccess：requestAccessForMediaType 走异步通道要一个对象
  class NacreMetadataBatch {}
  class NacreAVCaptureAccess {}
  nativeClasses.NacreMetadataBatch = NacreMetadataBatch;
  nativeClasses.NacreAVCaptureAccess = NacreAVCaptureAccess;

  let access = null;
  function accessHandle() {
    if (access === null) access = nativeClassObject('AVCaptureDevice', 'nacre:access');
    return access;
  }

  // 返回 Promise 的方法，参数不对时照 Web IDL 拒绝，不同步抛
  function promising(fn) {
    try {
      return Promise.resolve(fn());
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // ---------- 摄像头 ----------

  const AVCaptureDevice = defineNativeClass('AVCaptureDevice', class AVCaptureDevice extends NSObject {
    constructor() { nativeOnly(new.target); }

    // ---- 类方法 ----
    static authorizationStatusForMediaType(mediaType) {
      return nativeClassCallValue('AVCaptureDevice', 'authorizationStatusForMediaType:', [mediaType]);
    }
    static requestAccessForMediaType(mediaType) {
      return promising(() => nativeCallAsync(accessHandle(), 'requestAccessForMediaType:', [mediaType]));
    }
    static defaultDeviceWithMediaType(mediaType) {
      return nativeClassCall('AVCaptureDevice', 'defaultDeviceWithMediaType:', [mediaType]);
    }
    // options：mediaType 不写是不限，position 不写是 'unspecified'
    static defaultDeviceWithDeviceType(deviceType, options) {
      const o = options == null ? {} : options;
      return nativeClassCall('AVCaptureDevice', 'defaultDeviceWithDeviceType:mediaType:position:', [
        deviceType, has(o, 'mediaType') ? o.mediaType : null,
        has(o, 'position') ? o.position : 'unspecified',
      ]);
    }

    // ---- 是哪个 ----
    get uniqueID() { requireNative(this, 'uniqueID'); return nativeGet(this, 'uniqueID'); }
    get localizedName() { requireNative(this, 'localizedName'); return nativeGet(this, 'localizedName'); }
    get position() { requireNative(this, 'position'); return nativeGet(this, 'position'); }

    // ---- 改设置的权利 ----
    // 拿不到不是参数错了，抛系统给的 NSError
    lockForConfiguration() {
      const failure = nativeCall(this, 'lockForConfiguration', []);
      if (failure !== null) {
        throw ctx.makeError('NSError', 'lockForConfiguration failed: ' + failure.message, failure);
      }
    }
    unlockForConfiguration() { nativeCall(this, 'unlockForConfiguration', []); }

    // ---- 手电筒 ----
    get hasTorch() { requireNative(this, 'hasTorch'); return nativeGet(this, 'hasTorch'); }
    get isTorchAvailable() {
      requireNative(this, 'isTorchAvailable');
      return nativeGet(this, 'isTorchAvailable');
    }
    get torchMode() { requireNative(this, 'torchMode'); return nativeGet(this, 'torchMode'); }
    set torchMode(value) { requireNative(this, 'torchMode'); nativeSet(this, 'torchMode', value); }

    // ---- 变焦 ----
    get videoZoomFactor() { requireNative(this, 'videoZoomFactor'); return nativeGet(this, 'videoZoomFactor'); }
    set videoZoomFactor(value) {
      requireNative(this, 'videoZoomFactor');
      nativeSet(this, 'videoZoomFactor', toNumber(value, 'videoZoomFactor'));
    }
    get minAvailableVideoZoomFactor() {
      requireNative(this, 'minAvailableVideoZoomFactor');
      return nativeGet(this, 'minAvailableVideoZoomFactor');
    }
    get maxAvailableVideoZoomFactor() {
      requireNative(this, 'maxAvailableVideoZoomFactor');
      return nativeGet(this, 'maxAvailableVideoZoomFactor');
    }
    rampToVideoZoomFactor(factor, options) {
      const o = options == null ? {} : options;
      if (!has(o, 'withRate')) throw new TypeError('rampToVideoZoomFactor needs options.withRate');
      nativeCall(this, 'rampToVideoZoomFactor:withRate:',
                 [toNumber(factor, 'rampToVideoZoomFactor'), toNumber(o.withRate, 'withRate')]);
    }
    cancelVideoZoomRamp() { nativeCall(this, 'cancelVideoZoomRamp', []); }

    // ---- 对焦 ----
    get focusMode() { requireNative(this, 'focusMode'); return nativeGet(this, 'focusMode'); }
    set focusMode(value) { requireNative(this, 'focusMode'); nativeSet(this, 'focusMode', value); }
    isFocusModeSupported(focusMode) { return nativeCall(this, 'isFocusModeSupported:', [focusMode]); }
    get isFocusPointOfInterestSupported() {
      requireNative(this, 'isFocusPointOfInterestSupported');
      return nativeGet(this, 'isFocusPointOfInterestSupported');
    }
    get focusPointOfInterest() {
      requireNative(this, 'focusPointOfInterest');
      return toPoint(nativeGet(this, 'focusPointOfInterest'));
    }
    set focusPointOfInterest(value) {
      requireNative(this, 'focusPointOfInterest');
      nativeSet(this, 'focusPointOfInterest', structArg(value, POINT_FIELDS, 'focusPointOfInterest'));
    }
    get autoFocusRangeRestriction() {
      requireNative(this, 'autoFocusRangeRestriction');
      return nativeGet(this, 'autoFocusRangeRestriction');
    }
    set autoFocusRangeRestriction(value) {
      requireNative(this, 'autoFocusRangeRestriction');
      nativeSet(this, 'autoFocusRangeRestriction', value);
    }
  });

  // ---------- 输入 ----------

  const AVCaptureInput = defineNativeClass('AVCaptureInput', class AVCaptureInput extends NSObject {
    constructor() {
      super();
      shellOnly(new.target, AVCaptureInput, 'AVCaptureInput');
    }
  });

  defineNativeClass('AVCaptureDeviceInput', class AVCaptureDeviceInput extends AVCaptureInput {
    constructor(device) {
      if (!(device instanceof AVCaptureDevice)) {
        throw new TypeError('AVCaptureDeviceInput needs an AVCaptureDevice, got ' + describeValue(device));
      }
      super();
      // 参数是对的，系统还是建不出来（没有授权、摄像头被占着）：不是参数的错，抛 NSError。
      // 构造的通道只带得回一句话，domain 和 code 带不回来
      try {
        constructNative(this, new.target, 'AVCaptureDeviceInput', [device]);
      } catch (err) {
        throw ctx.makeError('NSError',
                            'cannot open this camera: ' + (err instanceof Error ? err.message : String(err)));
      }
      own(this, 'device', device);
    }
    get device() { requireNative(this, 'device'); return nativeGetOwned(this, 'device'); }
  });

  // ---------- 输出 ----------

  const AVCaptureOutput = defineNativeClass('AVCaptureOutput', class AVCaptureOutput extends NSObject {
    constructor() {
      super();
      shellOnly(new.target, AVCaptureOutput, 'AVCaptureOutput');
    }
  });

  defineNativeClass('AVCaptureMetadataOutput', class AVCaptureMetadataOutput extends AVCaptureOutput {
    constructor() {
      super();
      constructNative(this, new.target, 'AVCaptureMetadataOutput', []);
    }
    get availableMetadataObjectTypes() {
      requireNative(this, 'availableMetadataObjectTypes');
      return nativeGet(this, 'availableMetadataObjectTypes');
    }
    get metadataObjectTypes() {
      requireNative(this, 'metadataObjectTypes');
      return nativeGet(this, 'metadataObjectTypes');
    }
    set metadataObjectTypes(value) {
      requireNative(this, 'metadataObjectTypes');
      if (value === null || typeof value !== 'object' || typeof value[Symbol.iterator] !== 'function') {
        throw new TypeError('metadataObjectTypes must be an array of type names, got ' + describeValue(value));
      }
      nativeSet(this, 'metadataObjectTypes', Array.from(value, (name) => String(name)));
    }
    get rectOfInterest() {
      requireNative(this, 'rectOfInterest');
      return toRect(nativeGet(this, 'rectOfInterest'));
    }
    set rectOfInterest(value) {
      requireNative(this, 'rectOfInterest');
      nativeSet(this, 'rectOfInterest', structArg(value, RECT_FIELDS, 'rectOfInterest'));
    }
    // detect
    [kSubscribe](type, on) { subscribeNative(this, type, on); }
  });

  // ---------- 识别出来的值 ----------
  //
  // 只能由运行时建：构造函数认这个记号
  const kInternal = Symbol('AVCapture');
  // 值 → 它从哪个批次的第几个来。换算到图层时交回原生
  const sources = new WeakMap();

  function readOnlyField(target, name, value) {
    Object.defineProperty(target, name, {
      enumerable: true,
      get: () => value,
      set() { throw new TypeError(name + ' is read-only'); },
    });
  }

  const AVMetadataObject = define(globalThis, 'AVMetadataObject', class AVMetadataObject {
    constructor(token, fields) {
      if (token !== kInternal) {
        throw new TypeError('Illegal constructor: AVMetadataObject comes from the detect event of ' +
                            'AVCaptureMetadataOutput');
      }
      readOnlyField(this, 'type', fields.type);
      readOnlyField(this, 'bounds', toRect(fields.bounds));
      if (new.target === AVMetadataObject) Object.preventExtensions(this);
    }
  });

  const AVMetadataMachineReadableCodeObject = define(globalThis, 'AVMetadataMachineReadableCodeObject',
    class AVMetadataMachineReadableCodeObject extends AVMetadataObject {
      constructor(token, fields) {
        super(token, fields);
        readOnlyField(this, 'stringValue', fields.stringValue === undefined ? null : fields.stringValue);
        readOnlyField(this, 'corners', Object.freeze((fields.corners || []).map(toPoint)));
        Object.preventExtensions(this);
      }
    });

  // 一个批次 → 一组值。原生认不出种类的给 null，这里去掉
  function valuesFrom(batch) {
    const list = nativeCall(batch, 'nacre:describe', []);
    const values = [];
    (Array.isArray(list) ? list : []).forEach((fields, index) => {
      if (fields === null || typeof fields !== 'object') return;
      const value = 'corners' in fields
        ? new AVMetadataMachineReadableCodeObject(kInternal, fields)
        : new AVMetadataObject(kInternal, fields);
      sources.set(value, { batch, index });
      values.push(value);
    });
    return values;
  }

  // 原生把一帧的批次作为内部事件 @detect 派发在输出上：建值、派发 detect。
  // 原生的通知，延后一轮派发，不可取消
  internalEventHandlers.set('@detect', (output, batch) => {
    if (batch === null || batch === undefined) return;
    const objects = Object.freeze(valuesFrom(batch));
    if (objects.length === 0) return;
    const event = new Event('detect');
    defineField(event, 'objects', objects);
    output.dispatchEvent(event);
  });

  // ---------- 会话 ----------

  function requireOf(cls, value, what) {
    if (!(value instanceof cls)) {
      throw new TypeError(what + ' needs an ' + cls.name + ', got ' + describeValue(value));
    }
    return value;
  }

  const AVCaptureSession = defineNativeClass('AVCaptureSession', class AVCaptureSession extends NSObject {
    constructor() {
      super();
      constructNative(this, new.target, 'AVCaptureSession', []);
    }

    // ---- 输入和输出：会话持有加进去的对象 ----
    canSetSessionPreset(preset) {
      requireNative(this, 'canSetSessionPreset');
      return nativeCall(this, 'canSetSessionPreset:', [toText(preset)]);
    }
    canAddInput(input) {
      return nativeCall(this, 'canAddInput:', [requireOf(AVCaptureInput, input, 'canAddInput')]);
    }
    addInput(input) {
      nativeCall(this, 'addInput:', [requireOf(AVCaptureInput, input, 'addInput')]);
      ownOne(this, 'inputs', input);
    }
    removeInput(input) {
      nativeCall(this, 'removeInput:', [requireOf(AVCaptureInput, input, 'removeInput')]);
      disown(this, 'inputs', input);
    }
    canAddOutput(output) {
      return nativeCall(this, 'canAddOutput:', [requireOf(AVCaptureOutput, output, 'canAddOutput')]);
    }
    addOutput(output) {
      nativeCall(this, 'addOutput:', [requireOf(AVCaptureOutput, output, 'addOutput')]);
      ownOne(this, 'outputs', output);
    }
    removeOutput(output) {
      nativeCall(this, 'removeOutput:', [requireOf(AVCaptureOutput, output, 'removeOutput')]);
      disown(this, 'outputs', output);
    }
    // 按原生的真相整层重建镜像
    get inputs() {
      requireNative(this, 'inputs');
      return ownAll(this, 'inputs', nativeGetObjectArray(this, 'inputs'));
    }
    get outputs() {
      requireNative(this, 'outputs');
      return ownAll(this, 'outputs', nativeGetObjectArray(this, 'outputs'));
    }

    get sessionPreset() { requireNative(this, 'sessionPreset'); return nativeGet(this, 'sessionPreset'); }
    set sessionPreset(value) { requireNative(this, 'sessionPreset'); nativeSet(this, 'sessionPreset', value); }

    beginConfiguration() { nativeCall(this, 'beginConfiguration', []); }
    commitConfiguration() { nativeCall(this, 'commitConfiguration', []); }

    // ---- 开和停：在后台做，做完兑现 ----
    startRunning() {
      return promising(() => nativeCallAsync(this, 'startRunning', [])).then(() => undefined);
    }
    stopRunning() {
      return promising(() => nativeCallAsync(this, 'stopRunning', [])).then(() => undefined);
    }
    get isRunning() { requireNative(this, 'isRunning'); return nativeGet(this, 'isRunning'); }
    get isInterrupted() { requireNative(this, 'isInterrupted'); return nativeGet(this, 'isInterrupted'); }

    // start、stop、interrupt、interruptend、runtimeerror
    [kSubscribe](type, on) { subscribeNative(this, type, on); }
  });

  // ---------- 取景图层 ----------

  defineNativeClass('AVCaptureVideoPreviewLayer', class AVCaptureVideoPreviewLayer extends CALayer {
    constructor(session) {
      requireOf(AVCaptureSession, session, 'AVCaptureVideoPreviewLayer');
      super();
      constructNative(this, new.target, 'AVCaptureVideoPreviewLayer', [session]);
      own(this, 'session', session);
    }
    get session() { requireNative(this, 'session'); return nativeGetOwned(this, 'session'); }
    set session(value) { requireNative(this, 'session'); nativeSetOwned(this, 'session', value); }
    get videoGravity() { requireNative(this, 'videoGravity'); return nativeGet(this, 'videoGravity'); }
    set videoGravity(value) { requireNative(this, 'videoGravity'); nativeSet(this, 'videoGravity', value); }

    transformedMetadataObjectForMetadataObject(metadataObject) {
      const source = metadataObject !== null && typeof metadataObject === 'object'
        ? sources.get(metadataObject) : undefined;
      if (source === undefined) {
        throw new TypeError('transformedMetadataObjectForMetadataObject needs an object from a detect ' +
                            'event, got ' + describeValue(metadataObject));
      }
      const batch = nativeCallObject(this, 'transformedMetadataObjectForMetadataObject:',
                                     [source.batch, source.index]);
      if (batch === null) return null;
      const values = valuesFrom(batch);
      return values.length > 0 ? values[0] : null;
    }
    metadataOutputRectOfInterestForRect(rect) {
      return toRect(nativeCall(this, 'metadataOutputRectOfInterestForRect:',
                               [structArg(rect, RECT_FIELDS, 'metadataOutputRectOfInterestForRect')]));
    }
    captureDevicePointOfInterestForPoint(point) {
      return toPoint(nativeCall(this, 'captureDevicePointOfInterestForPoint:',
                                [structArg(point, POINT_FIELDS, 'captureDevicePointOfInterestForPoint')]));
    }
    pointForCaptureDevicePointOfInterest(point) {
      return toPoint(nativeCall(this, 'pointForCaptureDevicePointOfInterest:',
                                [structArg(point, POINT_FIELDS, 'pointForCaptureDevicePointOfInterest')]));
    }
  });
})
