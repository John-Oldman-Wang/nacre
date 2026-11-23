// Blob 的属性。建 Blob、读内容走引擎专门的入口（NativeBridge 的 createBlob、
// readObjectAsync），不经过这里。JS 那一侧在 core/builtin/parts/23-fetch.js。
package nacre.runtime

import org.json.JSONObject

internal class BlobDomain(host: DomainHost) : Domain(host) {

    override val classes: Map<Class<*>, String> = mapOf(NacreBlob::class.java to "Blob")

    override fun read(target: Any, name: String): String? = when {
        target is NacreBlob && name == "size" -> target.data.size.toString()
        target is NacreBlob && name == "type" -> JSONObject.quote(target.type)
        else -> null
    }
}
