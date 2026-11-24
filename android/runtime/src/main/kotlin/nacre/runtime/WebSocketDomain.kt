// WebSocket（core/builtin/parts/06-websocket.js）。实现在 NacreWebSocket.kt。
package nacre.runtime

import org.json.JSONObject

internal class WebSocketDomain(host: DomainHost) : Domain(host) {

    override val classes: Map<Class<*>, String> = mapOf(NacreWebSocket::class.java to "WebSocket")

    // new WebSocket(url, { protocols, headers })。网址不合法交 null，JS 那边抛 TypeError
    override fun construct(className: String, args: List<*>, objects: List<Any?>): Any? {
        val url = args.getOrNull(0) as? String ?: return null
        return NacreWebSocket.open(url, args.getOrNull(1) as? Map<*, *>, events)
    }

    override fun read(target: Any, name: String): String? {
        if (target !is NacreWebSocket) return null
        return when (name) {
            "readyState" -> target.readyState.toString()
            "url" -> JSONObject.quote(target.url)
            "protocol" -> JSONObject.quote(target.protocol)
            "maximumMessageSize" -> target.maximumMessageSize.toString()
            else -> null
        }
    }

    override fun write(target: Any, name: String, value: Any?): Boolean {
        if (target !is NacreWebSocket || name != "maximumMessageSize") return false
        target.maximumMessageSize = (value as? Double)?.toInt()
            ?: throw NacreTypeError("maximumMessageSize must be a number")
        return true
    }

    override fun call(target: Any, name: String, args: List<*>, objects: List<Any?>): String? {
        if (target !is NacreWebSocket || name != "close") return null
        // JS 那边已经把 code 转成了整数（或者 null），reason 转成了字符串（或者 null）
        target.close((args.getOrNull(0) as? Double)?.toInt(), args.getOrNull(1) as? String)
        return "null"
    }

    // send 和 ping 都是「发出去，等一个结果」，所以 JS 那边是 Promise
    override fun callAsync(target: Any, name: String, args: List<*>, objects: List<Any?>, callId: Int): Boolean {
        if (target !is NacreWebSocket) return false
        when (name) {
            "send" -> target.send(args.getOrNull(0) as? String, objects.getOrNull(0) as? NacreBlob,
                                  host.settle, callId)
            // OkHttp 没有公开「手动发一个 ping、等 pong」的接口，只有定时自动发
            "ping" -> host.settle.reject(callId, "NotSupportedError",
                                         "ping: not supported on Android (OkHttp has no manual ping)")
            else -> return false
        }
        return true
    }

    // 事件总是发，不看有没有人订（和 iOS 一样），所以没有 subscribe
    private val events = object : NacreWebSocket.Events {
        override fun plain(socket: NacreWebSocket, type: String) = host.emitter.plain(socket, type)
        override fun json(socket: NacreWebSocket, type: String, json: String, eventClass: String) =
            host.emitter.json(socket, type, json, eventClass)
        override fun blob(socket: NacreWebSocket, type: String, blob: NacreBlob, eventClass: String) =
            host.emitter.obj(socket, type, blob, eventClass)
    }
}
