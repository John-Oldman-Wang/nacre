// 拍照的 JS 那一半：UIImagePickerController。
//
// 这是**能力包自己的 part**：它不在核心里，跟着 NacreCamera.framework 走
// （Builtin/parts/）。写法和核心的 part 一样——整个文件是一个函数表达式，
// 运行时在核心的 part 全部跑完之后，用同一个 ctx 调它一次。
(function (ctx) {
  'use strict';

  const {
    Event,
    constructNative,
    defineNativeClass,
    internalEventHandlers,
    nativeCall,
    nativeCallObject,
    nativeClassCallValue,
    nativeGet,
    nativeSet,
    requireNative,
    toBoolean,
    toRect,
  } = ctx;

  // cameraDevice 和 cameraFlashMode 只在来源是相机时有意义。读的通道没有
  // 报错的出口，原生用返回值说话，在这里换成抛：来源不是相机给的是 null；
  // 系统在读的时候抛了异常给的是 { error }
  function cameraOnly(value, name) {
    if (value === null) {
      throw new TypeError(
        name + ' is only available when sourceType is "camera"; set sourceType first');
    }
    if (typeof value === 'object') throw new TypeError(value.error);
    return value;
  }

  // ---- 系统的拍照界面 ----
  //
  // 它是一个页面，用页面的 presentViewController() 弹出来。用户拍完点了
  // 「使用照片」派发 pick，点了取消派发 cancel；
  // **两种情况系统都不会自己关掉它**，要在监听器里调 dismissViewController()。
  //
  // ObjC 里它继承自 UINavigationController，这里继承的是 UIViewController：
  // 那个导航栈是系统私有的（Apple 的文档写明不许改它的视图层级），而导航
  // 控制器的事件要占 delegate，拍照的结果正是从 delegate 来的。所以导航
  // 那一组成员（pushViewController、viewControllers、show…）这里都没有
  defineNativeClass('UIImagePickerController',
                    class UIImagePickerController extends UIViewController {
    constructor() {
      super();
      constructNative(this, new.target, 'UIImagePickerController', []);
    }

    // 这台设备能做什么。枚举值写错由原生抛，把能写的列出来
    static isSourceTypeAvailable(sourceType) {
      return nativeClassCallValue('UIImagePickerController', 'isSourceTypeAvailable:',
                                  [sourceType]);
    }
    static isCameraDeviceAvailable(cameraDevice) {
      return nativeClassCallValue('UIImagePickerController', 'isCameraDeviceAvailable:',
                                  [cameraDevice]);
    }
    static isFlashAvailableForCameraDevice(cameraDevice) {
      return nativeClassCallValue('UIImagePickerController',
                                  'isFlashAvailableForCameraDevice:', [cameraDevice]);
    }

    // 读出来是系统的事实：刚建好时是 'photoLibrary'。写只收 'camera'——
    // 另外两种是从相册选图，那是 @nacrejs/photos 的事；相机这种来源不可用的
    // 设备上写 'camera' 也抛
    get sourceType() { requireNative(this, 'sourceType'); return nativeGet(this, 'sourceType'); }
    set sourceType(value) { requireNative(this, 'sourceType'); nativeSet(this, 'sourceType', value); }

    // 拍完之后让用户移动和缩放照片来裁剪。开了之后事件里多出 editedImage 和 cropRect
    get allowsEditing() { requireNative(this, 'allowsEditing'); return nativeGet(this, 'allowsEditing'); }
    set allowsEditing(value) {
      requireNative(this, 'allowsEditing');
      nativeSet(this, 'allowsEditing', toBoolean(value));
    }

    // 下面两个只在 sourceType 是 'camera' 时能读写
    get cameraDevice() {
      requireNative(this, 'cameraDevice');
      return cameraOnly(nativeGet(this, 'cameraDevice'), 'cameraDevice');
    }
    set cameraDevice(value) { requireNative(this, 'cameraDevice'); nativeSet(this, 'cameraDevice', value); }
    get cameraFlashMode() {
      requireNative(this, 'cameraFlashMode');
      return cameraOnly(nativeGet(this, 'cameraFlashMode'), 'cameraFlashMode');
    }
    set cameraFlashMode(value) {
      requireNative(this, 'cameraFlashMode');
      nativeSet(this, 'cameraFlashMode', value);
    }
  });

  // 拍到了。原生那边先发的是这个内部事件：负载过桥是 JSON，带不了图片，
  // 所以它只带一个号和裁剪框，图片留在原生那边等这里按号去取。取完把那一条
  // 放开，再派发对外的事件。
  //
  // 字段名照系统给的 info 字典的键（UIImagePickerControllerOriginalImage…）
  const UIImagePickerControllerMediaEvent = ctx.defineEventClass(
    'UIImagePickerControllerMediaEvent', Event, {
      originalImage: ['UIImage?', null], editedImage: ['UIImage?', null], cropRect: ['CGRect?', null],
    });
  internalEventHandlers.set('@imagepicked', (picker, payload) => {
    const token = payload.token;
    const originalImage = nativeCallObject(picker, 'nacre:takeImage:', [token, 'original']);
    const editedImage = nativeCallObject(picker, 'nacre:takeImage:', [token, 'edited']);
    nativeCall(picker, 'nacre:dropResult:', [token]);
    picker.dispatchEvent(new UIImagePickerControllerMediaEvent('pick', {
      originalImage, editedImage, cropRect: toRect(payload.cropRect),
    }));
  });
})
