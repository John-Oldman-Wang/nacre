---
type: reference
native: NSBundle.mainBundle.infoDictionary
---

# `Application`：`info` 属性

**`info`** 属性是 App 的 Info.plist 的全部内容。Info.plist 是每个 iOS App 自带的配置文件，记录包名、版本、支持的方向等。它在构建 App 时生成，App 运行期间不变。

## 值

对象。键是 Info.plist 的键，值的类型声明是 `unknown`，因为每个 App 的 Info.plist 内容不同。

- 只读。整个对象和它里面的每一层对象都是冻结的，写入会抛 `TypeError`。
- 在脚本一开始就能读。
- 运行期间不变，所以没有变化事件。
- 读一个 Info.plist 里没有的键得到 `undefined`，不报错。
- 读嵌套的字段要先判断类型。

它是运行时读到的那一份 Info.plist，不是工程里的源文件：

- 源文件里的变量已经替换成实际的值。
- 构建工具添加的键也在里面，比如 `MinimumOSVersion`。
- 系统还会算出一个 `CFBundleNumericVersion`。
- 不能用 JSON 表示的值（日期、二进制数据）转成字符串。

App 的显示名称没有单独的属性，从 `info.CFBundleDisplayName` 读。它读到什么值**未在模拟器验证**，值来自工程配置。

## 示例

```js
console.log(Object.keys(application.info).length);
console.log(application.info.MinimumOSVersion);
console.log(Object.isFrozen(application.info));
```

**结果**

- 第一行输出键的个数。验收用的 App 是 `26`。
- 第二行输出 App 要求的最低系统版本，是一个字符串。
- 第三行输出 `true`。

```js
const manifest = application.info.UIApplicationSceneManifest;
if (typeof manifest === 'object' && manifest !== null) {
  console.log('有场景配置');
}
```

**结果**：控制台输出 `有场景配置`。

## 对应的 iOS API

`NSBundle.mainBundle.infoDictionary`。

## 参见

- [`bundleIdentifier`](bundleidentifier.md)、[`version`](version.md)、[`build`](build.md)：最常用的三项
- [配置 App](../../guides/project-config.md)：Info.plist 的内容从哪里来
