// App 包里的文件：application.fileSystem.assets（项目的 assets/ 在包里的位置）、
// NSBundle（包的路径、按名字找资源、Info.plist、本地化），以及
// UIFont.familyNames / fontNamesForFamilyName（包里和系统里有哪些字体）。
//
// 读的文件是验收项目自己 assets/ 里的：web/data.json、dot.png（77 字节）。

import { assert } from '../support.js';

/**
 * 做一件该抛异常的事，把实际发生的写成一句话
 * @param {() => void} fn
 * @returns {string}
 */
function thrown(fn) {
  try {
    fn();
    return '没抛';
  } catch (err) {
    return err instanceof Error ? err.name + ': ' + err.message : String(err);
  }
}

/** @param {unknown} v */
const isStringArray = (v) => Array.isArray(v) && v.every((s) => typeof s === 'string');

export function stepBundle() {
  console.log('--- App 包里的文件 ---');
  const fs = application.fileSystem;
  const main = NSBundle.mainBundle;

  // ---- application.fileSystem.assets ----
  assert('assets 是绝对路径', typeof fs.assets === 'string' && fs.assets.startsWith('/'), true);
  assert('assets 末尾不带斜杠', fs.assets.endsWith('/'), false);
  assert('assets 是包里的 JS/assets', fs.assets, main.bundlePath + '/JS/assets');
  assert('assets 只读：写了抛 TypeError',
         thrown(() => { /** @type {any} */ (fs).assets = '/tmp'; }).startsWith('TypeError'), true);

  (async () => {
    const data = JSON.parse(await fs.readText(fs.assets + '/web/data.json'));
    assert('readText 读得到 assets 里的文件', data.ok, 'yes');
    const names = await fs.readDirectory(fs.assets);
    assert('readDirectory 列得出 assets 里的文件和目录', names.includes('dot.png') && names.includes('web'), true);
    assert('stat 读得到 assets 里文件的大小', (await fs.stat(fs.assets + '/dot.png')).size, 77);
    assert('readBytes 读得到 assets 里的文件', (await fs.readBytes(fs.assets + '/dot.png')).byteLength, 77);
    assert('assets 里没有的文件：exists 是 false', await fs.exists(fs.assets + '/no-such-file'), false);
    // App 包是只读的：真机上往里写会被拒绝。模拟器上拦不拦，量出来记下
    const probe = fs.assets + '/nacre-write-probe.txt';
    try {
      await fs.writeText(probe, 'x');
      await fs.remove(probe).catch(() => {});
      console.log('  ! 往 App 包里写：模拟器上写得进去（真机上会被拒绝），未验证');
    } catch (err) {
      assert('往 App 包里写被拒绝', err instanceof Error, true);
    }
  })().catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.log('  ✗ 读 App 包里的文件 这一组中断了 = ' + message + '（期望跑完）');
  });

  // ---- NSBundle ----
  assert('mainBundle 是 NSBundle', main instanceof NSBundle, true);
  assert('mainBundle 读两次是同一个对象', NSBundle.mainBundle === main, true);
  assert('bundlePath 是 .app 目录', main.bundlePath.startsWith('/') && main.bundlePath.endsWith('.app'), true);
  assert('resourcePath 和 bundlePath 一样', main.resourcePath, main.bundlePath);
  assert('bundleIdentifier 和 application 的一样', main.bundleIdentifier, application.bundleIdentifier);
  const info = main.infoDictionary;
  assert('infoDictionary 里有包名', info !== null && info.CFBundleIdentifier === main.bundleIdentifier, true);
  assert('objectForInfoDictionaryKey 读得到包名', main.objectForInfoDictionaryKey('CFBundleIdentifier'), main.bundleIdentifier);
  assert('objectForInfoDictionaryKey 没有的键是 null', main.objectForInfoDictionaryKey('NacreNoSuchKey'), null);
  const localizedInfo = main.localizedInfoDictionary;
  assert('localizedInfoDictionary 是对象或 null',
         localizedInfo === null || typeof localizedInfo === 'object', true);

  assert('localizations 是字符串数组', isStringArray(main.localizations), true);
  assert('preferredLocalizations 是字符串数组，至少一个',
         isStringArray(main.preferredLocalizations) && main.preferredLocalizations.length >= 1, true);
  const dev = main.developmentLocalization;
  assert('developmentLocalization 是字符串或 null', dev === null || typeof dev === 'string', true);
  console.log('  这个包：localizations ' + JSON.stringify(main.localizations) +
              '，preferredLocalizations ' + JSON.stringify(main.preferredLocalizations) +
              '，developmentLocalization ' + dev);

  // 找资源。name 和 ofType 都可以是 null；inDirectory 相对包的根
  const dataPath = fs.assets + '/web/data.json';
  assert('pathForResource 按名字和类型找',
         main.pathForResource('data', { ofType: 'json', inDirectory: 'JS/assets/web' }), dataPath);
  assert('pathForResource 名字带扩展名、不给类型',
         main.pathForResource('data.json', { inDirectory: 'JS/assets/web' }), dataPath);
  assert('pathForResource 找 main.js',
         String(main.pathForResource('main', { ofType: 'js', inDirectory: 'JS' })).endsWith('/JS/main.js'), true);
  assert('pathForResource 找不到是 null', main.pathForResource('no-such-file', { ofType: 'json' }), null);
  assert('pathForResource 带 forLocalization 不抛',
         thrown(() => main.pathForResource('data', { ofType: 'json', inDirectory: 'JS/assets/web', forLocalization: 'en' })),
         '没抛');
  const pngs = main.pathsForResourcesOfType('png', { inDirectory: 'JS/assets' });
  assert('pathsForResourcesOfType 是字符串数组', isStringArray(pngs), true);
  assert('pathsForResourcesOfType 里有 dot.png', pngs.includes(fs.assets + '/dot.png'), true);
  assert('pathsForResourcesOfType 带 forLocalization 是数组',
         Array.isArray(main.pathsForResourcesOfType('png', { inDirectory: 'JS/assets', forLocalization: 'en' })), true);

  // 本地化的字符串。没有这个键：给了 value 用 value，没给用键本身
  assert('localizedStringForKey 没有的键给 value',
         main.localizedStringForKey('nacre.missing', { value: 'fallback' }), 'fallback');
  assert('localizedStringForKey 没有的键、不给 value 给键本身',
         main.localizedStringForKey('nacre.missing'), 'nacre.missing');
  assert('localizedStringForKey 带 table 和 localizations',
         main.localizedStringForKey('nacre.missing', { value: 'fb', table: 'Nope', localizations: ['en'] }), 'fb');
  const attributed = main.localizedAttributedStringForKey('nacre.missing', { value: 'plain' });
  assert('localizedAttributedStringForKey 给富文本', attributed instanceof NSAttributedString, true);
  assert('localizedAttributedStringForKey 的文字', attributed.string, 'plain');

  // 别的包
  const again = NSBundle.bundleWithPath(main.bundlePath);
  assert('bundleWithPath 拿到同一个包', again !== null && again.bundleIdentifier === main.bundleIdentifier, true);
  assert('bundleWithPath 不存在的路径是 null', NSBundle.bundleWithPath('/no/such/bundle'), null);
  const byId = NSBundle.bundleWithIdentifier(String(main.bundleIdentifier));
  assert('bundleWithIdentifier 拿到 App 的包', byId !== null && byId.bundlePath === main.bundlePath, true);
  assert('bundleWithIdentifier 不认识的是 null', NSBundle.bundleWithIdentifier('com.example.no-such'), null);

  // 从一组语言里挑：forPreferences 不给时按用户的设置挑
  const picked = NSBundle.preferredLocalizationsFromArray(['en', 'zh-Hans']);
  assert('preferredLocalizationsFromArray 是字符串数组，至少一个', isStringArray(picked) && picked.length >= 1, true);
  assert('preferredLocalizationsFromArray 按给的偏好挑',
         NSBundle.preferredLocalizationsFromArray(['en', 'zh-Hans'], { forPreferences: ['zh-Hans-CN'] })[0], 'zh-Hans');

  // 写错和不支持的
  assert('bundlePath 只读：写了抛 TypeError',
         thrown(() => { /** @type {any} */ (main).bundlePath = '/x'; }).startsWith('TypeError'), true);
  assert('new NSBundle() 抛 TypeError', thrown(() => new (/** @type {any} */ (NSBundle))()).startsWith('TypeError'), true);
  assert('preferredLocalizationsFromArray 不给数组抛 TypeError',
         thrown(() => NSBundle.preferredLocalizationsFromArray(/** @type {any} */ ('en'))).startsWith('TypeError'), true);
  // 加载代码那一组、URL 那一组没有
  assert('没有 load', 'load' in main, false);
  assert('没有 executablePath', 'executablePath' in main, false);
  assert('没有 URLForResource', 'URLForResource' in main, false);
  assert('没有 allBundles', 'allBundles' in NSBundle, false);

  // ---- 字体的名字 ----
  const families = UIFont.familyNames;
  assert('familyNames 是字符串数组', isStringArray(families), true);
  assert('familyNames 里有 Helvetica Neue', families.includes('Helvetica Neue'), true);
  const faces = UIFont.fontNamesForFamilyName('Helvetica Neue');
  assert('fontNamesForFamilyName 里有 HelveticaNeue', faces.includes('HelveticaNeue'), true);
  assert('fontNamesForFamilyName 给的名字能建字体', UIFont.fontWithName(faces[0], { size: 17 }) !== null, true);
  assert('fontNamesForFamilyName 不认识的家族是空数组', UIFont.fontNamesForFamilyName('No Such Family').length, 0);
  assert('familyNames 只读：写了抛 TypeError',
         thrown(() => { /** @type {any} */ (UIFont).familyNames = []; }).startsWith('TypeError'), true);
  console.log('  字体：' + families.length + ' 个家族');
}
