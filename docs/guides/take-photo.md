# 拍一张照片

这一篇讲怎么用 [`UIImagePickerController`](../api/ui-image-picker-controller.md) 弹出系统的拍照界面、拿到用户拍的照片。照片的类型是 [`UIImage`](../api/ui-image.md)。

开始之前要先装 `@nacrejs/camera`，并在 `nacre.config.json` 里写 `NSCameraUsageDescription`，见 [`UIImagePickerController`](../api/ui-image-picker-controller.md#先装上)。

## 推荐的做法

- **弹出之前先问这台设备能不能拍照。** 要问两件事：相机这种来源可不可用，有没有摄像头。写法见[先问这台设备能不能拍照](#先问这台设备能不能拍照)。
- **`pick` 和 `cancel` 两个事件都监听，在两个监听器里都调 `dismissViewController()`。** 系统不会自己关掉拍照界面。
- **每次拍照新建一个 `UIImagePickerController`。** 用完关掉之后不用保存它，没有变量指着它时它会被回收。
- **拍到的照片比屏幕大得多。** 它是相机的完整分辨率（具体尺寸**未验证**，第一个例子会把它输出到控制台）。只是要在界面上显示一张小图（头像、缩略图）时，用 [`prepareThumbnail()`](../api/ui-image.md#大图和网络图片) 取一张缩小的来显示，不要把原图直接交给一个小的图片视图。
- **想写成一句 `await`，自己包一个函数。** 写法见[包成一个返回 Promise 的函数](#包成一个返回-promise-的函数)。

## 第一个例子

从空白 App 开始，页面上有一个按钮和一个图片视图。点按钮弹出拍照界面，拍完之后照片显示在图片视图里。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/camera" />

application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('拍照', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  const preview = new UIImageView();
  preview.frame = new CGRect(40, 180, 240, 320);
  preview.contentMode = 'scaleAspectFit';
  page.view.addSubview(preview);

  button.addEventListener('click', () => {
    // 1. 先问能不能拍照：来源可用，并且至少有一个摄像头
    const hasCamera =
      UIImagePickerController.isCameraDeviceAvailable('rear') ||
      UIImagePickerController.isCameraDeviceAvailable('front');
    if (!UIImagePickerController.isSourceTypeAvailable('camera') || !hasCamera) {
      console.log('这台设备拍不了照');
      return;
    }

    // 2. 建拍照界面，来源写成相机
    const picker = new UIImagePickerController();
    picker.sourceType = 'camera';

    // 3. 用户点了「使用照片」：取照片，关掉界面
    picker.addEventListener('pick', (event) => {
      const { originalImage } = /** @type {UIImagePickerControllerMediaEvent} */ (event);
      preview.image = originalImage;
      console.log('拍到了 ' + originalImage.size.width + ' × ' + originalImage.size.height);
      picker.dismissViewController({ animated: true });
    });

    // 4. 用户点了「取消」：关掉界面
    picker.addEventListener('cancel', () => {
      console.log('没有拍');
      picker.dismissViewController({ animated: true });
    });

    // 5. 从当前页面弹出来
    page.presentViewController(picker, { animated: true });
  });
});
```

**效果**

- 页面左上方有一个蓝色文字的按钮「拍照」。
- 模拟器上点它，控制台输出 `这台设备拍不了照`，界面没有变化。
- 真机上点它（以下**未验证**）：第一次会先出现系统的权限提示框；同意之后拍照界面从底部升起来盖住整个屏幕。
- 按快门、点「使用照片」，拍照界面降下去，照片按比例显示在按钮下方 240 × 320 pt 的区域里，控制台输出照片的宽和高。
- 点「取消」，拍照界面降下去，控制台输出 `没有拍`。

这段代码没有作为一个整体运行过。

五步分别是：问设备、建拍照界面并写来源、监听 `pick`、监听 `cancel`、弹出来。

## 先问这台设备能不能拍照

不是每台设备都能拍照。弹出之前先问两件事，两件都成立才弹：

```js
function canTakePhoto() {
  // 1. 相机这种来源可不可用
  if (!UIImagePickerController.isSourceTypeAvailable('camera')) return false;
  // 2. 至少有一个摄像头
  return UIImagePickerController.isCameraDeviceAvailable('rear') ||
         UIImagePickerController.isCameraDeviceAvailable('front');
}

console.log(canTakePhoto());
```

**效果**：模拟器上控制台输出 `false`。有摄像头的真机上的输出**未验证**。

两件事要分开问，因为它们的答案可以不一样。实测模拟器（iPhone Air，iOS 27.2）上：

| 问的是 | 模拟器上的答案 |
| --- | --- |
| `UIImagePickerController.isSourceTypeAvailable('camera')` | `true` |
| `UIImagePickerController.isCameraDeviceAvailable('rear')` | `false` |
| `UIImagePickerController.isCameraDeviceAvailable('front')` | `false` |
| `UIImagePickerController.isFlashAvailableForCameraDevice('rear')`、`('front')` | `false` |

- **只问第一件不够。** 模拟器上第一件是 `true`，`sourceType` 也能写成 `'camera'`，但它没有摄像头。这时把拍照界面弹出来会看到什么、会不会出错，**未在模拟器验证**。
- 第一件是 `false` 时，把 `sourceType` 写成 `'camera'` 会抛 `TypeError`（见 [`sourceType`](../api/ui-image-picker-controller/sourcetype.md)）。
- `canTakePhoto()` 为 `false` 时不显示「拍照」的入口，或者把它置灰。

下面的例子沿用这里的 `canTakePhoto()`，以及下面这几个变量。属性都在弹出之前设好。

```js
const page = new UIViewController();
const button = UIButton.buttonWithType('system');
const picker = new UIImagePickerController();
if (canTakePhoto()) picker.sourceType = 'camera';
```

**效果**：建好一个页面、一个按钮和一个拍照界面。能拍照的设备上，拍照界面的来源是相机。

## 拍照界面什么时候关

系统不会自己关掉拍照界面。用户点了「使用照片」或者「取消」之后，界面还留在屏幕上，等 App 来关：

| 用户做了什么 | 派发的事件 | App 该做什么 |
| --- | --- | --- |
| 拍了一张，点了「使用照片」 | [`pick`](../api/ui-image-picker-controller/pick-event.md)，带着照片 | 取照片，调 `dismissViewController()` |
| 点了「取消」 | [`cancel`](../api/ui-image-picker-controller/cancel-event.md) | 调 `dismissViewController()` |

- **两个事件都要监听。** 只监听 `pick` 的话，用户点「取消」之后界面关不掉。
- 一次弹出只会收到其中一个。
- 用户在「重拍」和取景之间来回时派不派发事件**未验证**；按系统头文件的说明，事件在用户确认或者取消时才来。
- 页面的 `beforedismiss`、`dismiss`、`dismissattempt` 在拍照界面上不会派发；监听它们不会报错，只是收不到。这三个事件说的是用户把页面向下拖走；拍照界面是全屏的，能不能被拖走**未验证**。

## 用户不同意用相机时

系统在 App 第一次打开拍照界面时弹出权限提示框。用户选了什么，App 从这个类上读不到。用户拒绝之后拍照界面是什么样、之后还会不会再问，都**未验证**。

## 拍完让用户裁剪

```js
picker.allowsEditing = true;

picker.addEventListener('pick', (event) => {
  const shot = /** @type {UIImagePickerControllerMediaEvent} */ (event);
  // 开了裁剪时用裁过的那张；万一没有，退回原图
  const image = shot.editedImage ?? shot.originalImage;
  console.log(image.size.width + ' × ' + image.size.height);
  picker.dismissViewController({ animated: true });
});
```

**效果**（**未验证**）：用户按下快门之后多一步，可以移动和缩放照片来选一块区域；点「使用照片」后，`editedImage` 是裁出来的那一块，`originalImage` 还是整张原图，`cropRect` 是那一块在原图上的位置。

## 打开时用前置摄像头

```js
if (UIImagePickerController.isCameraDeviceAvailable('front')) {
  picker.cameraDevice = 'front';
}
```

**效果**（**未验证**）：拍照界面打开时显示的是屏幕这一面摄像头的画面。用户仍然可以在界面上切到后置。

[`cameraDevice`](../api/ui-image-picker-controller/cameradevice.md) 要在 `sourceType` 写成 `'camera'` 之后才能读写，顺序反了会抛 `TypeError`。

## 不让闪光灯闪

```js
if (picker.sourceType === 'camera') {
  picker.cameraFlashMode = 'off';
}
```

**效果**（**未验证**）：拍照界面打开时闪光灯是关的。用户仍然可以在界面上自己打开。

## 拍不了照时把入口置灰

```js
button.isEnabled = canTakePhoto();
```

**效果**：模拟器上按钮是灰的、点不动。能拍照的设备上按钮是正常的（**未验证**）。

## 包成一个返回 Promise 的函数

```js
/**
 * @param {UIViewController} from 从哪个页面弹出来
 * @returns {Promise<UIImage | null>} 拍到的照片；拍不了照或者用户取消是 null
 */
function takePhoto(from) {
  return new Promise((resolve) => {
    if (!canTakePhoto()) {
      resolve(null);
      return;
    }
    const camera = new UIImagePickerController();
    camera.sourceType = 'camera';
    /** @param {UIImage | null} image */
    const finish = (image) => {
      camera.dismissViewController({ animated: true });
      resolve(image);
    };
    camera.addEventListener('pick', (event) => {
      finish(/** @type {UIImagePickerControllerMediaEvent} */ (event).originalImage);
    });
    camera.addEventListener('cancel', () => finish(null));
    from.presentViewController(camera, { animated: true });
  });
}

takePhoto(page).then((photo) => {
  console.log(photo === null ? '没有照片' : '拿到照片了');
});
```

**效果**：模拟器上控制台输出 `没有照片`。真机上（**未验证**）拍照界面弹出来，用户拍完输出 `拿到照片了`，取消输出 `没有照片`。

## 把拍到的照片分享出去

```js
picker.addEventListener('pick', async (event) => {
  const { originalImage } = /** @type {UIImagePickerControllerMediaEvent} */ (event);
  // 等拍照界面关完，再弹下一个页面
  await picker.dismissViewController({ animated: true });
  page.presentViewController(new UIActivityViewController([originalImage]), { animated: true });
});
```

**效果**（**未验证**）：拍照界面关掉之后，系统的[分享面板](../api/ui-activity-view-controller.md)升起来，里面是刚拍的这张照片，可以存到相册或者发给别人。

一个页面同一时刻只能弹出一个页面，所以要等前一个关完。

## 参见

- [`UIImagePickerController`](../api/ui-image-picker-controller.md)：全部属性和事件
- [`UIImage`](../api/ui-image.md)：照片怎么显示、怎么取缩略图
- [`UIViewController`](../api/ui-view-controller.md)：弹出和关闭
- [`UIActivityViewController`](../api/ui-activity-view-controller.md)：分享面板
- [配置 App](project-config.md#写权限文案)：权限文案怎么写、怎么按语言写
