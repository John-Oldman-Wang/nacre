---
type: reference
native: "+[UIImage imageNamed:]"
---

# `UIImage.imageNamed()` 静态方法

**`UIImage.imageNamed()`** 静态方法按名字取 App 包里的图片。

## 语法

```
UIImage.imageNamed(name)
```

### 参数

**`name`**

字符串。图片在 App 包里的路径，从包的根目录算起，可以不带扩展名。不是字符串时按 `String()` 转。

项目 `assets/` 目录里的文件，在 App 包里的路径是 `JS/assets/`，所以 `assets/logo.png` 写成 `'JS/assets/logo'`。

### 返回值

`UIImage`。找不到时返回 `null`，不抛异常。

### 异常

无。

## 说明

查找规则（实测）：

- 不带扩展名时只找 `.png` 文件。取 GIF、WebP 动图时名字要带扩展名，比如 `'JS/assets/anim.gif'`。APNG 的扩展名是 `.png`，可以不写。
- 不递归搜索子目录。图片在 `JS/assets/` 里，写 `'logo'` 找不到。
- `@2x`、`@3x` 的文件在子目录里也会被自动选中。目录里有 `dot.png`、`dot@2x.png`、`dot@3x.png` 三个文件时，系统按屏幕选其中一个，名字里不写 `@2x`、`@3x`。
- 给的是动图文件时，得到的是动图，见[动图](../ui-image.md#动图)。

iOS 还有另一种存放图片的方式，叫 Asset Catalog。它是 Xcode 管理图片的资源库，编译后合并成一个 `Assets.car` 文件。`imageNamed()` 先查 Asset Catalog，再查 App 包里的文件。两边有同名图片时使用 Asset Catalog 里的（**未在模拟器验证**）。

用命令行工具生成的工程目前没有往 Asset Catalog 里添加图片的途径：生成的 `ios/` 目录每次都会重建，里面的 Asset Catalog 只有 App 图标。所以图片作为普通文件放在 `assets/` 里。下面的对比适用于手工维护 Xcode 工程的 App：

| | 放进 Asset Catalog | 作为普通文件 |
| --- | --- | --- |
| `imageNamed()` 能找到 | 是 | 是 |
| 自动选 `@2x` / `@3x` | 是 | 是 |
| 深色模式自动换图 | 是 | 否 |
| 按设备裁减安装包、按需下载 | 是 | 否 |
| 能得到文件路径和字节 | 否 | 是 |
| 支持 webp | 否，编译失败 | 是 |

- Asset Catalog 编译后不再有单独的图片文件。需要上传、计算哈希、交给别的 API 的图片不要放进去。
- webp 图片不能放进 Asset Catalog。放进去之后整个 Asset Catalog 都编译不出来。

## 示例

```js
UIImage.imageNamed('logo');              // 能找到 App 包根目录下的 logo.png
UIImage.imageNamed('JS/assets/logo');    // 能找到子目录里的图，名字里写路径
UIImage.imageNamed('logo.png');          // 带扩展名也可以
```

**结果**：三种写法都能取到图。

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  console.log(dot.size.width, dot.size.height, dot.scale);
}
```

**结果**：在 @3x 屏幕的设备上，控制台输出 `10 10 3`。

## 对应的 iOS API

`+[UIImage imageNamed:]`。原生的这个方法遇到动图文件只给第一帧，这里得到的是动图。

## 参见

- [随 App 打包的图片放在哪](../ui-image.md#随-app-打包的图片放在哪)
- [`imageWithContentsOfFile()`](imagewithcontentsoffile.md)：从绝对路径读取
