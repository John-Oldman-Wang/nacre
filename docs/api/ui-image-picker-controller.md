---
type: reference
native: UIImagePickerController
status: partial
---

# `UIImagePickerController`

**`UIImagePickerController`** 表示系统的拍照界面。它全屏显示相机的取景画面，带快门、切换前后摄像头和闪光灯的按钮；用户按下快门之后，它显示拍到的照片，底下是「重拍」和「使用照片」。这些都由系统画，App 不参与。用户点了「使用照片」，App 拿到这张照片，类型是 [`UIImage`](ui-image.md)。

`UIImagePickerController` 是一个[页面](ui-view-controller.md)，用页面的 [`presentViewController()`](ui-view-controller.md#presentviewcontroller) 弹出来。用户拍完或者取消时它各派发一个事件，App 在监听器里取照片、把它关掉。

> **注意**：拍照不在核心里，要先装 `@nacrejs/camera` 这个包才有。没装的时候全局没有 `UIImagePickerController`，类型检查也会报找不到这个名字。怎么装见下面「[先装上](#先装上)」。

> **注意**：这一页里凡是拍照界面弹出来之后的效果（界面的样子、两个事件、事件带的照片），目前**未在模拟器验证，真机上也还没有验证**。模拟器没有摄像头，拍不了照。类方法的返回值、属性的默认值和读写、各种写错时的报错，在模拟器（iPhone Air，iOS 27.2）的验收里验过。

这个包只做一件事：用系统的界面拍一张照片。从相册选图是另一个包 `@nacrejs/photos`；录视频、扫码、自己画取景界面都不在这里，见[还不能做的](#还不能做的)。

## 先装上

拍照是一个单独的能力包。在项目里装它：

```bash
npm install @nacrejs/camera
```

**效果**：下次生成 `ios/` 时，工程里多嵌一个 `NacreCamera.framework`；不装的项目，产物里没有它。

然后在 `nacre.config.json` 里写一句给用户看的话，说明这个 App 为什么要用相机。键名 `NSCameraUsageDescription` 是系统规定的：

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

最后在入口文件顶上加一行，让类型进来：

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/camera" />
```

**效果**：编辑器里 `UIImagePickerController` 有了补全和检查。

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
- 第一件是 `false` 时，把 `sourceType` 写成 `'camera'` 会抛 `TypeError`（见 [`sourceType`](#sourcetype)）。
- 推荐的做法是 `canTakePhoto()` 为 `false` 时不显示「拍照」的入口，或者把它置灰。后面的例子都用这个函数。

## 拍照界面什么时候关

**系统不会自己关掉拍照界面。** 用户点了「使用照片」或者「取消」之后，界面还留在屏幕上，等 App 来关：

| 用户做了什么 | 派发的事件 | App 该做什么 |
| --- | --- | --- |
| 拍了一张，点了「使用照片」 | `pick`，带着照片 | 取照片，调 `dismissViewController()` |
| 点了「取消」 | `cancel` | 调 `dismissViewController()` |

- **两个事件都要监听。** 只监听 `pick` 的话，用户点「取消」之后界面关不掉。
- 一次弹出只会收到其中一个。
- 用户在「重拍」和取景之间来回时派不派发事件**未验证**；按系统头文件的说明，事件在用户确认或者取消时才来。
- 页面的 `beforedismiss`、`dismiss`、`dismissattempt` 在拍照界面上不会派发；监听它们不会报错，只是收不到。这三个事件说的是用户把页面向下拖走；拍照界面是全屏的，能不能被拖走**未验证**。

## 用户不同意用相机时

系统在 App 第一次打开拍照界面时弹出权限提示框。用户选了什么，App 从这个类上读不到。用户拒绝之后拍照界面是什么样、之后还会不会再问，都**未验证**。

## 推荐的做法

**每次拍照新建一个 `UIImagePickerController`。** 用完关掉之后不用保存它，没有变量指着它时它会被回收。

**拍到的照片比屏幕大得多。** 它是相机的完整分辨率（具体尺寸**未验证**，完整例子会把它输出到控制台）。只是要在界面上显示一张小图（头像、缩略图）时，用 [`prepareThumbnail()`](ui-image.md#生成缩略图) 取一张缩小的来显示，不要把原图直接交给一个小的图片视图。

**想写成一句 `await`，自己包一个函数。** 写法见[把拍照包成一个返回 Promise 的函数](#把拍照包成一个返回-promise-的函数)。

## 完整例子

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

## 常见用法

下面的例子沿用完整例子里的 `page` 和 `picker`，以及[先问这台设备能不能拍照](#先问这台设备能不能拍照)里的 `canTakePhoto()`。属性都在弹出之前设好。

### 拍完让用户裁剪

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

### 打开时用前置摄像头

```js
if (UIImagePickerController.isCameraDeviceAvailable('front')) {
  picker.cameraDevice = 'front';
}
```

**效果**（**未验证**）：拍照界面打开时显示的是屏幕这一面摄像头的画面。用户仍然可以在界面上切到后置。

`cameraDevice` 要在 `sourceType` 写成 `'camera'` 之后才能读写，顺序反了会抛 `TypeError`。

### 不让闪光灯闪

```js
picker.cameraFlashMode = 'off';
```

**效果**（**未验证**）：拍照界面打开时闪光灯是关的。用户仍然可以在界面上自己打开。

### 拍不了照时把入口置灰

```js
button.isEnabled = canTakePhoto();
```

**效果**：模拟器上按钮是灰的、点不动。能拍照的设备上按钮是正常的（**未验证**）。

### 把拍照包成一个返回 Promise 的函数

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

### 把拍到的照片分享出去

```js
picker.addEventListener('pick', async (event) => {
  const { originalImage } = /** @type {UIImagePickerControllerMediaEvent} */ (event);
  // 等拍照界面关完，再弹下一个页面
  await picker.dismissViewController({ animated: true });
  page.presentViewController(new UIActivityViewController([originalImage]), { animated: true });
});
```

**效果**（**未验证**）：拍照界面关掉之后，系统的[分享面板](ui-activity-view-controller.md)升起来，里面是刚拍的这张照片，可以存到相册或者发给别人。

一个页面同一时刻只能弹出一个页面，所以要等前一个关完。

## 来源

`sourceType` 是拍照界面的图片从哪来。系统定义了三个值：

| 取值 | 含义 | 能不能写 |
| --- | --- | --- |
| `'camera'` | 相机 | 能。这种来源在设备上不可用时抛 `TypeError` |
| `'photoLibrary'`、`'savedPhotosAlbum'` | 相册，两种列法 | 不能，抛 `TypeError` |

新建的 `UIImagePickerController` 读出来是 `'photoLibrary'`，这是系统的默认值。所以**新建之后必须把 `sourceType` 写成 `'camera'`**，它才是拍照界面。没写就弹出来，出现的不是相机，而是系统选照片的界面（**未验证**）；这不是这个包支持的用法，系统的头文件也已经把相册的两个值标成将来要移除。从相册选图用 `@nacrejs/photos`。

`cameraDevice` 和 `cameraFlashMode` 只对相机有意义，所以只在 `sourceType` 是 `'camera'` 时能读写。

## 成员说明

### 创建

#### `new UIImagePickerController()`

```js
const picker = new UIImagePickerController();
```

- **参数**：无。
- 创建和硬件无关，任何设备上都建得出来。新建的还不是拍照界面，见[来源](#来源)。
- 不能继承：`class MyPicker extends UIImagePickerController {}` 在 `new MyPicker()` 时抛 `TypeError`。

### 类方法

三个都是查询这台设备的硬件，随时可以调，不需要先建对象。

| 方法 | 参数 | 返回值 | 含义 |
| --- | --- | --- | --- |
| `UIImagePickerController.isSourceTypeAvailable(sourceType)` | `'camera'`、`'photoLibrary'` 或 `'savedPhotosAlbum'` | `boolean` | 这种来源在这台设备上可不可用。`'camera'` 可用不等于有摄像头 |
| `UIImagePickerController.isCameraDeviceAvailable(cameraDevice)` | `'rear'` 或 `'front'` | `boolean` | 有没有这个摄像头。`'rear'` 是背面的，`'front'` 是屏幕这一面的 |
| `UIImagePickerController.isFlashAvailableForCameraDevice(cameraDevice)` | `'rear'` 或 `'front'` | `boolean` | 这个摄像头有没有闪光灯 |

- **出错**：参数不是表里的值抛 `TypeError`，报错里列出能写的值：
  - `isSourceTypeAvailable has no value "video"; expected one of: photoLibrary / camera / savedPhotosAlbum`
  - `isCameraDeviceAvailable has no value "back"; expected one of: rear / front`
- 模拟器上各返回什么，见[先问这台设备能不能拍照](#先问这台设备能不能拍照)里的表。

### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `sourceType` | 读：`'photoLibrary' \| 'camera' \| 'savedPhotosAlbum'`<br>写：`'camera'` | 是 | 是，只能写 `'camera'` | `'photoLibrary'` | 图片从哪来，见[来源](#来源) |
| `allowsEditing` | `boolean` | 是 | 是 | `false` | `true`：拍完之后用户可以裁剪，事件里多出 `editedImage` 和 `cropRect`。`false`：没有裁剪这一步 |
| `cameraDevice` | `'rear' \| 'front'` | 是 | 是 | `'rear'` | 打开时用哪个摄像头。`'rear'` 是背面的，`'front'` 是屏幕这一面的 |
| `cameraFlashMode` | `'off' \| 'auto' \| 'on'` | 是 | 是 | `'auto'` | 闪光灯。`'off'` 不闪，`'on'` 每次都闪，`'auto'` 由系统按环境的亮度决定 |

- 这些属性变化时不派发事件。用户在拍照界面上切换了摄像头或者闪光灯之后，属性读出来跟不跟着变**未验证**。
- 在弹出之前设好。界面已经在屏幕上之后再改有没有效果**未验证**。
- `allowsEditing` 写别的类型时按 JS 的真假值转成布尔：`0` 是 `false`，非空字符串是 `true`。
- `cameraDevice` 和 `cameraFlashMode` 的默认值、闪光灯三个取值的写入和读回在模拟器上验过。模拟器没有摄像头，`cameraDevice` 读出来也是 `'rear'`；把它写成 `'front'` 被拒（实测）。写成一个存在的摄像头之后读回来**未验证**。

标题、弹出方式等继承自 [`UIViewController`](ui-view-controller.md)。它没有导航栈的成员（`pushViewController()`、`viewControllers` 等）。

#### `sourceType`

写的时候两种情况抛 `TypeError`，抛了之后原来的值不变：

- 写了相册的两个值：`sourceType "photoLibrary" is not supported: @nacrejs/camera only takes photos with the camera (sourceType "camera"). Picking from the photo library is a separate package, @nacrejs/photos`
- 相机这种来源在这台设备上不可用（`isSourceTypeAvailable('camera')` 是 `false`）：`sourceType "camera" is not available on this device. Check UIImagePickerController.isSourceTypeAvailable("camera") first`。这一条**未在模拟器验证**：模拟器上这种来源是可用的，写 `'camera'` 不抛

写了别的值（不是 `'camera'`，也不是相册的两个值）时不抛异常：属性保持原来的值，控制台输出一条警告 `[Nacre] sourceType has no value "video"; expected one of: camera, ignored`。

#### `cameraDevice`、`cameraFlashMode`

- `sourceType` 不是 `'camera'` 时，读和写都抛：`cameraDevice is only available when sourceType is "camera"; set sourceType first`（`cameraFlashMode` 同理）
- `sourceType` 是 `'camera'` 时写了表里没有的值，不抛异常：属性保持原来的值，控制台输出一条警告 `[Nacre] cameraFlashMode has no value "torch"; expected one of: off / auto / on, ignored`（`cameraDevice` 的警告结尾是 `expected one of: rear / front, ignored`）。这一条**未在模拟器验证**
- `cameraDevice` 写了这台设备没有的摄像头：`cameraDevice "front" is not available on this device. Check UIImagePickerController.isCameraDeviceAvailable("front") first`。抛了之后原来的值不变
- 系统自己拒绝了这次读写：`TypeError`，`message` 以属性名开头，后面是系统给的原因。什么情况下会这样**未验证**

### 弹出和关闭

| 想做的事 | 写法 |
| --- | --- |
| 弹出来 | [`page.presentViewController(picker, { animated: true })`](ui-view-controller.md#presentviewcontroller) |
| 关掉 | [`picker.dismissViewController({ animated: true })`](ui-view-controller.md#dismissviewcontroller) |

两个方法都返回 Promise，动画结束时完成。

### 事件

| 事件 | 什么时候派发 |
| --- | --- |
| `pick` | 用户拍了一张，并且点了「使用照片」 |
| `cancel` | 用户点了「取消」 |
| `beforeappear`、`appear`、`beforedisappear`、`disappear` | 继承自页面，见[页面的出现和消失](ui-view-controller.md#页面的出现和消失) |
| `traitchange` | 继承自页面，见[外观特征](ui-trait-collection.md) |

`pick` 的事件对象带三个字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `originalImage` | [`UIImage`](ui-image.md) | 拍到的照片，没有裁剪过 |
| `editedImage` | `UIImage \| null` | 用户裁剪之后的照片。没开 `allowsEditing` 时是 `null` |
| `cropRect` | [`CGRect`](structs.md) ` \| null` | 用户裁的是原图上的哪一块。没开 `allowsEditing` 时是 `null`。数值的单位**未验证** |

- 事件对象的 `target` 是这个拍照界面。
- 两个事件都在用户操作之后派发，不能取消，`preventDefault()` 不起作用。
- 派发之后界面还在屏幕上，见[拍照界面什么时候关](#拍照界面什么时候关)。
- 事件对象的类型要转一下才能读到这三个字段，写法见[完整例子](#完整例子)。
- 监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。页面的 `beforedismiss`、`dismiss`、`dismissattempt` 和导航的 `beforeshow`、`show` 在拍照界面上不会派发，监听它们同样不报错。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

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

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 把拍到的照片上传到服务器，或者存成文件 | `UIImageJPEGRepresentation`、`UIImagePNGRepresentation` | 未实现。[`UIImage`](ui-image.md#还不能做的) 现在不能编码成字节，拍到的照片只能显示和交给[分享面板](ui-activity-view-controller.md) |
| 从相册选一张照片 | `PHPickerViewController` | 不在这个包里，用 `@nacrejs/photos`。`sourceType` 写 `'photoLibrary'` 抛 `TypeError` |
| 把拍到的照片存进相册 | `UIImageWriteToSavedPhotosAlbum` | 不在这个包里，用 `@nacrejs/photos`。它要另一句权限文案 |
| 录视频 | `mediaTypes`、`cameraCaptureMode`、`videoQuality`、`videoMaximumDuration`、`startVideoCapture` | 未实现。只拍照片 |
| 扫二维码和条码 | `AVCaptureSession`、`AVCaptureMetadataOutput`，或者 `DataScannerViewController` | 未实现。要接实时取景 |
| 自己画取景界面，自己放快门按钮 | `showsCameraControls`、`cameraOverlayView`、`cameraViewTransform`、`takePicture`，或者 `AVCaptureSession` | 未实现。同上 |
| 读照片的拍摄参数（光圈、时间、方向） | `info[UIImagePickerControllerMediaMetadata]` | 未实现 |
| 拍实况照片 | `info[UIImagePickerControllerLivePhoto]` | 未实现 |
| 查询或者主动申请相机权限 | `AVCaptureDevice.authorizationStatusForMediaType:`、`requestAccessForMediaType:` | 未实现。权限提示框由系统在第一次打开拍照界面时弹出 |
| 监听导航的 `beforeshow` / `show`，改它里面的页面 | `UINavigationControllerDelegate`、`viewControllers` | 不提供。拍照界面内部的页面是系统私有的 |

## 参见

- [`UIViewController`](ui-view-controller.md)：拍照界面的父类。弹出、关闭、谁弹出了谁
- [`UIImage`](ui-image.md)：照片的类型。怎么显示、怎么取缩略图
- [配置 App](../guides/project-config.md)：权限文案怎么写、怎么按语言写
- [`UIActivityViewController`](ui-activity-view-controller.md)：把拍到的照片交给系统的分享面板
- [结构体](structs.md)：`cropRect` 的类型 `CGRect`
- [实现原理：拍照](../internals/camera.md)
