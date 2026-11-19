---
type: reference
native: UIImagePickerController
status: partial
---

# `UIImagePickerController`

**`UIImagePickerController`** 表示系统的拍照界面。它全屏显示相机的取景画面，带快门、切换前后摄像头和闪光灯的按钮；用户按下快门之后，它显示拍到的照片，底下是「重拍」和「使用照片」。这些都由系统画，App 不参与。用户点了「使用照片」，App 拿到这张照片，类型是 [`UIImage`](ui-image.md)。

`UIImagePickerController` 是一个[页面](ui-view-controller.md)，用页面的 [`presentViewController()`](ui-view-controller/presentviewcontroller.md) 弹出来。用户拍完或者取消时它各派发一个事件，App 在监听器里取照片、把它关掉。

这个包只做一件事：用系统的界面拍一张照片。从相册选图是另一个包 `@nacrejs/photos`。

> **注意**：凡是拍照界面弹出来之后的效果（界面的样子、两个事件、事件带的照片），目前**未在模拟器验证，真机上也还没有验证**。模拟器没有摄像头，拍不了照。静态方法的返回值、属性的默认值和读写、各种写错时的报错，在模拟器（iPhone Air，iOS 27.2）的验收里验过。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIViewController`](ui-view-controller.md) → `UIImagePickerController`

怎么弹出拍照界面、拿到照片，见指南[拍一张照片](../guides/take-photo.md)。

## 先装上

拍照不在核心里，要先装 `@nacrejs/camera` 这个包才有。没装的时候全局没有 `UIImagePickerController`，类型检查也会报找不到这个名字。

**1. 装包。**

```bash
npm install @nacrejs/camera
```

**效果**：下次生成 `ios/` 时，工程里多嵌一个 `NacreCamera.framework`；不装的项目，产物里没有它。

**2. 写一句给用户看的说明。** 在 `nacre.config.json` 里写一句话，说明这个 App 为什么要用相机。键名 `NSCameraUsageDescription` 是系统规定的：

```json
{
  "name": "Shop",
  "bundleId": "com.example.shop",
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "Take a photo of the item you want to sell"
    }
  }
}
```

**效果**：App 第一次打开拍照界面时，系统弹出提示框问用户是否允许使用相机，提示框里显示这句话。提示框在屏幕上的样子**未在模拟器验证**。要按语言各写一句，见[配置 App](../guides/project-config.md#写权限文案)。

装了包却没写这一句，生成 `ios/` 时报错并停下（实测）：

```
nacre: @nacrejs/camera needs NSCameraUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

**3. 让类型进来。** 在入口文件顶上加一行：

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/camera" />
```

**效果**：编辑器里 `UIImagePickerController` 有了补全和检查。

## 构造函数

[`UIImagePickerController()`](ui-image-picker-controller/constructor.md)

创建一个拍照界面。新建之后要先把 `sourceType` 写成 `'camera'`。

## 静态方法

三个都是查询这台设备的硬件，随时可以调，不需要先建对象。

[`UIImagePickerController.isSourceTypeAvailable()`](ui-image-picker-controller/issourcetypeavailable.md)

某种来源在这台设备上可不可用。`'camera'` 可用不等于有摄像头。

[`UIImagePickerController.isCameraDeviceAvailable()`](ui-image-picker-controller/iscameradeviceavailable.md)

有没有背面或者屏幕这一面的摄像头。

[`UIImagePickerController.isFlashAvailableForCameraDevice()`](ui-image-picker-controller/isflashavailableforcameradevice.md)

某个摄像头有没有闪光灯。

## 实例属性

还继承 [`UIViewController`](ui-view-controller.md) 的属性，比如 `title`、`modalPresentationStyle`。它没有导航栈的成员（`pushViewController()`、`viewControllers` 等）。

| 属性 | 说明 |
| --- | --- |
| [`sourceType`](ui-image-picker-controller/sourcetype.md) | 图片从哪来。只能写 `'camera'` |
| [`allowsEditing`](ui-image-picker-controller/allowsediting.md) | 拍完之后让用户裁剪 |
| [`cameraDevice`](ui-image-picker-controller/cameradevice.md) | 打开时用哪个摄像头 |
| [`cameraFlashMode`](ui-image-picker-controller/cameraflashmode.md) | 闪光灯 |

这些属性在弹出之前设好。界面已经在屏幕上之后再改有没有效果**未验证**。它们变化时不派发事件；用户在拍照界面上切换了摄像头或者闪光灯之后，属性读出来跟不跟着变**未验证**。

## 实例方法

没有自己的方法。弹出和关闭用继承自 [`UIViewController`](ui-view-controller.md) 的方法：

| 想做的事 | 写法 |
| --- | --- |
| 弹出来 | [`page.presentViewController(picker, { animated: true })`](ui-view-controller/presentviewcontroller.md) |
| 关掉 | [`picker.dismissViewController({ animated: true })`](ui-view-controller/dismissviewcontroller.md) |

两个方法都返回 Promise，动画结束时完成。

## 事件

用 `addEventListener()` 监听。

| 事件 | 什么时候派发 |
| --- | --- |
| [`pick`](ui-image-picker-controller/pick-event.md) | 用户拍了一张，并且点了「使用照片」。事件带着照片 |
| [`cancel`](ui-image-picker-controller/cancel-event.md) | 用户点了「取消」 |
| `beforeappear`、`appear`、`beforedisappear`、`disappear` | 继承自 `UIViewController`，见[页面的出现和消失](ui-view-controller.md#页面的出现和消失) |
| `traitchange` | 继承自 `UIViewController`，见[外观特征](ui-trait-collection.md) |

- 一次弹出只会收到 `pick` 和 `cancel` 中的一个。
- 监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。
- 页面的 `beforedismiss`、`dismiss`、`dismissattempt` 和导航的 `beforeshow`、`show` 在拍照界面上不会派发，监听它们同样不报错，按自定义事件处理。

## 来源

`sourceType` 是拍照界面的图片从哪来。系统定义了三个值：

| 取值 | 含义 | 能不能写 |
| --- | --- | --- |
| `'camera'` | 相机 | 能。这种来源在设备上不可用时抛 `TypeError` |
| `'photoLibrary'`、`'savedPhotosAlbum'` | 相册，两种列法 | 不能，抛 `TypeError` |

新建的 `UIImagePickerController` 读出来是 `'photoLibrary'`，这是系统的默认值。所以**新建之后必须把 `sourceType` 写成 `'camera'`**，它才是拍照界面。没写就弹出来，出现的不是相机，而是系统选照片的界面（**未验证**）。从相册选图用 `@nacrejs/photos`。

`cameraDevice` 和 `cameraFlashMode` 只对相机有意义，所以只在 `sourceType` 是 `'camera'` 时能读写。

## 拍照界面由 App 关掉

**系统不会自己关掉拍照界面。** 用户点了「使用照片」或者「取消」之后，界面还留在屏幕上，等 App 来关：

| 用户做了什么 | 派发的事件 | App 该做什么 |
| --- | --- | --- |
| 拍了一张，点了「使用照片」 | `pick`，带着照片 | 取照片，调 `dismissViewController()` |
| 点了「取消」 | `cancel` | 调 `dismissViewController()` |

两个事件都要监听。只监听 `pick` 的话，用户点「取消」之后界面关不掉。

## 示例

### 点按钮拍一张照片

下面的代码从空白 App 开始，页面上有一个按钮和一个图片视图。点按钮弹出拍照界面，拍完之后照片显示在图片视图里。

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

更多写法见指南[拍一张照片](../guides/take-photo.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[UIImagePickerController isSourceTypeAvailable:UIImagePickerControllerSourceTypeCamera]` | `UIImagePickerController.isSourceTypeAvailable('camera')` |
| `[UIImagePickerController isCameraDeviceAvailable:UIImagePickerControllerCameraDeviceFront]` | `UIImagePickerController.isCameraDeviceAvailable('front')` |
| `[UIImagePickerController isFlashAvailableForCameraDevice:UIImagePickerControllerCameraDeviceRear]` | `UIImagePickerController.isFlashAvailableForCameraDevice('rear')` |
| `[[UIImagePickerController alloc] init]` | `new UIImagePickerController()` |
| `picker.sourceType = UIImagePickerControllerSourceTypeCamera` | `picker.sourceType = 'camera'` |
| `picker.allowsEditing = YES` | `picker.allowsEditing = true` |
| `picker.cameraDevice = UIImagePickerControllerCameraDeviceFront` | `picker.cameraDevice = 'front'` |
| `picker.cameraFlashMode = UIImagePickerControllerCameraFlashModeOff` | `picker.cameraFlashMode = 'off'` |
| `picker.delegate = self` 并实现<br>`imagePickerController:didFinishPickingMediaWithInfo:` | `picker.addEventListener('pick', (e) => { … })` |
| `info[UIImagePickerControllerOriginalImage]`<br>`info[UIImagePickerControllerEditedImage]`<br>`info[UIImagePickerControllerCropRect]` | `e.originalImage`<br>`e.editedImage`<br>`e.cropRect` |
| 实现 `imagePickerControllerDidCancel:` | `picker.addEventListener('cancel', () => { … })` |
| `[self presentViewController:picker animated:YES completion:nil]` | `page.presentViewController(picker, { animated: true })` |
| `[picker dismissViewControllerAnimated:YES completion:nil]` | `picker.dismissViewController({ animated: true })` |

两处和 ObjC 不一样：

- ObjC 里来源不可用时写 `sourceType` 会抛异常，App 直接终止（Apple 文档的说法，**未验证**）。这里是能 `catch` 的 `TypeError`。
- ObjC 里 `UIImagePickerController` 继承自 `UINavigationController`。这里它继承的是 `UIViewController`，`picker instanceof UINavigationController` 是 `false`。

## 参见

- [拍一张照片](../guides/take-photo.md)：先问设备、弹出、关掉、裁剪、包成 Promise
- [`UIViewController`](ui-view-controller.md)：拍照界面的父类。弹出、关闭、谁弹出了谁
- [`UIImage`](ui-image.md)：照片的类型。怎么显示、怎么取缩略图
- [配置 App](../guides/project-config.md)：权限文案怎么写、怎么按语言写
- [核心和能力包](capabilities.md)：哪些能力要单独装
- [`UIActivityViewController`](ui-activity-view-controller.md)：把拍到的照片交给系统的分享面板
- [结构体](structs.md)：`cropRect` 的类型 `CGRect`
