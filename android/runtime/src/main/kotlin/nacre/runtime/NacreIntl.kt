// Intl 的原生那一半（core/builtin/parts/26-intl.js、27-intl-date.js 经「调类方法」的通道
// 调到这里，类名 NacreIntl 只是桥上的一个地址）。约定照 iOS 的 NacreIntl.mm、
// NacreIntlDate.mm、NacreIntlNumber.swift：选项怎么读、默认值、报什么错都在 JS 那一侧，
// 到这里的是解析好、校验过的。
//
// 全部用 Android 自带的 ICU（android.icu）。网页里的 Intl（V8）底下也是 ICU，所以这里
// 不用像 iOS 那样在系统的格式化接口上补差别：分组的 always / min2、小时位数这些 ICU 本来
// 就有。ICU 的版本和 Chrome 的不一定相同，地区数据会有少量出入。
package nacre.runtime

import android.icu.number.IntegerWidth
import android.icu.number.LocalizedNumberFormatter
import android.icu.number.Notation
import android.icu.number.NumberFormatter
import android.icu.number.Precision
import android.icu.number.Scale
import android.icu.text.DateFormat
import android.icu.text.DateIntervalFormat
import android.icu.text.DateTimePatternGenerator
import android.icu.text.Normalizer2
import android.icu.text.NumberingSystem
import android.icu.text.SimpleDateFormat
import android.icu.util.Currency
import android.icu.util.DateInterval
import android.icu.util.GregorianCalendar
import android.icu.util.MeasureUnit
import android.icu.util.TimeZone
import android.icu.util.ULocale
import android.os.LocaleList
import org.json.JSONArray
import org.json.JSONObject
import java.math.BigDecimal
import java.math.RoundingMode
import java.util.Date

internal object NacreIntl {

    // 返回 JSON 文本。参数不对抛 NacreTypeError（JS 那边是 TypeError）
    fun call(name: String, args: List<*>): String = when (name) {
        "formatNumber:" -> JSONObject.quote(formatNumber(args))
        "numberFormat:" -> numberFormat(args).toString()
        "currencyDigits:" -> currencyDigits(text(args, 0, name)).toString()
        "localeInfo" -> localeInfo()
        "numberingSystem:" -> JSONObject.quote(NumberingSystem.getInstance(locale(text(args, 0, name))).name)
        "normalize:" -> JSONObject.quote(normalize(text(args, 0, name), text(args, 1, name)))
        "formatDate:" -> JSONObject.quote(plainSpaces(dateFormat(args, name).formatter.format(date(args, 1, name))))
        "formatDateParts:" -> formatDateParts(dateFormat(args, name), date(args, 1, name))
        "formatDateRange:" -> JSONObject.quote(formatDateRange(args))
        "dateFormatter:" -> dateFormatter(args).toString()
        "datePattern:" -> JSONObject.quote(datePattern(args))
        "dateTemplate:" -> JSONObject.quote(
            DateTimePatternGenerator.getInstance(locale(text(args, 0, name))).getBestPattern(text(args, 1, name)))
        "hourDigits:" -> hourDigits(text(args, 0, name), text(args, 1, name)).toString()
        "timeZone:" -> canonicalTimeZone(args.getOrNull(0) as? String)?.let(JSONObject::quote) ?: "null"
        "defaultTimeZone" -> JSONObject.quote(java.util.TimeZone.getDefault().id ?: "UTC")
        "calendar:" -> JSONObject.quote(calendar(text(args, 0, name)))
        else -> throw NacreTypeError("NacreIntl has no class method $name")
    }

    private fun text(args: List<*>, i: Int, where: String): String =
        args.getOrNull(i) as? String ?: throw NacreTypeError("$where: argument ${i + 1} must be a string")

    // 「BCP 47 标签 + @ 后面的 ICU 关键字」（zh-CN@calendar=chinese;hours=h12）→ ULocale
    private fun locale(id: String): ULocale {
        val at = id.indexOf('@')
        var locale = ULocale.forLanguageTag(if (at < 0) id else id.substring(0, at))
        if (at >= 0) {
            for (pair in id.substring(at + 1).split(';')) {
                val eq = pair.indexOf('=')
                if (eq > 0) locale = locale.setKeywordValue(pair.substring(0, eq), pair.substring(eq + 1))
            }
        }
        return locale
    }

    // ---- 地区 ----

    // 默认地区：系统的首选语言，原样跟着它走，只把写法收短（文字那一段是这个语言和地区
    // 本来就隐含的就去掉：zh-Hans-CN → zh-CN）。和 iOS 一样有意不照网页的防指纹压缩
    private fun defaultLocale(): String {
        val preferred = LocaleList.getDefault().get(0) ?: return "en-US"
        val full = ULocale.forLocale(preferred)
        val language = full.language.ifEmpty { return "en-US" }
        val region = full.country
        val script = full.script
        val short = if (region.isEmpty()) language else "$language-$region"
        if (script.isEmpty()) return short
        val implied = ULocale.addLikelySubtags(ULocale.forLanguageTag(short)).script
        return if (implied == script) short
        else if (region.isEmpty()) "$language-$script" else "$language-$script-$region"
    }

    private fun localeInfo(): String {
        val available = LinkedHashSet<String>()
        for (l in ULocale.getAvailableLocales()) {
            val tag = l.toLanguageTag()
            if (tag == "und" || tag.contains("-x-")) continue
            available.add(tag)
            // 带文字的另外补一个不带文字的别名（zh-Hans-CN 之外还有 zh-CN），网页也这么认
            if (l.script.isNotEmpty() && l.country.isNotEmpty()) available.add("${l.language}-${l.country}")
        }
        return JSONObject()
            .put("defaultLocale", defaultLocale())
            .put("availableLocales", JSONArray(available.toList()))
            .put("numberingSystems", JSONArray(NumberingSystem.getAvailableNames().toList()))
            .toString()
    }

    // 这种货币默认留几位小数（日元 0，美元 2）。不认识的按 2
    private fun currencyDigits(code: String): Int =
        runCatching { Currency.getInstance(code).defaultFractionDigits }.getOrDefault(2)

    // ---- 数字 ----

    private class NumberStyle(val formatter: LocalizedNumberFormatter, val zero: String, val negativeOnly: Boolean)
    private val numberFormats = ArrayList<NumberStyle>()
    private val numberIds = HashMap<String, Int>()

    // 按一组解析好的选项建一个格式化器，返回编号。同一组选项只建一次
    private fun numberFormat(args: List<*>): Int {
        val key = args.getOrNull(0) as? String
        val o = args.getOrNull(1) as? Map<*, *>
        if (key == null || o == null) throw NacreTypeError("numberFormat needs a key and resolved options")
        numberIds[key]?.let { return it }
        val style = buildNumberStyle(o)
            ?: throw NacreTypeError("these number format options are not supported by this runtime")
        numberFormats.add(style)
        numberIds[key] = numberFormats.size - 1
        return numberFormats.size - 1
    }

    private fun Map<*, *>.int(key: String): Int? = (this[key] as? Double)?.toInt()

    private fun buildNumberStyle(o: Map<*, *>): NumberStyle? {
        val tag = o["locale"] as? String ?: return null
        var loc = ULocale.forLanguageTag(tag)
        (o["numbers"] as? String)?.let { loc = loc.setKeywordValue("numbers", it) }
        var f: LocalizedNumberFormatter = NumberFormatter.withLocale(loc)

        f = f.roundingMode(when (o["roundingMode"]) {
            "halfExpand" -> RoundingMode.HALF_UP
            "halfEven" -> RoundingMode.HALF_EVEN
            "trunc" -> RoundingMode.DOWN
            "expand" -> RoundingMode.UP
            "ceil" -> RoundingMode.CEILING
            "floor" -> RoundingMode.FLOOR
            else -> return null
        })

        val minInteger = o.int("minimumIntegerDigits") ?: 1
        f = f.integerWidth(IntegerWidth.zeroFillTo(minInteger))
        val step = o.int("roundingIncrement") ?: 1
        when (o["precision"]) {
            "fraction" -> {
                val low = o.int("minimumFractionDigits") ?: return null
                val high = o.int("maximumFractionDigits") ?: return null
                if (low > high) return null
                // 舍入增量是「最后一位小数上的几」：两位小数、增量 5 就是 0.05
                f = f.precision(if (step == 1) Precision.minMaxFraction(low, high)
                                else Precision.increment(BigDecimal.valueOf(step.toLong(), high)))
            }
            "significant" -> {
                val low = o.int("minimumSignificantDigits") ?: return null
                val high = o.int("maximumSignificantDigits") ?: return null
                if (low > high || minInteger != 1) return null
                f = f.precision(Precision.minMaxSignificantDigits(low, high))
            }
            "default" -> Unit   // 紧凑写法的默认精度，ICU 自己定（和标准是同一个结果）
            else -> return null
        }

        f = f.grouping(when (o["useGrouping"]) {
            false -> NumberFormatter.GroupingStrategy.OFF
            "always" -> NumberFormatter.GroupingStrategy.ON_ALIGNED
            "min2" -> NumberFormatter.GroupingStrategy.MIN2
            "auto", true, null -> NumberFormatter.GroupingStrategy.AUTO
            else -> return null
        })

        f = f.notation(when (o["notation"]) {
            "standard" -> Notation.simple()
            "compact" -> Notation.compactShort()
            "scientific" -> Notation.scientific()
            else -> return null
        })

        val accounting = o["currencySign"] == "accounting"
        val sign = o["signDisplay"]
        val negativeOnly = sign == "negative"
        f = f.sign(when (sign) {
            "auto", "negative" -> if (accounting) NumberFormatter.SignDisplay.ACCOUNTING else NumberFormatter.SignDisplay.AUTO
            "always" -> if (accounting) NumberFormatter.SignDisplay.ACCOUNTING_ALWAYS else NumberFormatter.SignDisplay.ALWAYS
            "exceptZero" -> if (accounting) NumberFormatter.SignDisplay.ACCOUNTING_EXCEPT_ZERO
                            else NumberFormatter.SignDisplay.EXCEPT_ZERO
            "never" -> NumberFormatter.SignDisplay.NEVER
            else -> return null
        })

        when (o["style"]) {
            "decimal" -> Unit
            "percent" -> f = f.unit(MeasureUnit.PERCENT).scale(Scale.powerOfTen(2))
            "currency" -> {
                val code = o["currency"] as? String ?: return null
                f = f.unit(Currency.getInstance(code)).unitWidth(when (o["currencyDisplay"]) {
                    "symbol" -> NumberFormatter.UnitWidth.SHORT
                    "code" -> NumberFormatter.UnitWidth.ISO_CODE
                    "name" -> NumberFormatter.UnitWidth.FULL_NAME
                    "narrowSymbol" -> NumberFormatter.UnitWidth.NARROW
                    else -> return null
                })
            }
            else -> return null
        }
        return NumberStyle(f, f.format(0).toString(), negativeOnly)
    }

    // value 是 "d:<数>"（双精度数）或 "n:<十进制数字串>"（精确的十进制数）
    private fun formatNumber(args: List<*>): String {
        val id = (args.getOrNull(0) as? Double)?.toInt()
        val encoded = args.getOrNull(1) as? String
        if (id == null || encoded == null) throw NacreTypeError("formatNumber needs a formatter id and an encoded value")
        val style = numberFormats.getOrNull(id) ?: throw NacreTypeError("formatNumber: unknown formatter")
        val body = encoded.substring(2)
        val value: Number = when {
            encoded.startsWith("n:") -> runCatching { BigDecimal(body) }.getOrNull()
            encoded.startsWith("d:") -> body.toDoubleOrNull()
            else -> null
        } ?: throw NacreTypeError("this value cannot be formatted with these options")
        val text = style.formatter.format(value).toString()
        // signDisplay: negative（ICU 新版本才有，Android 11 的没有）—— 和 auto 一样，只是结果
        // 为零的负数不带负号。「结果为零」：去掉负号之后和零格式化出来的一样
        if (style.negativeOnly && isNegative(value)) {
            val flipped = style.formatter.format(negate(value)).toString()
            if (flipped == style.zero) return flipped
        }
        return text
    }

    private fun isNegative(v: Number) = when (v) {
        is BigDecimal -> v.signum() < 0
        else -> v.toDouble().let { it < 0 || (it == 0.0 && 1.0 / it < 0) }
    }
    private fun negate(v: Number): Number = if (v is BigDecimal) v.negate() else -v.toDouble()

    // ---- String.prototype.normalize ----

    private fun normalize(text: String, form: String): String {
        val n = when (form) {
            "NFC" -> Normalizer2.getNFCInstance()
            "NFD" -> Normalizer2.getNFDInstance()
            "NFKC" -> Normalizer2.getNFKCInstance()
            "NFKD" -> Normalizer2.getNFKDInstance()
            else -> throw NacreTypeError("normalize needs one of NFC, NFD, NFKC, NFKD")
        }
        return n.normalize(text)
    }

    // ---- 日期 ----

    private class DateStyle(val formatter: SimpleDateFormat, val locale: ULocale, val zone: TimeZone) {
        var pieces: List<Pair<String, Any>>? = null   // 字段 → 只格式化它的格式化器；文字 → 字符串
        val intervals = HashMap<String, DateIntervalFormat>()
    }
    private val dateFormats = ArrayList<DateStyle>()
    private val dateIds = HashMap<String, Int>()

    // JS 的 Date 用的是「往前一直推到头」的公历。ICU 的公历默认在 1582 年换成儒略历，
    // 不改的话那之前的日期会差十来天
    private fun makeFormatter(locale: ULocale, zone: TimeZone, pattern: String): SimpleDateFormat {
        val f = SimpleDateFormat(pattern, locale)
        f.timeZone = zone
        val cal = f.calendar
        if (cal is GregorianCalendar) cal.gregorianChange = Date(Long.MIN_VALUE)
        return f
    }

    // 时间和「上午/下午」之间的窄不换行空格（U+202F）、细空格（U+2009）换成普通空格：
    // 一大批现成的代码按普通空格去解析，三家浏览器都这么做
    private fun plainSpaces(text: String) = text.replace(' ', ' ').replace(' ', ' ')

    private fun date(args: List<*>, i: Int, where: String): Date =
        Date((args.getOrNull(i) as? Double ?: throw NacreTypeError("$where needs a time value")).toLong())

    private fun dateFormat(args: List<*>, where: String): DateStyle {
        val id = (args.getOrNull(0) as? Double)?.toInt()
        return id?.let(dateFormats::getOrNull) ?: throw NacreTypeError("$where needs a formatter id")
    }

    // 名字或者偏移的秒数 → 时区
    private fun zoneFrom(value: Any?): TimeZone? = when (value) {
        is Double -> {
            val seconds = value.toInt()
            val abs = kotlin.math.abs(seconds)
            TimeZone.getTimeZone(String.format(java.util.Locale.ROOT, "GMT%s%02d:%02d",
                                               if (seconds < 0) "-" else "+", abs / 3600, abs % 3600 / 60))
        }
        // 「UTC」写出来要是 UTC / Coordinated Universal Time，和网页一样
        "UTC" -> TimeZone.getTimeZone("Etc/UTC")
        is String -> TimeZone.getTimeZone(value).takeIf { it.id != TimeZone.UNKNOWN_ZONE_ID }
        else -> null
    }

    private fun dateFormatter(args: List<*>): Int {
        val key = args.getOrNull(0) as? String
        val spec = args.getOrNull(1) as? Map<*, *>
        val localeId = spec?.get("locale") as? String
        val pattern = spec?.get("pattern") as? String
        val zone = zoneFrom(spec?.get("timeZone"))
        if (key == null || localeId == null || pattern == null || zone == null) {
            throw NacreTypeError("dateFormatter needs a key and { locale, pattern, timeZone }")
        }
        dateIds[key]?.let { return it }
        val loc = locale(localeId)
        dateFormats.add(DateStyle(makeFormatter(loc, zone, pattern), loc, zone))
        dateIds[key] = dateFormats.size - 1
        return dateFormats.size - 1
    }

    // 一段一段给：[[字段, 文字], …]，字段是空串的那些是原样的文字。每个字段单独格式化再拼，
    // 和 iOS 一样
    private fun formatDateParts(style: DateStyle, at: Date): String {
        val pieces = style.pieces ?: tokenize(style.formatter.toPattern()).map { (field, literal) ->
            if (field.isEmpty()) field to literal as Any
            else field to makeFormatter(style.locale, style.zone, field) as Any
        }.also { style.pieces = it }
        val out = JSONArray()
        for ((field, value) in pieces) {
            val text = if (field.isEmpty()) value as String else (value as SimpleDateFormat).format(at)
            out.put(JSONArray().put(field).put(plainSpaces(text)))
        }
        return out.toString()
    }

    // 把格式串切成字段和文字。规则是 ICU 的：A-Z a-z 连着的同一个字母是一个字段；
    // 单引号里的是文字；连着两个单引号是一个字面的引号
    private fun tokenize(pattern: String): List<Pair<String, String>> {
        val out = ArrayList<Pair<String, String>>()
        val literal = StringBuilder()
        fun flush() {
            if (literal.isNotEmpty()) { out.add("" to literal.toString()); literal.setLength(0) }
        }
        var i = 0
        val n = pattern.length
        while (i < n) {
            val c = pattern[i]
            if (c == '\'') {
                if (i + 1 < n && pattern[i + 1] == '\'') { literal.append('\''); i += 2; continue }
                i++
                while (i < n) {
                    val d = pattern[i]
                    if (d == '\'') {
                        if (i + 1 < n && pattern[i + 1] == '\'') { literal.append('\''); i += 2; continue }
                        i++
                        break
                    }
                    literal.append(d)
                    i++
                }
                continue
            }
            if (c in 'a'..'z' || c in 'A'..'Z') {
                var j = i
                while (j < n && pattern[j] == c) j++
                flush()
                out.add(pattern.substring(i, j) to "")
                i = j
                continue
            }
            literal.append(c)
            i++
        }
        flush()
        return out
    }

    // 一段时间。参数：格式化器编号、骨架串、小时制（没有是 null）、起止的毫秒数
    private fun formatDateRange(args: List<*>): String {
        val style = dateFormat(args, "formatDateRange")
        val skeleton = args.getOrNull(1) as? String
            ?: throw NacreTypeError("formatDateRange needs a formatter id, a skeleton and two time values")
        val hourCycle = args.getOrNull(2) as? String
        val start = date(args, 3, "formatDateRange")
        val end = date(args, 4, "formatDateRange")
        if (start == end) return plainSpaces(style.formatter.format(start))
        val loc = if (hourCycle == null) style.locale else style.locale.setKeywordValue("hours", hourCycle)
        val interval = style.intervals.getOrPut(skeleton) {
            DateIntervalFormat.getInstance(skeleton, loc).also { it.timeZone = style.zone }
        }
        var text = interval.format(DateInterval(start.time, end.time))
        // 两头在这个骨架的粒度上是同一个（同一天、同一个月）时，区间格式化器给的是单个日期，
        // 而且是用骨架自己的格式串写的；网页这时改用我们那个格式串来写。和 iOS 同一个认法
        val own = DateTimePatternGenerator.getInstance(loc).getBestPattern(skeleton)
        val single = makeFormatter(loc, style.zone, own).format(start)
        if (text == single) text = style.formatter.format(start)
        return plainSpaces(text)
    }

    // dateStyle / timeStyle 对应的格式串。参数：地区标识、两个样式（没有是 null）
    private fun datePattern(args: List<*>): String {
        val loc = locale(text(args, 0, "datePattern"))
        fun style(v: Any?) = when (v) {
            "full" -> DateFormat.FULL
            "long" -> DateFormat.LONG
            "medium" -> DateFormat.MEDIUM
            "short" -> DateFormat.SHORT
            else -> -1
        }
        val dateStyle = style(args.getOrNull(1))
        val timeStyle = style(args.getOrNull(2))
        val format = when {
            dateStyle >= 0 && timeStyle >= 0 -> DateFormat.getDateTimeInstance(dateStyle, timeStyle, loc)
            dateStyle >= 0 -> DateFormat.getDateInstance(dateStyle, loc)
            timeStyle >= 0 -> DateFormat.getTimeInstance(timeStyle, loc)
            else -> return ""
        }
        return (format as? SimpleDateFormat)?.toPattern() ?: ""
    }

    // 小时写一位还是两位：按网页向 ICU 要格式串时用的选项（小时的位数按要求的来）要一次，
    // 数小时那一段有几个字。没有小时字段返回 0
    private fun hourDigits(skeleton: String, localeId: String): Int {
        if (skeleton.none { it in "jhHkK" }) return 0
        val pattern = DateTimePatternGenerator.getInstance(locale(localeId))
            .getBestPattern(skeleton, DateTimePatternGenerator.MATCH_HOUR_FIELD_LENGTH)
        for ((field, _) in tokenize(pattern)) {
            if (field.isNotEmpty() && field[0] in "hHkK") return field.length
        }
        return 0
    }

    // 时区的名字认不认。返回规范写法的名字，不认返回 null。标准要的是 IANA 的名字，
    // 大小写不敏感；ICU 还认一批不是 IANA 名字的缩写（PST）和 GMT+8 这种，网页不收，挡掉
    private val zoneNames: Map<String, String> by lazy {
        TimeZone.getAvailableIDs().associateBy { it.lowercase() }
    }
    private val realAbbreviations = setOf("CET", "EET", "EST", "GMT", "HST", "MST", "UTC", "WET")

    private fun canonicalTimeZone(name: String?): String? {
        if (name == null) return null
        val upper = name.uppercase()
        if ((upper.startsWith("GMT") || upper.startsWith("UTC")) && name.length > 3) return null
        val hit = zoneNames[name.lowercase()] ?: return null
        if (hit.length == 3 && hit.all { it.isUpperCase() } && hit !in realAbbreviations) return null
        return hit
    }

    // 这个地区默认用哪种日历（泰国是佛历）。ICU 的名字和标准里的名字不一样的只有这几个
    private fun calendar(localeId: String): String {
        val type = android.icu.util.Calendar.getInstance(locale(localeId)).type
        return when (type) {
            "gregorian" -> "gregory"
            "ethiopic-amete-alem" -> "ethioaa"
            else -> type
        }
    }
}
