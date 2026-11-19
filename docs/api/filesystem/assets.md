---
type: reference
native: "-[NacreRuntime startWithScriptsDirectory:] + /assets"
---

# `FileSystem`：`assets` 属性

**`assets`** 属性是项目的 `assets/` 目录在 App 包里的绝对路径。项目里的 `assets/config/rates.json`，在 App 里是 `fs.assets + '/config/rates.json'`。

## 值

字符串。以 `/` 开头，末尾不带 `/`。

- 只读。给它赋值抛 `TypeError`。
- 在 App 运行期间不变，所以没有变化通知。
- 项目没有 `assets/` 目录时，路径照样给出，目录不存在，读里面的文件得到被拒绝的 Promise。**未在模拟器验证。**

目录里的文件是构建时从项目的 `assets/` 拷进 App 包的，和项目里的目录结构相同。用 [`readText()`](readtext.md)、[`readBytes()`](readbytes.md)、[`readDirectory()`](readdirectory.md)、[`stat()`](stat.md)、[`exists()`](exists.md) 读。

App 包是只读的。按 Apple 的说明，真机上往包里写会被拒绝：包在安装时签了名，改了它 App 就启动不了。**真机上未验证。** 模拟器上写得进去（实测），不要依赖这一点。要改的数据，先复制到 [`applicationSupport`](applicationsupport.md) 再改。

## 示例

```js
const fs = application.fileSystem;
(async () => {
  const data = JSON.parse(await fs.readText(fs.assets + '/web/data.json'));
  console.log(data.ok);
})();
```

**结果**：项目里有 `assets/web/data.json`、内容是 `{"ok": "yes"}` 时，输出 `yes`。

## 对应的 iOS API

App 包里 `JS/assets/` 目录的路径：`[NSBundle.mainBundle.bundlePath stringByAppendingPathComponent:@"JS/assets"]`。

## 参见

- [读写文件](../../guides/files.md)
- [`NSBundle`](../ns-bundle.md)：按名字找包里的资源，读包里 `assets/` 以外的东西
