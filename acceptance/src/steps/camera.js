// 拍照：@nacrejs/camera 的 UIImagePickerController，只做相机这一种来源。
//
// 统一验收是在模拟器上跑的。实测（iPhone Air 模拟器，iOS 27.2）：
// isSourceTypeAvailable('camera') 是 true，而 isCameraDeviceAvailable 对前后
// 两个摄像头都是 false——「相机这种来源可用」和「有摄像头」是两件事。
// 最初这里假设模拟器上来源不可用，还断言了两者相等，合并后的验收证明不成立。
//
// 所以分三层：
//   1. 和硬件无关的（类方法返回布尔、默认值、读写、写错了抛什么）——同步跑完
//   2. 看「相机这种来源可不可用」分两支：可用时验来源切到相机之后的那几个
//      属性；不可用时验 sourceType = 'camera' 被拒。没走到的那一支打一行
//      「未验证」
//   3. 真的弹出拍照界面、拍一张——面板里的三个按钮，要人点。有摄像头的真机
//      上才拍得了；来源可用但没有摄像头时弹出来是什么，没有验证过

import { collectGarbage, customEventWorks, enumIgnored, ENUM_IGNORED } from '../support.js';
import { panelRow, systemPanel } from './pasteboard.js';

/** @param {import("../main.js").StepContext} ctx */
export function stepCamera(ctx) {
  const { assert, vc } = ctx;

  console.log('--- 拍照（@nacrejs/camera）---');

  /**
   * 断言一段代码抛 TypeError，并且报错里有指定的那几个字。
   *
   * @param {string} label
   * @param {() => unknown} fn
   * @param {string} needle
   */
  const rejects = (label, fn, needle) => {
    try {
      fn();
      console.log('  ✗ ' + label + '：居然通过了');
    } catch (err) {
      const message = String(/** @type {Error} */ (err).message);
      const passed = err instanceof TypeError && message.includes(needle);
      console.log((passed ? '  ✓ ' : '  ✗ ') + label + '：' + message +
                  (passed ? '' : '（期望是 TypeError，并且提到 ' + needle + '）'));
    }
  };

  // ===== 装了这个包才有这个类 =====
  assert('装了 @nacrejs/camera：全局有 UIImagePickerController',
         typeof UIImagePickerController, 'function');
  rejects('不能继承',
          () => { class Mine extends UIImagePickerController {} return new Mine(); },
          'subclassing');

  // ===== 类方法：这台设备能做什么 =====
  // 「相机这种来源可不可用」。它不等于「有摄像头」，见文件开头
  const sourceAvailable = UIImagePickerController.isSourceTypeAvailable('camera');
  assert('isSourceTypeAvailable("camera") 是布尔', typeof sourceAvailable, 'boolean');
  // 另外两种来源这个包不支持（见下面 sourceType 的写入），但「有没有」是事实，照答
  assert('isSourceTypeAvailable("photoLibrary") 是布尔',
         typeof UIImagePickerController.isSourceTypeAvailable('photoLibrary'), 'boolean');
  assert('isSourceTypeAvailable("savedPhotosAlbum") 是布尔',
         typeof UIImagePickerController.isSourceTypeAvailable('savedPhotosAlbum'), 'boolean');
  rejects('isSourceTypeAvailable：不认识的来源',
          // @ts-expect-error 没有这种来源
          () => UIImagePickerController.isSourceTypeAvailable('video'),
          'expected one of');
  rejects('isSourceTypeAvailable：没给参数',
          // @ts-expect-error 少了参数
          () => UIImagePickerController.isSourceTypeAvailable(),
          'expected one of');

  const hasRear = UIImagePickerController.isCameraDeviceAvailable('rear');
  const hasFront = UIImagePickerController.isCameraDeviceAvailable('front');
  assert('isCameraDeviceAvailable("rear") 是布尔', typeof hasRear, 'boolean');
  assert('isCameraDeviceAvailable("front") 是布尔', typeof hasFront, 'boolean');
  rejects('isCameraDeviceAvailable：不认识的摄像头',
          // @ts-expect-error 后置叫 rear
          () => UIImagePickerController.isCameraDeviceAvailable('back'),
          'expected one of');

  assert('isFlashAvailableForCameraDevice("rear") 是布尔',
         typeof UIImagePickerController.isFlashAvailableForCameraDevice('rear'), 'boolean');
  assert('isFlashAvailableForCameraDevice("front") 是布尔',
         typeof UIImagePickerController.isFlashAvailableForCameraDevice('front'), 'boolean');
  rejects('isFlashAvailableForCameraDevice：不认识的摄像头',
          // @ts-expect-error 要的是 rear 或 front
          () => UIImagePickerController.isFlashAvailableForCameraDevice(0),
          'expected one of');
  // 只记录，不断言它们之间的关系：模拟器上来源可用而两个摄像头都不可用
  console.log('  实测：这台设备 camera 来源 = ' + sourceAvailable + '，rear = ' + hasRear +
              '，front = ' + hasFront + '，后置闪光灯 = ' +
              UIImagePickerController.isFlashAvailableForCameraDevice('rear') +
              '，前置闪光灯 = ' +
              UIImagePickerController.isFlashAvailableForCameraDevice('front'));

  // ===== 构造和默认值 =====
  const picker = new UIImagePickerController();
  assert('new 出来的是 UIImagePickerController', picker instanceof UIImagePickerController, true);
  assert('它是页面（UIViewController）', picker instanceof UIViewController, true);
  // ObjC 里它继承自 UINavigationController，但那个导航栈是系统私有的、不许动。
  // JS 这边不给导航控制器的成员
  assert('它不是 JS 里的 UINavigationController', picker instanceof UINavigationController, false);
  assert('没有导航栈的成员', 'pushViewController' in picker, false);
  // 第二个留着后面用。只建两个：建这个页面不便宜，步骤里同步的部分别太重
  const idle = new UIImagePickerController();
  assert('每次 new 是新的对象', idle !== picker, true);
  // 头文件：default value is UIImagePickerControllerSourceTypePhotoLibrary
  assert('sourceType 默认是 photoLibrary（系统的默认值，照实给）', picker.sourceType, 'photoLibrary');
  assert('allowsEditing 默认 false', picker.allowsEditing, false);

  picker.allowsEditing = true;
  assert('allowsEditing 写得进去', picker.allowsEditing, true);
  // @ts-expect-error 类型上是布尔；运行时照 Web IDL 转
  picker.allowsEditing = 0;
  assert('allowsEditing = 0 转成 false', picker.allowsEditing, false);
  // @ts-expect-error 类型上是布尔；非空字符串是真值
  picker.allowsEditing = 'false';
  assert('allowsEditing = "false" 转成 true（和 Web 一致）', picker.allowsEditing, true);
  picker.allowsEditing = false;

  // ===== sourceType：只收 'camera' =====
  rejects('sourceType = "photoLibrary" 被拒，指到 @nacrejs/photos',
          // @ts-expect-error 这个包只做拍照
          () => { picker.sourceType = 'photoLibrary'; },
          '@nacrejs/photos');
  rejects('sourceType = "savedPhotosAlbum" 被拒，指到 @nacrejs/photos',
          // @ts-expect-error 这个包只做拍照
          () => { picker.sourceType = 'savedPhotosAlbum'; },
          '@nacrejs/photos');
  assert('sourceType：不认识的值：不抛、值不变', enumIgnored(() => {
    // @ts-expect-error 没有这种来源
    picker.sourceType = 'video';
  }, () => picker.sourceType), ENUM_IGNORED);
  assert('sourceType：给数字：不抛、值不变', enumIgnored(() => {
    // @ts-expect-error 枚举是字符串
    picker.sourceType = 1;
  }, () => picker.sourceType), ENUM_IGNORED);
  assert('sourceType：给 null：不抛、值不变', enumIgnored(() => {
    // @ts-expect-error 枚举是字符串
    picker.sourceType = null;
  }, () => picker.sourceType), ENUM_IGNORED);
  assert('被拒之后 sourceType 没变', picker.sourceType, 'photoLibrary');

  // ===== 相机的属性：来源不是相机时一律抛 =====
  //
  // 头文件：camera additions available only if sourceType is
  // UIImagePickerControllerSourceTypeCamera。这里读和写都拒
  rejects('来源不是相机：读 cameraDevice 抛', () => idle.cameraDevice, 'sourceType');
  rejects('来源不是相机：写 cameraDevice 抛', () => { idle.cameraDevice = 'front'; }, 'sourceType');
  rejects('来源不是相机：读 cameraFlashMode 抛', () => idle.cameraFlashMode, 'sourceType');
  rejects('来源不是相机：写 cameraFlashMode 抛', () => { idle.cameraFlashMode = 'off'; }, 'sourceType');

  // ===== 相机这种来源可不可用，两条路 =====
  if (!sourceAvailable) {
    rejects('来源不可用：sourceType = "camera" 是能 catch 的 TypeError',
            () => { picker.sourceType = 'camera'; },
            'not available');
    assert('来源不可用：被拒之后 sourceType 没变', picker.sourceType, 'photoLibrary');
    rejects('来源不可用：再写一次还是被拒', () => { picker.sourceType = 'camera'; }, 'not available');
    console.log('  ! 这台设备上相机这种来源不可用：来源切到相机之后的默认值、' +
                'cameraDevice / cameraFlashMode 的读写这一组未验证');
  } else {
    console.log('  ! 这台设备上相机这种来源可用：「来源不可用时 sourceType = "camera" ' +
                '抛 TypeError」这一条未验证');
    picker.sourceType = 'camera';
    assert('来源可用：sourceType 写得进去', picker.sourceType, 'camera');
    picker.sourceType = 'camera';
    assert('来源可用：重复写 camera 不抛', picker.sourceType, 'camera');
    rejects('来源是相机：photoLibrary 还是被拒',
            // @ts-expect-error 这个包只做拍照
            () => { picker.sourceType = 'photoLibrary'; },
            '@nacrejs/photos');
    assert('来源是相机：被拒之后还是 camera', picker.sourceType, 'camera');

    // 头文件：default is UIImagePickerControllerCameraDeviceRear / FlashModeAuto。
    // 模拟器上两个摄像头都不可用，读出来也是 rear（实测）
    assert('来源是相机：cameraDevice 默认 rear', picker.cameraDevice, 'rear');
    assert('来源是相机：cameraFlashMode 默认 auto', picker.cameraFlashMode, 'auto');
    for (const mode of /** @type {const} */ (['off', 'on', 'auto'])) {
      picker.cameraFlashMode = mode;
      assert('来源是相机：cameraFlashMode = ' + mode + ' 读得回来', picker.cameraFlashMode, mode);
    }
    assert('来源是相机：不认识的闪光灯模式：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 没有这种模式
      picker.cameraFlashMode = 'torch';
    }, () => picker.cameraFlashMode), ENUM_IGNORED);
    assert('来源是相机：被拒之后闪光灯模式没变', picker.cameraFlashMode, 'auto');
    assert('来源是相机：不认识的摄像头：不抛、值不变', enumIgnored(() => {
      // @ts-expect-error 后置叫 rear
      picker.cameraDevice = 'back';
    }, () => picker.cameraDevice), ENUM_IGNORED);
    // 两个摄像头各看一次：有就写得进去、读得回来；没有就被拒，值不变。
    // 先 front 后 rear，这样有后置摄像头时最后停在 rear
    for (const [device, available] of /** @type {const} */ ([['front', hasFront], ['rear', hasRear]])) {
      if (available) {
        picker.cameraDevice = device;
        assert('来源是相机：cameraDevice = ' + device + ' 读得回来', picker.cameraDevice, device);
      } else {
        const before = picker.cameraDevice;
        rejects('来源是相机但没有 ' + device + ' 摄像头：cameraDevice = ' + device + ' 被拒',
                () => { picker.cameraDevice = device; },
                'not available');
        assert('被拒之后 cameraDevice 没变', picker.cameraDevice, before);
      }
    }
  }

  // ===== 事件 =====
  let cancels = 0;
  const onCancel = () => { cancels += 1; };
  const onFinish = () => {};
  picker.addEventListener('pick', onFinish);
  picker.addEventListener('cancel', onCancel);
  console.log('  ✓ pick 和 cancel 都订得上');
  // dispatchEvent 是 EventTarget 的语义：只派发给 JS 的监听器，不碰原生
  picker.dispatchEvent(new Event('cancel'));
  assert('自己 dispatchEvent 的 cancel 到得了监听器', cancels, 1);
  picker.removeEventListener('pick', onFinish);
  picker.removeEventListener('cancel', onCancel);
  picker.dispatchEvent(new Event('cancel'));
  assert('移走监听器之后不再收到', cancels, 1);

  assert('不认识的事件名当自定义事件', customEventWorks(picker, 'not-a-real-event'), '收到一次');
  assert('同一个不认识的名字再来一遍，还是当自定义事件', customEventWorks(picker, 'not-a-real-event'), '收到一次');
  // 页面的那三个关闭事件说的是「用户把模态页拖走」。拍照界面关不关由监听器
  // 决定（见 cancel），这三个不给
  for (const type of /** @type {const} */ (['beforedismiss', 'dismiss', 'dismissattempt'])) {
    assert('拍照界面上 ' + type + ' 当自定义事件', customEventWorks(picker, type), '收到一次');
  }
  // 它在 ObjC 里是导航控制器，但导航的事件不能给：那两个事件要占 delegate，
  // 而拍照的结果就是从 delegate 来的
  for (const type of /** @type {const} */ (['beforeshow', 'show'])) {
    assert('拍照界面上 ' + type + ' 当自定义事件', customEventWorks(picker, type), '收到一次');
  }
  // 页面出现和消失的四个事件照常能订
  picker.addEventListener('appear', onFinish);
  picker.removeEventListener('appear', onFinish);
  console.log('  ✓ 页面的 appear 照常订得上');

  // ===== 留给真实触摸的一排按钮 =====
  //
  // 有摄像头的真机上点得出结果：拍照界面弹出来、拍一张、点「使用照片」或者
  // 「取消」，终端里打出事件带的东西。
  //
  // 来源可用但没有摄像头时（实测模拟器就是这样）照样去弹：弹出来是什么、
  // 会不会抛，没有验证过，点这个按钮就是在验。呈现时系统当场抛的异常会让
  // present 的 Promise 被拒（核心的入口有保护），下面打出来
  const reclaimed = new FinalizationRegistry((/** @type {{ gone: boolean }} */ token) => {
    token.gone = true;
  });
  /** @param {{ gone: boolean }} token */
  const checkReclaimed = (token) => {
    collectGarbage().then((ran) => {
      console.log(!ran ? '  ! 真实触摸：GC 没跑到，拍照界面的包装有没有被回收这一条未验证'
        : token.gone ? '  ✓ 真实触摸：拍照界面关掉之后，它的包装被回收了'
          : '  ✗ 真实触摸：拍照界面关掉之后，它的包装还没被回收');
    });
  };
  /** @param {UIImage | null} image */
  const describe = (image) =>
    image === null ? 'null'
      : image.size.width + ' × ' + image.size.height + ' pt，scale = ' + image.scale;

  /**
   * @param {string} what
   * @param {(picker: UIImagePickerController) => void} configure
   */
  const shoot = (what, configure) => () => {
    if (!UIImagePickerController.isSourceTypeAvailable('camera')) {
      console.log('  ! 真实触摸：这台设备上相机这种来源不可用，「' + what + '」弹不出来');
      return;
    }
    if (!UIImagePickerController.isCameraDeviceAvailable('rear') &&
        !UIImagePickerController.isCameraDeviceAvailable('front')) {
      console.log('  ! 真实触摸：相机这种来源可用，但两个摄像头都不可用（模拟器上实测如此）。' +
                  '「' + what + '」照样去弹，弹出来是什么没有验证过，看下面打出什么');
    }
    // 每次点都新建一个：拍照界面用完就丢，不复用
    const camera = new UIImagePickerController();
    camera.sourceType = 'camera';
    try {
      configure(camera);
    } catch (err) {
      console.log('  ! 真实触摸：「' + what + '」配置时被拒：' + /** @type {Error} */ (err).message);
      return;
    }
    const token = { gone: false };
    reclaimed.register(camera, token);
    const close = () => {
      camera.dismissViewController({ animated: true }).then(() => {
        console.log('  ✓ 真实触摸：拍照界面关掉了，presentedViewController = ' +
                    vc.presentedViewController);
        checkReclaimed(token);
      });
    };
    camera.addEventListener('pick', (e) => {
      const shot = /** @type {UIImagePickerControllerMediaEvent} */ (e);
      console.log('  ✓ 真实触摸：「' + what + '」拍到了，e.target 是这个界面 = ' +
                  (e.target === camera) +
                  '，originalImage 是 UIImage = ' + (shot.originalImage instanceof UIImage) +
                  '（' + describe(shot.originalImage) + '）' +
                  '，editedImage = ' + describe(shot.editedImage) +
                  '，cropRect = ' + (shot.cropRect === null ? 'null'
                    : shot.cropRect.x + ', ' + shot.cropRect.y + ', ' +
                      shot.cropRect.width + ' × ' + shot.cropRect.height) +
                  '，cropRect 是 CGRect = ' + (shot.cropRect instanceof CGRect));
      close();
    });
    camera.addEventListener('cancel', (e) => {
      console.log('  ✓ 真实触摸：「' + what + '」点了取消，e.target 是这个界面 = ' +
                  (e.target === camera));
      close();
    });
    vc.presentViewController(camera, { animated: true }).then((shown) => {
      console.log('  ✓ 真实触摸：「' + what + '」弹出来了 = ' + shown +
                  '，modalPresentationStyle = ' + camera.modalPresentationStyle +
                  '，cameraDevice = ' + camera.cameraDevice +
                  '，cameraFlashMode = ' + camera.cameraFlashMode);
    }, (err) => {
      console.log('  ✗ 真实触摸：「' + what + '」没弹出来：' + err.message);
    });
  };
  panelRow(systemPanel(ctx), [
    ['拍照', shoot('拍照', () => {})],
    ['拍照并裁剪', shoot('拍照并裁剪', (camera) => { camera.allowsEditing = true; })],
    ['前置拍照', shoot('前置拍照', (camera) => {
      camera.cameraDevice = 'front';
      camera.cameraFlashMode = 'off';
    })],
  ]);
  console.log('  ✓ 面板里多了一排按钮：拍照 / 拍照并裁剪 / 前置拍照（要人点）');
}
