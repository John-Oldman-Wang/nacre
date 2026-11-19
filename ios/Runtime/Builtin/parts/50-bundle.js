// App 包：NSBundle。包的路径、按名字找资源、Info.plist、App 支持和在用的语言。
// 读项目自己的 assets/，更直接的是 application.fileSystem.assets（19-filesystem.js）。
//
// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    defineNativeClass,
    nativeCall,
    nativeCallObject,
    nativeClassCall,
    nativeClassCallValue,
    nativeClassObject,
    nativeGet,
    nativeOnly,
    requireNative,
    toText,
    toTextOrNull,
  } = ctx;

  // options 对象：null 和 undefined 当空对象；成员是 undefined 当没带
  function optionsOf(options) { return options == null ? {} : options; }

  // 字符串数组参数。只认数组，里面每一项照字符串转换
  function stringList(value, what) {
    if (!Array.isArray(value)) throw new TypeError(what + ' needs an array of strings');
    return value.map((item) => toText(item));
  }

  defineNativeClass('NSBundle', class NSBundle extends NSObject {
    // 不能 new：App 的包从 mainBundle 拿，别的包用 bundleWithPath
    constructor() { nativeOnly(new.target); }

    static get mainBundle() { return nativeClassObject('NSBundle', 'mainBundle'); }
    static bundleWithPath(path) {
      return nativeClassCall('NSBundle', 'bundleWithPath:', [toText(path)]);
    }
    static bundleWithIdentifier(identifier) {
      return nativeClassCall('NSBundle', 'bundleWithIdentifier:', [toText(identifier)]);
    }
    static preferredLocalizationsFromArray(localizationsArray, options) {
      const list = stringList(localizationsArray, 'preferredLocalizationsFromArray');
      const o = optionsOf(options);
      if (o.forPreferences === undefined) {
        return nativeClassCallValue('NSBundle', 'preferredLocalizationsFromArray:', [list]);
      }
      const prefs = o.forPreferences === null ? null : stringList(o.forPreferences, 'forPreferences');
      return nativeClassCallValue('NSBundle', 'preferredLocalizationsFromArray:forPreferences:', [list, prefs]);
    }

    get bundlePath() { requireNative(this, 'bundlePath'); return nativeGet(this, 'bundlePath'); }
    get resourcePath() { requireNative(this, 'resourcePath'); return nativeGet(this, 'resourcePath'); }
    get bundleIdentifier() { requireNative(this, 'bundleIdentifier'); return nativeGet(this, 'bundleIdentifier'); }
    get infoDictionary() { requireNative(this, 'infoDictionary'); return nativeGet(this, 'infoDictionary'); }
    get localizedInfoDictionary() {
      requireNative(this, 'localizedInfoDictionary');
      return nativeGet(this, 'localizedInfoDictionary');
    }
    get localizations() { requireNative(this, 'localizations'); return nativeGet(this, 'localizations'); }
    get preferredLocalizations() {
      requireNative(this, 'preferredLocalizations');
      return nativeGet(this, 'preferredLocalizations');
    }
    get developmentLocalization() {
      requireNative(this, 'developmentLocalization');
      return nativeGet(this, 'developmentLocalization');
    }

    objectForInfoDictionaryKey(key) {
      return nativeCall(this, 'objectForInfoDictionaryKey:', [toText(key)]);
    }

    // 按带了哪几个选项挑 selector：带 forLocalization 用四段的，带 inDirectory 用三段的
    pathForResource(name, options) {
      const o = optionsOf(options);
      const args = [toTextOrNull(name), toTextOrNull(o.ofType)];
      if (o.forLocalization !== undefined) {
        return nativeCall(this, 'pathForResource:ofType:inDirectory:forLocalization:',
                          [...args, toTextOrNull(o.inDirectory), toTextOrNull(o.forLocalization)]);
      }
      if (o.inDirectory !== undefined) {
        return nativeCall(this, 'pathForResource:ofType:inDirectory:', [...args, toTextOrNull(o.inDirectory)]);
      }
      return nativeCall(this, 'pathForResource:ofType:', args);
    }
    pathsForResourcesOfType(ext, options) {
      const o = optionsOf(options);
      const args = [toTextOrNull(ext), toTextOrNull(o.inDirectory)];
      if (o.forLocalization !== undefined) {
        return nativeCall(this, 'pathsForResourcesOfType:inDirectory:forLocalization:',
                          [...args, toTextOrNull(o.forLocalization)]);
      }
      return nativeCall(this, 'pathsForResourcesOfType:inDirectory:', args);
    }

    localizedStringForKey(key, options) {
      const o = optionsOf(options);
      const args = [toText(key), toTextOrNull(o.value), toTextOrNull(o.table)];
      if (o.localizations !== undefined) {
        return nativeCall(this, 'localizedStringForKey:value:table:localizations:',
                          [...args, stringList(o.localizations, 'localizations')]);
      }
      return nativeCall(this, 'localizedStringForKey:value:table:', args);
    }
    localizedAttributedStringForKey(key, options) {
      const o = optionsOf(options);
      return nativeCallObject(this, 'localizedAttributedStringForKey:value:table:',
                              [toText(key), toTextOrNull(o.value), toTextOrNull(o.table)]);
    }
  });
})
