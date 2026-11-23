// Intl（core/builtin/parts/26-intl.js、27-intl-date.js）走「调类方法」的通道，类名 NacreIntl
// 只是桥上的地址，没有实例。实现在 NacreIntl.kt。
package nacre.runtime

internal class IntlDomain(host: DomainHost) : Domain(host) {

    override val classes: Map<Class<*>, String> = emptyMap()

    override fun classCall(className: String, name: String, args: List<*>, objects: List<Any?>): String? =
        if (className == "NacreIntl") NacreIntl.call(name, args) else null
}
