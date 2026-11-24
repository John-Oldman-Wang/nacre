// 登记表：所有的域。接一组类就在这里加一行，别的共享文件不用碰。
// 先后无所谓：对象归哪个域问、用哪个 JS 类名，都按类的继承层级排，不按这里的顺序。
package nacre.runtime

internal fun registeredDomains(host: DomainHost): List<Domain> = listOf(
    ViewDomain(host),
    WindowInsetsDomain(host),
    BlobDomain(host),
    WebSocketDomain(host),
    IntlDomain(host),
    AppearanceDomain(host),
    ScrollDomain(host),
    AnimationDomain(host),
)
