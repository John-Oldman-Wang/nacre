import { customEventWorks, enumIgnored, ENUM_IGNORED } from '../support.js';
// 相机取景和扫码：AVCaptureSession 一组（能力包 @nacrejs/av-capture）。
//
// 分三段：
//   1. 不用摄像头授权就能验的：类和继承、不能 new 的类、授权状态、找摄像头、
//      摄像头属性的默认值、没锁就写的报错、会话的默认值和输出的加减、写错时抛什么
//   2. 有授权时：锁住改设置、接上摄像头、元数据输出的种类、取景图层、真的开和停
//      （startRunning / stopRunning 兑现、isRunning、start / stop 事件）
//   3. 要人配合的：对着二维码扫（detect）、手电筒亮起来、打断和出错。只打未验证
//
// 还没问过用户时，这一步会申请一次授权，手机上弹出系统的提示框；20 秒内没点
// 「允许」，第 2 段报未验证，不算失败。
//
// 期望值的来源：默认值（会话 high、图层 resizeAspect、对焦范围 none、元数据输出
// 默认一种都不识别、rectOfInterest 是 (0, 0, 1, 1)）来自头文件；「加进有摄像头的
// 会话之前 availableMetadataObjectTypes 是空的」「没锁就写抛 NSGenericException」
// 「新建输入时还没问过就弹框」也来自头文件

const STATUSES = ['notDetermined', 'restricted', 'denied', 'authorized'];
const POSITIONS = ['unspecified', 'back', 'front'];
const FOCUS_MODES = ['locked', 'autoFocus', 'continuousAutoFocus'];
/** @type {AVMetadataObjectType[]} */
const METADATA_TYPES = [
  'qrCode', 'microQRCode', 'aztecCode', 'dataMatrixCode', 'pdf417Code', 'microPDF417Code',
  'code128Code', 'code39Code', 'code39Mod43Code', 'code93Code', 'codabarCode',
  'ean13Code', 'ean8Code', 'upceCode', 'interleaved2of5Code', 'itf14Code',
  'gs1DataBarCode', 'gs1DataBarExpandedCode', 'gs1DataBarLimitedCode',
  'face', 'humanBody', 'humanFullBody', 'catHead', 'catBody', 'dogHead', 'dogBody',
  'salientObject', 'focusTrackedObject', 'cinematicVideoMetadata',
];

/** @param {() => unknown} fn */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name : String(err);
  }
}

/** 抛出来的 Error 的 message；没抛给 '没抛' @param {() => unknown} fn */
function messageOf(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
}

// 系统拒绝时的报错：前面是成员名，括号里是系统给的原因，不由我们猜是什么原因
const REFUSED = /^videoZoomFactor: the system refused \(.+\)$/;

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

/** @param {number} ms */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {number} a
 * @param {number} b
 */
const near = (a, b) => Math.abs(a - b) < 0.01;

/** @param {import("../main.js").StepContext} ctx */
export async function stepAvCapture(ctx) {
  const { assert } = ctx;
  console.log('--- 相机取景：AVCaptureSession 一组 ---');
  const names = ['AVCaptureSession', 'AVCaptureDevice', 'AVCaptureInput', 'AVCaptureDeviceInput',
                 'AVCaptureOutput', 'AVCaptureMetadataOutput', 'AVCaptureVideoPreviewLayer',
                 'AVMetadataObject', 'AVMetadataMachineReadableCodeObject'];
  const g = /** @type {Record<string, unknown>} */ (/** @type {unknown} */ (globalThis));
  const missing = names.filter((n) => typeof g[n] !== 'function');
  assert('取景：九个类都在全局上', missing.join(','), '');
  if (missing.length > 0) return;

  // ---- 类和继承 ----
  assert('取景：会话继承 NSObject', AVCaptureSession.prototype instanceof NSObject, true);
  assert('取景：摄像头继承 NSObject', AVCaptureDevice.prototype instanceof NSObject, true);
  assert('取景：AVCaptureDeviceInput 继承 AVCaptureInput',
         Object.getPrototypeOf(AVCaptureDeviceInput.prototype), AVCaptureInput.prototype);
  assert('取景：AVCaptureInput 继承 NSObject', Object.getPrototypeOf(AVCaptureInput.prototype),
         NSObject.prototype);
  assert('取景：AVCaptureMetadataOutput 继承 AVCaptureOutput',
         Object.getPrototypeOf(AVCaptureMetadataOutput.prototype), AVCaptureOutput.prototype);
  assert('取景：取景图层继承 CALayer',
         Object.getPrototypeOf(AVCaptureVideoPreviewLayer.prototype), CALayer.prototype);
  assert('取景：码对象继承 AVMetadataObject',
         Object.getPrototypeOf(AVMetadataMachineReadableCodeObject.prototype), AVMetadataObject.prototype);
  assert('取景：AVMetadataObject 是 JS 的值，不继承 NSObject',
         Object.getPrototypeOf(AVMetadataObject.prototype), Object.prototype);
  const anyCtor = /** @type {any} */ (AVCaptureDevice);
  assert('取景：AVCaptureDevice 不能 new', thrown(() => new anyCtor()), 'TypeError');
  assert('取景：AVCaptureInput 不能 new', thrown(() => new /** @type {any} */ (AVCaptureInput)()), 'TypeError');
  assert('取景：AVCaptureOutput 不能 new', thrown(() => new /** @type {any} */ (AVCaptureOutput)()), 'TypeError');
  assert('取景：AVMetadataObject 不能 new', thrown(() => new /** @type {any} */ (AVMetadataObject)()), 'TypeError');
  assert('取景：码对象不能 new',
         thrown(() => new /** @type {any} */ (AVMetadataMachineReadableCodeObject)()), 'TypeError');
  class SubSession extends AVCaptureSession {}
  assert('取景：会话不能继承', thrown(() => new SubSession()), 'TypeError');

  // ---- 授权状态 ----
  const status = AVCaptureDevice.authorizationStatusForMediaType('video');
  console.log('  · 实测：摄像头的授权状态是 ' + status);
  assert('授权：状态是四个名字之一', STATUSES.includes(status), true);
  // @ts-expect-error 这个包不做麦克风
  assert('授权：audio 抛 TypeError', thrown(() => AVCaptureDevice.authorizationStatusForMediaType('audio')),
         'TypeError');
  // @ts-expect-error 故意写错的媒体类型
  assert('授权：不认识的媒体类型抛 TypeError', thrown(() => AVCaptureDevice.authorizationStatusForMediaType('x')),
         'TypeError');
  assert('授权：申请 audio 以 TypeError 拒绝',
         // @ts-expect-error 这个包不做麦克风
         await rejected(AVCaptureDevice.requestAccessForMediaType('audio')), 'TypeError');

  // ---- 找摄像头 ----
  const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
  assert('摄像头：默认的摄像头找得到', device instanceof AVCaptureDevice, true);
  if (device === null) return;
  assert('摄像头：再找一次是同一个对象', AVCaptureDevice.defaultDeviceWithMediaType('video'), device);
  // @ts-expect-error 这个包不做麦克风
  assert('摄像头：找 audio 抛 TypeError', thrown(() => AVCaptureDevice.defaultDeviceWithMediaType('audio')),
         'TypeError');
  console.log('  · 实测：默认摄像头 ' + device.localizedName + '，' + device.position);
  assert('摄像头：uniqueID 是非空字符串', typeof device.uniqueID === 'string' && device.uniqueID !== '', true);
  assert('摄像头：localizedName 是非空字符串',
         typeof device.localizedName === 'string' && device.localizedName !== '', true);
  assert('摄像头：默认的是后置的', device.position, 'back');
  assert('摄像头：uniqueID 只读', thrown(() => { /** @type {any} */ (device).uniqueID = 'x'; }), 'TypeError');

  const front = AVCaptureDevice.defaultDeviceWithDeviceType('builtInWideAngleCamera',
                                                            { mediaType: 'video', position: 'front' });
  assert('摄像头：按种类和朝向找到前置的', front !== null && front.position === 'front', true);
  const wide = AVCaptureDevice.defaultDeviceWithDeviceType('builtInWideAngleCamera');
  assert('摄像头：只写种类也找得到', wide instanceof AVCaptureDevice, true);
  assert('摄像头：前置和后置不是同一个', front !== null && front !== device, true);
  assert('摄像头：position 是三个名字之一', POSITIONS.includes(device.position), true);
  // @ts-expect-error 故意写错的种类
  assert('摄像头：不认识的种类抛 TypeError', thrown(() => AVCaptureDevice.defaultDeviceWithDeviceType('wide')),
         'TypeError');
  assert('摄像头：不认识的朝向抛 TypeError', thrown(() => AVCaptureDevice.defaultDeviceWithDeviceType(
    // @ts-expect-error 故意写错的朝向
    'builtInWideAngleCamera', { position: 'up' })), 'TypeError');
  assert('摄像头：找的时候 mediaType 写 audio 抛 TypeError', thrown(() => AVCaptureDevice.defaultDeviceWithDeviceType(
    // @ts-expect-error 这个包不做麦克风
    'builtInWideAngleCamera', { mediaType: 'audio' })), 'TypeError');

  // ---- 摄像头的属性：默认值、没锁就写 ----
  assert('摄像头：hasTorch 是布尔', typeof device.hasTorch, 'boolean');
  assert('摄像头：后置摄像头有手电筒', device.hasTorch, true);
  assert('摄像头：isTorchAvailable 是布尔', typeof device.isTorchAvailable, 'boolean');
  assert('摄像头：手电筒默认关着', device.torchMode, 'off');
  assert('摄像头：变焦默认 1', device.videoZoomFactor, 1);
  assert('摄像头：最小变焦 1', device.minAvailableVideoZoomFactor, 1);
  assert('摄像头：最大变焦大于 1', device.maxAvailableVideoZoomFactor > 1, true);
  console.log('  · 实测：变焦范围 ' + device.minAvailableVideoZoomFactor + ' 到 ' +
              device.maxAvailableVideoZoomFactor + '，对焦 ' + device.focusMode);
  assert('摄像头：focusMode 是三个名字之一', FOCUS_MODES.includes(device.focusMode), true);
  assert('摄像头：支持连续自动对焦', device.isFocusModeSupported('continuousAutoFocus'), true);
  assert('摄像头：支持锁住焦点', device.isFocusModeSupported('locked'), true);
  // @ts-expect-error 故意写错的对焦方式
  assert('摄像头：isFocusModeSupported 写错名字抛 TypeError', thrown(() => device.isFocusModeSupported('auto')),
         'TypeError');
  assert('摄像头：后置摄像头支持对焦点', device.isFocusPointOfInterestSupported, true);
  const focusPoint = device.focusPointOfInterest;
  assert('摄像头：对焦点读出来是 CGPoint', focusPoint instanceof CGPoint, true);
  assert('摄像头：对焦点默认在正中', focusPoint.x + ',' + focusPoint.y, '0.5,0.5');
  assert('摄像头：对焦范围默认不限', device.autoFocusRangeRestriction, 'none');
  assert('摄像头：hasTorch 只读', thrown(() => { /** @type {any} */ (device).hasTorch = false; }), 'TypeError');
  assert('摄像头：最大变焦只读',
         thrown(() => { /** @type {any} */ (device).maxAvailableVideoZoomFactor = 2; }), 'TypeError');

  assert('没锁：写 torchMode 抛 InvalidStateError', thrown(() => { device.torchMode = 'off'; }), 'InvalidStateError');
  assert('没锁：写 videoZoomFactor 抛 InvalidStateError', thrown(() => { device.videoZoomFactor = 1; }), 'InvalidStateError');
  assert('没锁：抛的是 DOMException', (() => { try { device.videoZoomFactor = 1; } catch (err) { return err instanceof DOMException; } return false; })(), true);
  const unlockedMessage = messageOf(() => { device.videoZoomFactor = 1; });
  console.log('  · 实测：没锁时的报错 ' + unlockedMessage);
  assert('没锁：报错是「系统拒绝」加系统给的原因', REFUSED.test(unlockedMessage), true);
  assert('没锁：写 focusMode 抛 InvalidStateError',
         thrown(() => { device.focusMode = 'continuousAutoFocus'; }), 'InvalidStateError');
  assert('没锁：写 focusPointOfInterest 抛 InvalidStateError',
         thrown(() => { device.focusPointOfInterest = { x: 0.5, y: 0.5 }; }), 'InvalidStateError');
  assert('没锁：写 autoFocusRangeRestriction 抛 InvalidStateError',
         thrown(() => { device.autoFocusRangeRestriction = 'none'; }), 'InvalidStateError');
  // 头文件说没锁会抛，实测系统不拦（iPhone 14，iOS 27.2，授权前后都量过）：照系统的事实，
  // 我们这边也不拦
  assert('没锁：rampToVideoZoomFactor 系统不拦，不抛',
         thrown(() => device.rampToVideoZoomFactor(1, { withRate: 1 })), '没抛');
  assert('没锁：cancelVideoZoomRamp 系统不拦，不抛', thrown(() => device.cancelVideoZoomRamp()), '没抛');
  assert('没锁：值没变', device.videoZoomFactor + ' ' + device.torchMode, '1 off');

  // ---- 输入：参数不对 ----
  // @ts-expect-error 故意传错的参数
  assert('输入：null 抛 TypeError', thrown(() => new AVCaptureDeviceInput(null)), 'TypeError');
  // @ts-expect-error 故意传错的参数
  assert('输入：字符串抛 TypeError', thrown(() => new AVCaptureDeviceInput('back')), 'TypeError');
  // @ts-expect-error 故意传错的参数
  assert('输入：别的原生对象抛 TypeError', thrown(() => new AVCaptureDeviceInput(new UIView())), 'TypeError');

  // ---- 会话：默认值、输出的加减 ----
  const session = new AVCaptureSession();
  assert('会话：inputs 默认空', session.inputs.length, 0);
  assert('会话：outputs 默认空', session.outputs.length, 0);
  assert('会话：画质默认 high', session.sessionPreset, 'high');
  assert('会话：没在跑', session.isRunning, false);
  assert('会话：没被打断', session.isInterrupted, false);
  assert('会话：isRunning 只读', thrown(() => { /** @type {any} */ (session).isRunning = true; }), 'TypeError');
  assert('会话：画质写错名字', enumIgnored(() => {
    // @ts-expect-error 故意写错的档位
    session.sessionPreset = 'hd';
  }, () => session.sessionPreset), ENUM_IGNORED);
  assert('会话：canSetSessionPreset 问得到', session.canSetSessionPreset('high'), true);
  assert('会话：canSetSessionPreset 给不认识的档位抛 TypeError',
         thrown(() => session.canSetSessionPreset(/** @type {any} */ ('hd'))), 'TypeError');
  session.sessionPreset = 'medium';
  assert('会话：画质写 medium 读回来', session.sessionPreset, 'medium');
  session.sessionPreset = 'high';
  assert('会话：beginConfiguration / commitConfiguration 不抛',
         thrown(() => { session.beginConfiguration(); session.commitConfiguration(); }), '没抛');

  const spare = new AVCaptureMetadataOutput();
  assert('输出：加进会话之前一种都不能识别', spare.availableMetadataObjectTypes.length, 0);
  assert('输出：默认一种都不识别', spare.metadataObjectTypes.length, 0);
  assert('输出：写当前不能识别的种类抛 TypeError',
         thrown(() => { spare.metadataObjectTypes = ['qrCode']; }), 'TypeError');
  assert('输出：写错名字', enumIgnored(() => {
    // @ts-expect-error 故意写错的种类
    spare.metadataObjectTypes = ['qr'];
  }, () => spare.metadataObjectTypes), ENUM_IGNORED);
  assert('输出：metadataObjectTypes 写不是数组的抛 TypeError',
         thrown(() => { /** @type {any} */ (spare).metadataObjectTypes = 'qrCode'; }), 'TypeError');
  const roi = spare.rectOfInterest;
  assert('输出：rectOfInterest 读出来是 CGRect', roi instanceof CGRect, true);
  assert('输出：rectOfInterest 默认是整个画面', [roi.x, roi.y, roi.width, roi.height].join(','), '0,0,1,1');
  spare.rectOfInterest = { x: 0.1, y: 0.2, width: 0.5, height: 0.6 };
  const roi2 = spare.rectOfInterest;
  assert('输出：rectOfInterest 写了读回来',
         near(roi2.x, 0.1) && near(roi2.y, 0.2) && near(roi2.width, 0.5) && near(roi2.height, 0.6), true);
  assert('输出：rectOfInterest 写数抛 TypeError',
         thrown(() => { /** @type {any} */ (spare).rectOfInterest = 5; }), 'TypeError');
  assert('输出：自定义事件名照常工作', customEventWorks(spare, 'nacre-custom'), '收到一次');

  assert('会话：能加元数据输出', session.canAddOutput(spare), true);
  session.addOutput(spare);
  assert('会话：加了之后 outputs 里是同一个对象', session.outputs.length === 1 && session.outputs[0] === spare, true);
  assert('会话：同一个输出不能加两次', session.canAddOutput(spare), false);
  assert('会话：加不进去时 addOutput 抛 TypeError', thrown(() => session.addOutput(spare)), 'TypeError');
  assert('会话：抛了之后 outputs 还是一个', session.outputs.length, 1);
  session.removeOutput(spare);
  assert('会话：去掉之后 outputs 空了', session.outputs.length, 0);
  // @ts-expect-error 故意传错的参数
  assert('会话：addOutput(null) 抛 TypeError', thrown(() => session.addOutput(null)), 'TypeError');
  assert('会话：addInput 传输出抛 TypeError',
         thrown(() => session.addInput(/** @type {any} */ (spare))), 'TypeError');
  // @ts-expect-error 故意传错的参数
  assert('会话：canAddInput 传字符串抛 TypeError', thrown(() => session.canAddInput('x')), 'TypeError');

  // ---- 取景图层：不用授权的部分 ----
  const layer = new AVCaptureVideoPreviewLayer(session);
  assert('图层：session 是传进去的那个', layer.session, session);
  assert('图层：画面默认 resizeAspect', layer.videoGravity, 'resizeAspect');
  layer.videoGravity = 'resizeAspectFill';
  assert('图层：videoGravity 写了读回来', layer.videoGravity, 'resizeAspectFill');
  assert('图层：videoGravity 写错名字', enumIgnored(() => {
    // @ts-expect-error 故意写错的值
    layer.videoGravity = 'fill';
  }, () => layer.videoGravity), ENUM_IGNORED);
  layer.session = null;
  assert('图层：session 能清掉', layer.session, null);
  layer.session = session;
  assert('图层：session 能再设回来', layer.session, session);
  // @ts-expect-error 故意传错的参数
  assert('图层：构造不传会话抛 TypeError', thrown(() => new AVCaptureVideoPreviewLayer()), 'TypeError');
  // @ts-expect-error 故意传错的参数
  assert('图层：构造传字符串抛 TypeError', thrown(() => new AVCaptureVideoPreviewLayer('x')), 'TypeError');
  assert('图层：session 写字符串抛 TypeError',
         thrown(() => { /** @type {any} */ (layer).session = 'x'; }), 'TypeError');
  assert('图层：CALayer 的属性照常', thrown(() => { layer.frame = { x: 0, y: 0, width: 300, height: 400 }; }),
         '没抛');
  assert('图层：换算不是从 detect 来的对象抛 TypeError',
         thrown(() => layer.transformedMetadataObjectForMetadataObject(
           /** @type {any} */ (Object.create(AVMetadataObject.prototype)))), 'TypeError');
  assert('图层：换算普通对象抛 TypeError',
         thrown(() => layer.transformedMetadataObjectForMetadataObject(/** @type {any} */ ({}))), 'TypeError');
  assert('图层：换算点写错抛 TypeError',
         thrown(() => layer.captureDevicePointOfInterestForPoint(/** @type {any} */ (5))), 'TypeError');

  // ---- 有授权时 ----
  let granted = status === 'authorized';
  if (status === 'notDetermined') {
    console.log('  · 还没问过用户：申请摄像头的授权，手机上会弹系统的提示框（20 秒内点「允许」）');
    const answer = await Promise.race([AVCaptureDevice.requestAccessForMediaType('video'), wait(20000)]);
    granted = answer === true;
    console.log('  · 实测：申请的结果 ' + (answer === undefined ? '20 秒内没有回答' : String(answer)));
    if (answer !== undefined) {
      assert('授权：申请之后状态跟着变', AVCaptureDevice.authorizationStatusForMediaType('video'),
             answer === true ? 'authorized' : 'denied');
    }
  } else {
    const again = await AVCaptureDevice.requestAccessForMediaType('video');
    assert('授权：问过之后再申请，当场兑现成上次的结果', again, status === 'authorized');
  }
  if (!granted) {
    if (status === 'denied' || status === 'restricted') {
      assert('输入：没有授权时建不出来，抛 Error（不是 TypeError）',
             thrown(() => new AVCaptureDeviceInput(device)), 'Error');
    }
    console.log('  ! 摄像头没有授权（' + AVCaptureDevice.authorizationStatusForMediaType('video') +
                '）：锁住改设置、接上摄像头、元数据输出的种类、取景图层的换算、真的开和停，未验证');
    unverifiedByHand();
    return;
  }

  // ---- 锁住改设置 ----
  assert('锁：lockForConfiguration 不抛', thrown(() => device.lockForConfiguration()), '没抛');
  try {
    device.torchMode = 'off';
    assert('锁：写 torchMode = off', device.torchMode, 'off');
    assert('锁：torchMode 写错名字', enumIgnored(() => {
      // @ts-expect-error 故意写错的值
      device.torchMode = 'flash';
    }, () => device.torchMode), ENUM_IGNORED);
    device.videoZoomFactor = 2;
    assert('锁：变焦写 2 读回来', device.videoZoomFactor, 2);
    device.videoZoomFactor = /** @type {any} */ ('1.5');
    assert('锁：变焦写字符串 1.5 按数转', device.videoZoomFactor, 1.5);
    assert('锁：变焦超出范围抛 RangeError', thrown(() => { device.videoZoomFactor = 100000; }), 'RangeError');
    const rangeMessage = messageOf(() => { device.videoZoomFactor = 100000; });
    console.log('  · 实测：变焦超出范围的报错 ' + rangeMessage);
    assert('锁：变焦超出范围的报错是「系统拒绝」加系统给的原因', REFUSED.test(rangeMessage), true);
    assert('锁：变焦超出范围的报错不说没锁', rangeMessage.includes('lockForConfiguration() and'), false);
    assert('锁：变焦写 abc 抛 TypeError',
           thrown(() => { device.videoZoomFactor = /** @type {any} */ ('abc'); }), 'TypeError');
    assert('锁：rampToVideoZoomFactor 不抛',
           thrown(() => device.rampToVideoZoomFactor(2, { withRate: 4 })), '没抛');
    assert('锁：cancelVideoZoomRamp 不抛', thrown(() => device.cancelVideoZoomRamp()), '没抛');
    assert('锁：rampToVideoZoomFactor 不带 withRate 抛 TypeError',
           // @ts-expect-error 故意漏掉的参数
           thrown(() => device.rampToVideoZoomFactor(2)), 'TypeError');
    device.videoZoomFactor = 1;
    device.focusMode = 'locked';
    assert('锁：focusMode 写 locked 读回来', device.focusMode, 'locked');
    assert('锁：focusMode 写错名字', enumIgnored(() => {
      // @ts-expect-error 故意写错的值
      device.focusMode = 'auto';
    }, () => device.focusMode), ENUM_IGNORED);
    device.focusPointOfInterest = { x: 0.25, y: 0.75 };
    const p = device.focusPointOfInterest;
    assert('锁：对焦点写了读回来', near(p.x, 0.25) && near(p.y, 0.75), true);
    assert('锁：对焦点写数抛 TypeError',
           thrown(() => { /** @type {any} */ (device).focusPointOfInterest = 5; }), 'TypeError');
    device.autoFocusRangeRestriction = 'near';
    assert('锁：对焦范围写 near 读回来', device.autoFocusRangeRestriction, 'near');
    assert('锁：对焦范围写错名字', enumIgnored(() => {
      // @ts-expect-error 故意写错的值
      device.autoFocusRangeRestriction = 'close';
    }, () => device.autoFocusRangeRestriction), ENUM_IGNORED);
    device.autoFocusRangeRestriction = 'none';
    device.focusPointOfInterest = { x: 0.5, y: 0.5 };
    device.focusMode = 'continuousAutoFocus';
    assert('锁：focusMode 改回连续自动对焦', device.focusMode, 'continuousAutoFocus');
  } finally {
    device.unlockForConfiguration();
  }
  assert('锁：交还之后再写又抛 InvalidStateError', thrown(() => { device.videoZoomFactor = 1; }), 'InvalidStateError');

  // ---- 接上摄像头 ----
  const input = new AVCaptureDeviceInput(device);
  assert('输入：建出来了', input instanceof AVCaptureDeviceInput, true);
  assert('输入：device 是传进去的那个', input.device, device);
  assert('输入：device 只读', thrown(() => { /** @type {any} */ (input).device = device; }), 'TypeError');
  assert('会话：能加摄像头输入', session.canAddInput(input), true);
  session.addInput(input);
  assert('会话：加了之后 inputs 里是同一个对象', session.inputs.length === 1 && session.inputs[0] === input, true);
  assert('会话：同一个输入不能加两次', session.canAddInput(input), false);

  const output = new AVCaptureMetadataOutput();
  session.addOutput(output);
  const available = output.availableMetadataObjectTypes;
  console.log('  · 实测：能识别 ' + available.join(', '));
  assert('输出：加进会话之后能识别二维码', available.includes('qrCode'), true);
  assert('输出：加进会话之后能识别人脸', available.includes('face'), true);
  assert('输出：能识别的名字都在类型定义里', available.every((t) => METADATA_TYPES.includes(t)), true);
  output.metadataObjectTypes = ['qrCode', 'ean13Code'];
  assert('输出：metadataObjectTypes 写了读回来', output.metadataObjectTypes.join(','), 'qrCode,ean13Code');
  const unavailable = METADATA_TYPES.filter((t) => !available.includes(t));
  if (unavailable.length > 0) {
    const name = /** @type {AVMetadataObjectType} */ (unavailable[0]);
    assert('输出：写当前不能识别的 ' + name + ' 抛 TypeError',
           thrown(() => { output.metadataObjectTypes = ['qrCode', name]; }), 'TypeError');
    assert('输出：抛了之后值没变', output.metadataObjectTypes.join(','), 'qrCode,ean13Code');
  } else {
    console.log('  ! 每一种都能识别，「写当前不能识别的种类」这一条在会话里没法验');
  }
  output.metadataObjectTypes = ['qrCode'];

  // ---- 真的开和停 ----
  let starts = 0;
  let stops = 0;
  session.addEventListener('start', () => { starts++; });
  session.addEventListener('stop', () => { stops++; });
  const view = ctx.section('相机取景', 240);
  layer.frame = { x: 0, y: 0, width: 180, height: 240 };
  view.layer.addSublayer(layer);
  const starting = session.startRunning();
  assert('开：startRunning 返回 Promise', starting instanceof Promise, true);
  assert('开：startRunning 兑现', await starting.then(() => '兑现了', () => '拒绝了'), '兑现了');
  assert('开：兑现之后 isRunning 是 true', session.isRunning, true);
  await wait(300);
  assert('开：派发一次 start', starts, 1);
  assert('开：再开一次也兑现', await session.startRunning().then(() => '兑现了', () => '拒绝了'), '兑现了');

  // 图层的换算：画面铺满 180×240 的图层，正中对正中
  const center = layer.captureDevicePointOfInterestForPoint({ x: 90, y: 120 });
  assert('图层：换算出来是 CGPoint', center instanceof CGPoint, true);
  assert('图层：图层正中对画面正中', near(center.x, 0.5) && near(center.y, 0.5), true);
  const back = layer.pointForCaptureDevicePointOfInterest({ x: 0.5, y: 0.5 });
  assert('图层：反过来换算回图层正中', Math.abs(back.x - 90) < 1 && Math.abs(back.y - 120) < 1, true);
  const whole = layer.metadataOutputRectOfInterestForRect(layer.bounds);
  console.log('  · 实测：整个图层换算成 rectOfInterest 是 ' + String(whole));
  assert('图层：rectOfInterest 的换算是 CGRect', whole instanceof CGRect, true);
  assert('图层：铺满时整个图层在 0 到 1 之内',
         whole.x >= -0.001 && whole.y >= -0.001 && whole.x + whole.width <= 1.001 &&
         whole.y + whole.height <= 1.001 && whole.width > 0 && whole.height > 0, true);

  // 有人对着码时顺手验 detect 的形状；没有就算了
  /** @type {AVCaptureMetadataOutputDetectEvent | null} */
  let detected = null;
  /** @type {AVCaptureMetadataOutputDetectEvent | null} */
  let most = null;
  output.addEventListener('detect', (e) => {
    if (detected === null) detected = e;
    if (most === null || e.objects.length > most.objects.length) most = e;
  });
  // 最多等 10 秒：一认到就再看 2 秒，量一帧里最多认到几个
  for (let i = 0; i < 100 && detected === null; i++) await wait(100);
  if (detected !== null) await wait(2000);
  const busiest = /** @type {AVCaptureMetadataOutputDetectEvent | null} */ (most);
  if (busiest !== null) {
    console.log('  · 实测：一帧里最多认到 ' + busiest.objects.length + ' 个码：' +
                busiest.objects.map((o) => o instanceof AVMetadataMachineReadableCodeObject ? o.stringValue : o.type).join('、'));
  }
  const event = /** @type {AVCaptureMetadataOutputDetectEvent | null} */ (detected);
  if (event !== null) {
    const first = event.objects[0];
    assert('detect：objects 是数组', Array.isArray(event.objects), true);
    assert('detect：是码对象', first instanceof AVMetadataMachineReadableCodeObject, true);
    if (first instanceof AVMetadataMachineReadableCodeObject) {
      console.log('  · 实测：扫到 ' + first.stringValue);
      assert('detect：type 是 qrCode', first.type, 'qrCode');
      assert('detect：bounds 是 CGRect', first.bounds instanceof CGRect, true);
      assert('detect：四个角', first.corners.length, 4);
      assert('detect：字段只读', thrown(() => { /** @type {any} */ (first).stringValue = 'x'; }), 'TypeError');
      const moved = layer.transformedMetadataObjectForMetadataObject(first);
      assert('detect：换算到图层之后还是码对象', moved instanceof AVMetadataMachineReadableCodeObject, true);
    }
  } else {
    console.log('  ! 10 秒内摄像头前面没有二维码：detect 事件的形状、换算到图层，未验证');
  }

  const stopping = session.stopRunning();
  assert('停：stopRunning 返回 Promise', stopping instanceof Promise, true);
  assert('停：stopRunning 兑现', await stopping.then(() => '兑现了', () => '拒绝了'), '兑现了');
  assert('停：兑现之后 isRunning 是 false', session.isRunning, false);
  await wait(300);
  assert('停：派发一次 stop', stops, 1);
  layer.removeFromSuperlayer();
  session.removeInput(input);
  assert('会话：去掉输入之后 inputs 空了', session.inputs.length, 0);
  unverifiedByHand(event !== null);
}

/** @param {boolean} [scanned] 这一遍摄像头前有没有码（有的话 detect 已经验过了） */
function unverifiedByHand(scanned = false) {
  console.log('  ! 要人配合：' + (scanned ? '' : '对着二维码扫（detect 事件，取景时摄像头前要有码）、') +
              '手电筒真的亮起来（torchMode = "on"）、平滑变焦看得到、画面在图层里的样子，未验证');
  console.log('  ! 触发不了：interrupt / interruptend（要来电或者别的 App 抢摄像头）、runtimeerror，未验证');
}
