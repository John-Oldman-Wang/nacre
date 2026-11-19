// NSLocale：系统的首选语言、地区，以及一个地区的格式（货币、小数点、引号……）。
// 地区变了的通知是 application 上的 localechange。
//
// 用户自己的设置每台设备不一样，只断言类型和关系；写死的值都来自
// new NSLocale('de_DE') 这类指定了地区的对象，换一台设备也成立。

// 一组断言中途抛了只废这一组，不连累后面的
/**
 * @param {string} name
 * @param {() => void} fn
 */
function group(name, fn) {
  try {
    fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log('  ✗ ' + name + ' 这一组中断了 = ' + message + '（期望跑完）');
  }
}

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

/** @param {import("../main.js").StepContext} ctx */
export function stepLocale(ctx) {
  const { assert } = ctx;
  console.log('--- NSLocale ---');

  group('用户的设置', () => {
    const languages = NSLocale.preferredLanguages;
    assert('preferredLanguages 是字符串数组', isStringArray(languages), true);
    assert('preferredLanguages 至少有一个', languages.length >= 1, true);
    // Intl 不传地区时用的就是首选语言里的第一个（写法收短过），语言那一段相同
    assert('preferredLanguages[0] 的语言和 Intl 的默认地区一样',
           languages[0].split('-')[0],
           new Intl.NumberFormat().resolvedOptions().locale.split('-')[0]);

    const current = NSLocale.currentLocale;
    assert('currentLocale 是 NSLocale', current instanceof NSLocale, true);
    assert('currentLocale 的 localeIdentifier 不是空串', current.localeIdentifier.length > 0, true);
    assert('currentLocale 的 languageCode 是字符串', typeof current.languageCode, 'string');
    assert('currentLocale 的 decimalSeparator 是字符串', typeof current.decimalSeparator, 'string');

    const auto = NSLocale.autoupdatingCurrentLocale;
    assert('autoupdatingCurrentLocale 是 NSLocale', auto instanceof NSLocale, true);
    assert('autoupdatingCurrentLocale 和 currentLocale 是同一个地区',
           auto.localeIdentifier, current.localeIdentifier);
    assert('systemLocale 是 NSLocale', NSLocale.systemLocale instanceof NSLocale, true);
    console.log('  这台设备：preferredLanguages ' + JSON.stringify(languages) +
                '，currentLocale ' + current.localeIdentifier +
                '，regionCode ' + current.regionCode + '，currencyCode ' + current.currencyCode +
                '，languageIdentifier ' + current.languageIdentifier +
                '，decimalSeparator ' + current.decimalSeparator + '，usesMetricSystem ' + current.usesMetricSystem +
                '，systemLocale "' + NSLocale.systemLocale.localeIdentifier + '"');
  });

  group('一个地区的各项', () => {
    const de = new NSLocale('de_DE');
    assert('new NSLocale 得到 NSLocale', de instanceof NSLocale, true);
    assert('de_DE 的 localeIdentifier', de.localeIdentifier, 'de_DE');
    assert('de_DE 的 languageCode', de.languageCode, 'de');
    assert('de_DE 的 languageIdentifier 是字符串', typeof de.languageIdentifier, 'string');
    assert('de_DE 的 regionCode', de.regionCode, 'DE');
    assert('de_DE 的 scriptCode 是 null', de.scriptCode, null);
    assert('de_DE 的 variantCode 是 null', de.variantCode, null);
    assert('de_DE 的 calendarIdentifier', de.calendarIdentifier, 'gregorian');
    // 标识里没指定排序规则时，实测给 'standard'（Apple 的文档没说）
    assert('de_DE 的 collationIdentifier', de.collationIdentifier, 'standard');
    assert('de_DE 的 collatorIdentifier 是字符串', typeof de.collatorIdentifier, 'string');
    assert('de_DE 用公制', de.usesMetricSystem, true);
    assert('de_DE 的小数点是逗号', de.decimalSeparator, ',');
    assert('de_DE 的千分位是点', de.groupingSeparator, '.');
    assert('de_DE 的货币', de.currencyCode, 'EUR');
    assert('de_DE 的货币符号', de.currencySymbol, '€');
    assert('de_DE 的引号', de.quotationBeginDelimiter + de.quotationEndDelimiter, '„“');
    assert('de_DE 的单引号', de.alternateQuotationBeginDelimiter + de.alternateQuotationEndDelimiter, '‚‘');
    console.log('  de_DE：languageIdentifier ' + de.languageIdentifier + '，collatorIdentifier ' + de.collatorIdentifier);

    const us = new NSLocale('en_US');
    assert('en_US 不用公制', us.usesMetricSystem, false);
    assert('en_US 的货币', us.currencyCode, 'USD');
    assert('en_US 的货币符号', us.currencySymbol, '$');
    assert('en_US 的小数点', us.decimalSeparator, '.');

    const zh = new NSLocale('zh_Hans_CN');
    assert('zh_Hans_CN 的 languageCode', zh.languageCode, 'zh');
    // 用下划线写时，这个语言和地区默认的文字会被去掉，标识跟着变（实测，Apple 的文档没说）：
    // 中国默认简体、台湾默认繁体。不是默认的文字留着；用短横线写也留着
    assert('zh_Hans_CN 的 scriptCode 是 null', zh.scriptCode, null);
    assert('zh_Hans_CN 的 localeIdentifier 去掉了文字', zh.localeIdentifier, 'zh_CN');
    assert('zh_Hant_TW 的 scriptCode 是 null', new NSLocale('zh_Hant_TW').scriptCode, null);
    assert('zh_Hant_CN 的 scriptCode', new NSLocale('zh_Hant_CN').scriptCode, 'Hant');
    assert('zh-Hant-TW（短横线）的 scriptCode', new NSLocale('zh-Hant-TW').scriptCode, 'Hant');
    // preferredLanguages 给的就是短横线的写法，文字留着：选界面语言时靠它分简繁
    assert('zh-Hans-CN（短横线）的 scriptCode', new NSLocale('zh-Hans-CN').scriptCode, 'Hans');
    assert('zh_Hans_CN 的 regionCode', zh.regionCode, 'CN');
    assert('zh_Hans_CN 的货币', zh.currencyCode, 'CNY');

    assert('只有语言没有地区：regionCode 是 null', new NSLocale('fr').regionCode, null);
    assert('en_US_POSIX 的 variantCode', new NSLocale('en_US_POSIX').variantCode, 'POSIX');
    assert('@calendar=japanese 的 calendarIdentifier',
           new NSLocale('ja_JP@calendar=japanese').calendarIdentifier, 'japanese');
    assert('@collation=phonebook 的 collationIdentifier',
           new NSLocale('de_DE@collation=phonebook').collationIdentifier, 'phonebook');
    assert('localeWithLocaleIdentifier 和 new 一样',
           NSLocale.localeWithLocaleIdentifier('fr_FR').languageCode, 'fr');
  });

  group('把代码翻译成名字', () => {
    const en = new NSLocale('en_US');
    assert('localizedStringForLocaleIdentifier', en.localizedStringForLocaleIdentifier('fr_FR'), 'French (France)');
    assert('localizedStringForLanguageCode', en.localizedStringForLanguageCode('de'), 'German');
    assert('localizedStringForCountryCode', en.localizedStringForCountryCode('JP'), 'Japan');
    // 后两条是 Apple 文档里的例子
    assert('localizedStringForScriptCode', en.localizedStringForScriptCode('Hans'), 'Simplified Han');
    assert('localizedStringForScriptCode 繁体', en.localizedStringForScriptCode('Hant'), 'Traditional Han');
    assert('localizedStringForVariantCode 是字符串或 null',
           ['string', 'object'].includes(typeof en.localizedStringForVariantCode('POSIX')), true);
    assert('localizedStringForCalendarIdentifier', en.localizedStringForCalendarIdentifier('gregorian'), 'Gregorian Calendar');
    assert('localizedStringForCollationIdentifier', en.localizedStringForCollationIdentifier('phonebook'), 'Phonebook Sort Order');
    assert('localizedStringForCurrencyCode', en.localizedStringForCurrencyCode('EUR'), 'Euro');
    assert('localizedStringForCollatorIdentifier 是字符串或 null',
           ['string', 'object'].includes(typeof en.localizedStringForCollatorIdentifier('de')), true);
    assert('用中文的名字', new NSLocale('zh_Hans_CN').localizedStringForLanguageCode('en'), '英语');
    // 参数照字符串转换：数字转成字符串
    assert('参数不是字符串时转成字符串', typeof en.localizedStringForCountryCode(/** @type {any} */ (840)),
           typeof en.localizedStringForCountryCode('840'));
  });

  group('列表和换算', () => {
    assert('availableLocaleIdentifiers 里有 de_DE', NSLocale.availableLocaleIdentifiers.includes('de_DE'), true);
    assert('ISOLanguageCodes 里有 en', NSLocale.ISOLanguageCodes.includes('en'), true);
    assert('ISOCountryCodes 里有 CN', NSLocale.ISOCountryCodes.includes('CN'), true);
    assert('ISOCurrencyCodes 里有 CNY', NSLocale.ISOCurrencyCodes.includes('CNY'), true);
    assert('commonISOCurrencyCodes 里有 USD', NSLocale.commonISOCurrencyCodes.includes('USD'), true);
    // 地区标识的规范写法用哪种分隔符 Apple 的文档没说，以实测为准
    assert('canonicalLocaleIdentifierFromString', NSLocale.canonicalLocaleIdentifierFromString('en-US'), 'en-US');
    console.log('  canonicalLocaleIdentifierFromString：en_us → ' + NSLocale.canonicalLocaleIdentifierFromString('en_us') +
                '，zh-hans-cn → ' + NSLocale.canonicalLocaleIdentifierFromString('zh-hans-cn'));
    assert('canonicalLanguageIdentifierFromString', NSLocale.canonicalLanguageIdentifierFromString('en_US'), 'en-US');
    assert('阿拉伯文从右往左', NSLocale.characterDirectionForLanguage('ar'), 'rightToLeft');
    assert('英文从左往右', NSLocale.characterDirectionForLanguage('en'), 'leftToRight');
    assert('英文的行从上往下', NSLocale.lineDirectionForLanguage('en'), 'topToBottom');
  });

  group('写错和不支持的', () => {
    const de = new NSLocale('de_DE');
    assert('属性只读：写 regionCode 抛 TypeError',
           thrown(() => { /** @type {any} */ (de).regionCode = 'US'; }).startsWith('TypeError'), true);
    assert('写了之后没变', de.regionCode, 'DE');
    assert('preferredLanguages 只读：写了抛 TypeError',
           thrown(() => { /** @type {any} */ (NSLocale).preferredLanguages = []; }).startsWith('TypeError'), true);
    // 字符串参数不可空：undefined 和 null 当空串
    assert('new NSLocale() 不抛', thrown(() => new (/** @type {any} */ (NSLocale))()), '没抛');
    assert('new NSLocale() 的 localeIdentifier 是空串', new (/** @type {any} */ (NSLocale))().localeIdentifier, '');
    assert('不能继承',
           thrown(() => { class MyLocale extends NSLocale {} new MyLocale('en_US'); }).startsWith('TypeError'), true);
    // countryCode 和 regionCode 是同一个值，Apple 打算废弃它，没接
    assert('没有 countryCode', 'countryCode' in de, false);
    // 拆成各段、拼回去：用 new NSLocale(id) 的各项属性和 canonicalLocaleIdentifierFromString 代替
    assert('没有 componentsFromLocaleIdentifier', 'componentsFromLocaleIdentifier' in NSLocale, false);
    assert('没有 windowsLocaleCodeFromLocaleIdentifier', 'windowsLocaleCodeFromLocaleIdentifier' in NSLocale, false);
  });

  group('地区变了的通知', () => {
    const noop = () => {};
    assert('application 上能监听 localechange',
           thrown(() => application.addEventListener('localechange', noop)), '没抛');
    assert('能取消监听 localechange',
           thrown(() => application.removeEventListener('localechange', noop)), '没抛');
  });
}
