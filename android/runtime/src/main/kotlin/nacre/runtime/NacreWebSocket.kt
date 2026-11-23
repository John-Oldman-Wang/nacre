// WebSocket 在原生这一侧：底下是 OkHttp 的 WebSocket，上层是 core/builtin/parts/06-websocket.js
// 给的 Web 的 WebSocket。行为照 iOS 的 NacreWebSocket.mm。
//
// 和 iOS 一样比 Web 多 headers（浏览器的构造器给不了，真实业务里 Authorization 是刚需）。
// iOS 还多一个协议级的 ping，Android 给不了：OkHttp 没有公开「手动发一个 ping、等 pong」的
// 接口（只有定时自动发），所以 ping() 以 NotSupportedError 被拒。
//
// OkHttp 的回调在它自己的线程上，这里只改状态、把事件交给 events（排到主线程再派发）。
package nacre.runtime

import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import okio.ByteString
import okio.ByteString.Companion.toByteString
import org.json.JSONObject

internal class NacreWebSocket private constructor(val url: String) {
    // 0 连接中 / 1 已开 / 2 关闭中 / 3 已关。和 OkHttp 的内部状态不是一回事，自己记
    @Volatile var readyState = 0
        private set
    @Volatile var protocol = ""
        private set
    // 一条消息最大多少字节，超了接收就失败（断开）。默认 1 MiB，和 iOS 的系统默认一样
    @Volatile var maximumMessageSize = 1 shl 20

    private lateinit var socket: WebSocket
    @Volatile private var failure: String? = null

    // 关。已经在关或关完了再调是空操作，和 Web 一致。code 不给是 1000。
    // 关闭码不合法时 OkHttp 抛 IllegalArgumentException，交给 JS
    fun close(code: Int?, reason: String?) {
        if (readyState >= 2) return
        socket.close(code ?: 1000, reason)
        readyState = 2
    }

    // 发一条。只认字符串和 Blob（ArrayBuffer、类型数组在 JS 侧包成了 Blob）。
    // OkHttp 只有「放进发送队列」，没有「发出去了」的回调，所以放进队列就算发出去
    fun send(text: String?, blob: NacreBlob?, settle: Settle, callId: Int) {
        if (readyState != 1) {
            settle.reject(callId, "InvalidStateError", "send: the socket is not open")
            return
        }
        val queued = when {
            blob != null -> socket.send(blob.data.toByteString())
            text != null -> socket.send(text)
            else -> {
                settle.reject(callId, "TypeError", "send: expects a string or a Blob")
                return
            }
        }
        if (queued) settle.json(callId, "true")
        else settle.reject(callId, "NetworkError", "send: the socket is closing or its send queue is full")
    }

    // 事件的出口。派发前排到主线程，这里只管交出去
    interface Events {
        fun plain(socket: NacreWebSocket, type: String)
        fun json(socket: NacreWebSocket, type: String, json: String, eventClass: String)
        fun blob(socket: NacreWebSocket, type: String, blob: NacreBlob, eventClass: String)
    }

    private inner class Listener(private val events: Events) : WebSocketListener() {
        override fun onOpen(webSocket: WebSocket, response: Response) {
            readyState = 1
            protocol = response.header("Sec-WebSocket-Protocol") ?: ""
            events.plain(this@NacreWebSocket, "open")
        }

        override fun onMessage(webSocket: WebSocket, text: String) {
            if (tooBig(text.toByteArray(Charsets.UTF_8).size)) return
            events.json(this@NacreWebSocket, "message", JSONObject.quote(text), "MessageEvent")
        }

        override fun onMessage(webSocket: WebSocket, bytes: ByteString) {
            if (tooBig(bytes.size)) return
            // 二进制给 Blob，字节不进 V8 的堆，和 fetch 的 blob() 同一条路
            events.blob(this@NacreWebSocket, "message", NacreBlob(bytes.toByteArray(), ""), "MessageEvent")
        }

        // 对端说要关了：回一个关闭帧，等 onClosed
        override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
            readyState = 2
            webSocket.close(code, null)
        }

        override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
            if (readyState == 3) return
            readyState = 3
            val payload = JSONObject().put("code", code).put("reason", reason).put("wasClean", true)
            events.json(this@NacreWebSocket, "close", payload.toString(), "CloseEvent")
        }

        // 握手失败、连接断了、消息超长都走这里，那时 onClosed 不会来
        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
            if (readyState == 3) return
            readyState = 3
            val message = failure ?: t.message ?: "websocket failed"
            events.json(this@NacreWebSocket, "error", JSONObject.quote(message), "ErrorEvent")
            // 1006 是「异常关闭」：RFC 6455 规定它只能由端自己生成，不会出现在线上
            val payload = JSONObject().put("code", 1006).put("reason", "").put("wasClean", false)
            events.json(this@NacreWebSocket, "close", payload.toString(), "CloseEvent")
        }

        // 超过 maximumMessageSize：断开，和 iOS 一样接收失败、发 error 和 1006 的 close
        private fun tooBig(size: Int): Boolean {
            if (size <= maximumMessageSize) return false
            failure = "message of $size bytes exceeds maximumMessageSize ($maximumMessageSize)"
            socket.cancel()
            return true
        }
    }

    companion object {
        // new WebSocket(url, { protocols, headers })。网址不合法（OkHttp 只认 ws、wss、http、https）
        // 返回 null，JS 那边抛 TypeError
        fun open(url: String, options: Map<*, *>?, events: Events): NacreWebSocket? {
            val builder = try {
                Request.Builder().url(url)
            } catch (_: IllegalArgumentException) {
                return null
            }
            (options?.get("headers") as? Map<*, *>)?.forEach { (key, value) ->
                if (key is String && value is String) builder.header(key, value)
            }
            val protocols = (options?.get("protocols") as? List<*>)?.filterIsInstance<String>().orEmpty()
            if (protocols.isNotEmpty()) builder.header("Sec-WebSocket-Protocol", protocols.joinToString(", "))
            val ws = NacreWebSocket(url)
            ws.socket = Network.client.newWebSocket(builder.build(), ws.Listener(events))
            return ws
        }
    }
}
