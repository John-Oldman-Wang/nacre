// Intl 的原生那一半：按一组解析好的选项，把一个数格式化成字符串。
//
// 这是运行时里唯一的 Swift 文件，原因只有一个：能和网页里的 Intl 逐条相同
// 的系统接口是 Foundation 的 FormatStyle，而它只有 Swift 能调。实测
// NSNumberFormatter 对不上（∞、NaN、百分比舍入、长小数都有差别，紧凑写法和
// 正负号显示做不了），系统的 ICU 库不是公开接口。见 docs/internals/intl.md。
//
// 这里只做「格式化」这一件事。选项怎么读、默认值、报什么错，都是标准规定
// 的，在 Builtin/parts/26-intl.js 里；到这里的选项已经是解析好、校验过的。
//
// 类是内部可见的，用 @objc 的名字交给桥（NacreIntl.mm 里手写了一份声明）。
// 它不进 framework 的公开面。
import Foundation

@objc(NacreIntlNumberFormat)
final class NacreIntlNumberFormat: NSObject {
  // 同一组选项只建一次。JS 在主线程，这里不加锁
  private static var formatters: [NacreNumberStyle] = []
  private static var ids: [String: Int] = [:]

  /// 按一组解析好的选项建一个格式化器，返回编号。这组选项做不了返回 -1
  @objc static func create(_ key: String, options: [String: Any]) -> Int {
    if let id = ids[key] { return id }
    guard let made = NacreNumberStyle(options) else { return -1 }
    formatters.append(made)
    ids[key] = formatters.count - 1
    return formatters.count - 1
  }

  /// value 是 "d:<数>"（双精度数）或 "n:<十进制数字串>"（精确的十进制数）。
  /// 做不了返回 nil
  @objc static func format(_ id: Int, value: String) -> String? {
    guard id >= 0, id < formatters.count else { return nil }
    return formatters[id].format(value)
  }

  /// 这种货币默认留几位小数（日元 0，美元 2，科威特第纳尔 3）。不认识的按 2
  @objc static func currencyDigits(_ code: String) -> Int {
    let formatter = NumberFormatter()
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.numberStyle = .currency
    formatter.currencyCode = code
    return formatter.maximumFractionDigits
  }

  // ---- 地区 ----

  /// 默认地区：系统的首选语言（「设置」里排第一的那个），原样跟着它走，
  /// 只把写法收短——文字那一段是这个语言和地区本来就隐含的，就去掉
  /// （zh-Hans-CN → zh-CN，sr-Latn-RS 不动，en → en）。
  ///
  /// 这一条**有意不照网页**。网页为了防指纹，会先把系统语言压成少数几种
  /// （zh-Hans-HK → zh-CN，de-AT → de-DE，en-IE → en-GB），压缩用的是系统的
  /// 私有接口。App 里的 JS 是开发者自己的代码，不需要防指纹；用户选了哪个
  /// 地区，就该按哪个地区的习惯写。实测的对照表见 docs/internals/intl.md
  @objc static func defaultLocale() -> String {
    let preferred = Locale.preferredLanguages.first ?? "en-US"
    let language = Locale.Language(identifier: preferred)
    guard let code = language.languageCode?.identifier else { return "en-US" }
    guard let region = language.region?.identifier else {
      // 只有语言、没有地区。Locale.Language 会把隐含的文字补出来（en 的 script
      // 是 Latn），原来直接拼上去，于是 en 成了 en-Latn。只有和隐含的不一样时
      // 才留着（zh-Hant 留，zh-Hans 收成 zh）
      guard let script = language.script?.identifier else { return code }
      let implied = Locale.Language(identifier: code).maximalIdentifier
      return implied == language.maximalIdentifier ? code : "\(code)-\(script)"
    }
    let short = "\(code)-\(region)"
    guard let script = language.script?.identifier else { return short }
    let implied = Locale.Language(identifier: short).maximalIdentifier
    return implied == language.maximalIdentifier ? short : "\(code)-\(script)-\(region)"
  }

  /// 系统有数据的地区，BCP 47 的写法。带文字的另外补一个不带文字的别名
  /// （zh-Hans-CN 之外还有 zh-CN）——网页里的 Intl 也是这么认的
  @objc static func availableLocales() -> [String] {
    var out = Set<String>()
    for identifier in Locale.availableIdentifiers {
      let parts = identifier.split(separator: "_").map(String.init)
      // 带 @ 关键字的和 POSIX 那种变体不要
      if identifier.contains("@") || parts.contains("POSIX") { continue }
      out.insert(parts.joined(separator: "-"))
      if parts.count == 3, parts[1].count == 4 { out.insert("\(parts[0])-\(parts[2])") }
    }
    return Array(out)
  }

  @objc static func numberingSystems() -> [String] {
    return Locale.NumberingSystem.availableNumberingSystems.map { $0.identifier }
  }

  /// 这个地区默认用哪套数字（en-US 是 latn，ar-EG 是 arab）
  @objc static func numberingSystem(_ locale: String) -> String {
    return Locale(identifier: locale).numberingSystem.identifier
  }
}

// 正负号怎么显示。negative 不在这里：它是在 auto 的基础上换一个值来格式化
private enum SignMode { case auto, always, exceptZero, never }

// 一个建好的格式化器。
//
// FormatStyle 按值的类型分成两套（双精度数、精确的十进制数），写法一样但
// 没有共同的协议，所以每种样式各写两遍。每一遍给出两个闭包：直接出字符串
// 的（平时用，约 1 微秒），和带分段的（只有要在结果上动手脚时才用，慢得多）
private final class NacreNumberStyle {
  private typealias Plain<V> = (V, SignMode) -> String
  private typealias Parts<V> = (V, SignMode) -> AttributedString

  private let doublePlain: Plain<Double>
  private let doubleParts: Parts<Double>
  private let decimalPlain: Plain<Decimal>?
  private let decimalParts: Parts<Decimal>?
  private let locale: Locale
  private let signMode: SignMode
  private let negativeOnly: Bool
  private let grouping: String   // auto / always / min2 / never

  init?(_ o: [String: Any]) {
    guard let tag = o["locale"] as? String, let style = o["style"] as? String else { return nil }
    let numbers = o["numbers"] as? String
    let locale = Locale(identifier: numbers == nil ? tag : "\(tag)@numbers=\(numbers!)")
    self.locale = locale

    let rule: FloatingPointRoundingRule
    switch o["roundingMode"] as? String {
    case "halfExpand": rule = .toNearestOrAwayFromZero
    case "halfEven": rule = .toNearestOrEven
    case "trunc": rule = .towardZero
    case "expand": rule = .awayFromZero
    case "ceil": rule = .up
    case "floor": rule = .down
    default: return nil
    }

    // 精度。default 是紧凑写法的默认（两位有效数字），让系统自己定
    let minInteger = o["minimumIntegerDigits"] as? Int ?? 1
    var precision: NumberFormatStyleConfiguration.Precision?
    var maxFraction = 0
    switch o["precision"] as? String {
    case "fraction":
      guard let low = o["minimumFractionDigits"] as? Int, let high = o["maximumFractionDigits"] as? Int,
            low <= high else { return nil }
      maxFraction = high
      precision = .integerAndFractionLength(integerLimits: minInteger..., fractionLimits: low...high)
    case "significant":
      guard let low = o["minimumSignificantDigits"] as? Int,
            let high = o["maximumSignificantDigits"] as? Int, low <= high, minInteger == 1 else { return nil }
      precision = .significantDigits(low...high)
    case "default":
      precision = nil
    default:
      return nil
    }

    // 舍入增量是「最后一位小数上的几」：两位小数、增量 5 就是 0.05
    let step = o["roundingIncrement"] as? Int ?? 1
    let doubleIncrement: Double? = step == 1 ? nil : Double(step) / pow(10, Double(maxFraction))
    // 十进制那一套的增量只能是整数，所以只有不留小数时才用得上
    let decimalIncrement: Int? = step == 1 ? nil : step
    let decimalUsable = step == 1 || maxFraction == 0

    let useGrouping = o["useGrouping"]
    self.grouping = (useGrouping as? Bool) == false ? "never" : (useGrouping as? String ?? "auto")
    let group: NumberFormatStyleConfiguration.Grouping = self.grouping == "never" ? .never : .automatic

    var mode = SignMode.auto
    var negativeOnly = false
    switch o["signDisplay"] as? String {
    case "auto": mode = .auto
    case "always": mode = .always
    case "exceptZero": mode = .exceptZero
    case "never": mode = .never
    case "negative": negativeOnly = true
    default: return nil
    }
    self.signMode = mode
    self.negativeOnly = negativeOnly

    let notation: NumberFormatStyleConfiguration.Notation
    switch o["notation"] as? String {
    case "standard": notation = .automatic
    case "compact": notation = .compactName
    case "scientific": notation = .scientific
    default: return nil
    }

    func plain(_ mode: SignMode) -> NumberFormatStyleConfiguration.SignDisplayStrategy {
      switch mode {
      case .auto: return .automatic
      case .always: return .always(includingZero: true)
      case .exceptZero: return .always(includingZero: false)
      case .never: return .never
      }
    }

    switch style {
    case "decimal":
      func forDouble(_ mode: SignMode) -> FloatingPointFormatStyle<Double> {
        let s = FloatingPointFormatStyle<Double>.number.locale(locale).grouping(group)
          .notation(notation).sign(strategy: plain(mode)).rounded(rule: rule, increment: doubleIncrement)
        return precision.map { s.precision($0) } ?? s
      }
      func forDecimal(_ mode: SignMode) -> Decimal.FormatStyle {
        let s = Decimal.FormatStyle.number.locale(locale).grouping(group)
          .notation(notation).sign(strategy: plain(mode)).rounded(rule: rule, increment: decimalIncrement)
        return precision.map { s.precision($0) } ?? s
      }
      doublePlain = { forDouble($1).format($0) }
      doubleParts = { forDouble($1).attributed.format($0) }
      decimalPlain = decimalUsable ? { forDecimal($1).format($0) } : nil
      decimalParts = decimalUsable ? { forDecimal($1).attributed.format($0) } : nil
    case "percent":
      func forDouble(_ mode: SignMode) -> FloatingPointFormatStyle<Double>.Percent {
        let s = FloatingPointFormatStyle<Double>.Percent().locale(locale).grouping(group)
          .notation(notation).sign(strategy: plain(mode)).rounded(rule: rule, increment: doubleIncrement)
        return precision.map { s.precision($0) } ?? s
      }
      func forDecimal(_ mode: SignMode) -> Decimal.FormatStyle.Percent {
        let s = Decimal.FormatStyle.Percent().locale(locale).grouping(group)
          .notation(notation).sign(strategy: plain(mode)).rounded(rule: rule, increment: decimalIncrement)
        return precision.map { s.precision($0) } ?? s
      }
      doublePlain = { forDouble($1).format($0) }
      doubleParts = { forDouble($1).attributed.format($0) }
      decimalPlain = decimalUsable ? { forDecimal($1).format($0) } : nil
      decimalParts = decimalUsable ? { forDecimal($1).attributed.format($0) } : nil
    case "currency":
      guard let code = o["currency"] as? String else { return nil }
      let presentation: CurrencyFormatStyleConfiguration.Presentation
      switch o["currencyDisplay"] as? String {
      case "symbol": presentation = .standard
      case "code": presentation = .isoCode
      case "name": presentation = .fullName
      case "narrowSymbol": presentation = .narrow
      default: return nil
      }
      let accounting = (o["currencySign"] as? String) == "accounting"
      func money(_ mode: SignMode) -> CurrencyFormatStyleConfiguration.SignDisplayStrategy {
        switch mode {
        case .auto: return accounting ? .accounting : .automatic
        case .always: return accounting ? .accountingAlways(showZero: true) : .always(showZero: true)
        case .exceptZero: return accounting ? .accountingAlways(showZero: false) : .always(showZero: false)
        case .never: return .never
        }
      }
      func forDouble(_ mode: SignMode) -> FloatingPointFormatStyle<Double>.Currency {
        let s = FloatingPointFormatStyle<Double>.Currency(code: code).locale(locale).grouping(group)
          .presentation(presentation).notation(notation).sign(strategy: money(mode))
          .rounded(rule: rule, increment: doubleIncrement)
        return precision.map { s.precision($0) } ?? s
      }
      func forDecimal(_ mode: SignMode) -> Decimal.FormatStyle.Currency {
        let s = Decimal.FormatStyle.Currency(code: code).locale(locale).grouping(group)
          .presentation(presentation).notation(notation).sign(strategy: money(mode))
          .rounded(rule: rule, increment: decimalIncrement)
        return precision.map { s.precision($0) } ?? s
      }
      doublePlain = { forDouble($1).format($0) }
      doubleParts = { forDouble($1).attributed.format($0) }
      decimalPlain = decimalUsable ? { forDecimal($1).format($0) } : nil
      decimalParts = decimalUsable ? { forDecimal($1).attributed.format($0) } : nil
    default:
      return nil
    }
  }

  func format(_ encoded: String) -> String? {
    let body = String(encoded.dropFirst(2))
    if encoded.hasPrefix("n:") {
      // 十进制数最多 38 位有效数字，超过的没有办法精确表示。JS 那边先查过了，
      // 这里再挡一次
      let digits = body.filter { $0.isNumber }.drop { $0 == "0" }.count
      guard digits <= 38, let decimalPlain, let decimalParts,
            let value = Decimal(string: body, locale: Locale(identifier: "en_US_POSIX")) else { return nil }
      return finish(plain: { decimalPlain($0 ? -value : value, $1) },
                    parts: { decimalParts($0 ? -value : value, $1) },
                    zero: { decimalPlain(0, .auto) }, negative: value < 0, isNaN: false)
    }
    guard encoded.hasPrefix("d:"), let value = Double(body) else { return nil }
    return finish(plain: { self.doublePlain($0 ? -value : value, $1) },
                  parts: { self.doubleParts($0 ? -value : value, $1) },
                  zero: { self.doublePlain(0, .auto) }, negative: value.sign == .minus, isNaN: value.isNaN)
  }

  // 两种值共用的后半段。plain / parts 的第一个参数是「先取反再格式化」
  private func finish(plain: (Bool, SignMode) -> String, parts: (Bool, SignMode) -> AttributedString,
                      zero: () -> String, negative: Bool, isNaN: Bool) -> String {
    var flip = false
    if negativeOnly && negative && !isNaN {
      // signDisplay: negative —— 和 auto 一样，只是结果为零的负数不带负号。
      // 「结果为零」的判断：去掉负号之后和零格式化出来的一样
      if plain(true, .auto) == zero() { flip = true }
    }
    guard grouping == "always" || grouping == "min2" else { return plain(flip, signMode) }

    // 系统的接口只有「按地区的习惯分组」和「不分组」。另外两种和它的差别只在
    // 四位整数上：有的地区、有的写法下四位数不分组（西班牙语的 1234，紧凑
    // 写法的 1234），always 要补上分隔符；min2 反过来，四位数一律不分组
    var text = parts(flip, signMode)
    var digits = 0
    var separator: Range<AttributedString.Index>?
    var firstInteger: Range<AttributedString.Index>?
    for piece in text.runs {
      if piece.numberSymbol == .groupingSeparator {
        if separator == nil { separator = piece.range }
      } else if piece.numberPart == .integer {
        if firstInteger == nil { firstInteger = piece.range }
        digits += text[piece.range].characters.count
      }
    }
    if grouping == "always", digits == 4, separator == nil, let firstInteger {
      // 分隔符不自己猜：从同一套选项格式化一个五位数的结果里取。紧凑写法下
      // 五位数也不带分隔符，那就退到这个地区普通的十进制写法里取
      if let mark = groupingMark(in: doubleParts(12345, .never)) ??
                    groupingMark(in: FloatingPointFormatStyle<Double>.number.locale(locale).attributed.format(12345)) {
        text.insert(AttributedString(mark), at: text.characters.index(after: firstInteger.lowerBound))
      }
    } else if grouping == "min2", digits == 4, let separator {
      text.removeSubrange(separator)
    }
    return String(text.characters)
  }

  private func groupingMark(in sample: AttributedString) -> String? {
    guard let found = sample.runs.first(where: { $0.numberSymbol == .groupingSeparator }) else { return nil }
    return String(sample[found.range].characters)
  }
}
