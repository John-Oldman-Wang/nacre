// 整数常量（和 Java 的枚举值）↔ 字符串的一张表。规矩见 project.md 第 4 节「接类的规矩」：
// 去掉前缀、首字母小写；名字和数值的映射只放在原生这一侧。
//
// 写错时按位置分：属性位抛 NacreWarning（JS 那边打一条警告、值不变），方法参数和构造抛
// NacreTypeError。两种的话都列出全部可选值，措辞和 iOS 的 EnumError 一样。
package nacre.runtime

internal class EnumTable<T>(vararg entries: Pair<String, T>) {
    // 按数值从小到大写（错误信息里的顺序就是这个顺序）
    private val entries = entries.toList()

    val choices: String get() = entries.joinToString(" / ") { it.first }

    // 读：原生的值 → 名字。表里没有的给 null
    fun name(value: T): String? = entries.firstOrNull { it.second == value }?.first

    // 属性位：不认识就打警告、值不变。值本身可以是 null（outlineProvider 的 'none'），
    // 所以按条目找，不按值是不是 null 判断
    fun forProperty(what: String, given: Any?): T =
        (entries.firstOrNull { it.first == given } ?: throw NacreWarning(message(what, given))).second

    // 方法参数、构造参数：不认识就抛 TypeError
    fun forArgument(what: String, given: Any?): T =
        (entries.firstOrNull { it.first == given } ?: throw NacreTypeError(message(what, given))).second

    fun message(what: String, given: Any?): String {
        val shown = when (given) {
            is String -> "\"$given\""
            null -> "undefined"
            else -> given.toString()
        }
        return "$what has no value $shown; expected one of: $choices"
    }

}
