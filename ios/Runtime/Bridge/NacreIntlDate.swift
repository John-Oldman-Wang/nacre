// 日期格式化里小时写一位还是两位。
//
// 网页里的 Intl 向系统要格式串时带了一个选项：小时的位数按要求的来
// （UDATPG_MATCH_HOUR_FIELD_LENGTH）。NSDateFormatter 的公开接口带不了它，
// 而要不要缩成一位取决于系统内部匹配到的是哪一条格式——中文的
// 「小时 + 两位分钟」是 3:04，「小时 + 一位分钟」却是 03:04，从外面推不出来。
//
// Foundation 的 Date.FormatStyle 内部带了那个选项，实测和网页一致。所以这一位
// 来问它：用同样的字段拼一个样式，格式化一个小时是 3 的时刻，数小时那一段
// 有几个字。它只有 Swift 能调，所以在这个文件里。
import Foundation

@objc(NacreIntlHourDigits)
final class NacreIntlHourDigits: NSObject {
  /// skeleton 是骨架串（字段字母），locale 是带关键字的地区标识。
  /// 返回 1 或 2；问不出来（没有小时字段）返回 0
  @objc static func digits(_ skeleton: String, locale: String) -> Int {
    var counts: [Character: Int] = [:]
    for c in skeleton { counts[c, default: 0] += 1 }
    func n(_ c: Character) -> Int { counts[c] ?? 0 }
    let hours = n("j") + n("h") + n("H") + n("k") + n("K")
    guard hours > 0 else { return 0 }

    var style = Date.FormatStyle(date: .omitted, time: .omitted)
    style.locale = Locale(identifier: locale)
    style.timeZone = TimeZone(identifier: "Etc/UTC") ?? .gmt
    if n("E") > 0 { style = style.weekday(n("E") == 5 ? .narrow : n("E") == 4 ? .wide : .abbreviated) }
    if n("G") > 0 { style = style.era(n("G") == 5 ? .narrow : n("G") == 4 ? .wide : .abbreviated) }
    if n("y") > 0 { style = style.year(n("y") == 2 ? .twoDigits : .defaultDigits) }
    switch n("M") {
    case 1: style = style.month(.defaultDigits)
    case 2: style = style.month(.twoDigits)
    case 3: style = style.month(.abbreviated)
    case 4: style = style.month(.wide)
    case 5: style = style.month(.narrow)
    default: break
    }
    if n("d") > 0 { style = style.day(n("d") == 2 ? .twoDigits : .defaultDigits) }
    style = style.hour(hours >= 2 ? .twoDigits(amPM: .abbreviated) : .defaultDigits(amPM: .abbreviated))
    if n("m") > 0 { style = style.minute(n("m") == 2 ? .twoDigits : .defaultDigits) }
    if n("s") > 0 { style = style.second(n("s") == 2 ? .twoDigits : .defaultDigits) }
    if n("S") > 0 { style = style.secondFraction(.fractional(n("S"))) }
    if n("z") > 0 { style = style.timeZone(.specificName(n("z") == 4 ? .long : .short)) }
    if n("O") > 0 { style = style.timeZone(.localizedGMT(n("O") == 4 ? .long : .short)) }
    if n("v") > 0 { style = style.timeZone(.genericName(n("v") == 4 ? .long : .short)) }

    // 1970-01-01 03:04:05 UTC：小时是 3，一位还是两位看得出来
    let text = style.attributed.format(Date(timeIntervalSince1970: 3 * 3600 + 4 * 60 + 5))
    for run in text.runs where run.dateField == .hour {
      return text[run.range].characters.count
    }
    return 0
  }
}
