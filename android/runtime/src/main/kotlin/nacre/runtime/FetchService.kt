// fetch 在原生这一侧：用 OkHttp 发请求，响应头到了就兑现 fetch 的 Promise，body 留在
// 这边，等 JS 来读（整个读，或者按块读）。行为照 iOS 的 NacreFetchService.mm。
//
// 线程分工：
//
//   OkHttp 的线程      连接、传输、gzip；响应头到了在这里读 body，一块一块追加
//          ↓
//   work 线程池        UTF-8 解码这类 CPU 活
//          ↓
//   主线程             兑现 Promise（Settle 的实现排到主线程）
//
// 一个请求的状态（攒下的字节、谁在等、结束了没有）由它自己的锁守着：OkHttp 的线程
// 往里写，主线程来读和取消。
//
// 边下边读（response.body）：JS 每调一次 read() 来要一次（kind 是 "chunk"），把那一刻
// 攒下的全部字节作为一块交出去，一个字节都没有就等到有。背压：JS 开始按块读之后，
// 攒到 STREAM_HIGH_WATER_MARK 就让读 body 的线程停下来等，被读走之后再接着读。
package nacre.runtime

import okhttp3.Call
import okhttp3.Callback
import okhttp3.Headers
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

internal class FetchService(private val settle: Settle) {

    private val client get() = Network.client
    private val work: ExecutorService = Executors.newCachedThreadPool { r ->
        Thread(r, "nacre.fetch.work").apply { isDaemon = true }
    }
    private val tasks = ConcurrentHashMap<Int, Task>()
    // 只在主线程上发号（fetchStart 从 JS 来，在主线程）
    private var nextRequestId = 1

    private class Task(val requestId: Int, val callId: Int) {
        val lock = Object()
        var call: Call? = null
        var body = ByteArrayOutputStream()
        // 响应头交给 JS 了。从这一刻起 JS 那边有一个 Response，这条记录的清理归它管
        //（它被回收时来 release）；在这之前结束的请求没有人会来清理
        var responded = false
        var completed = false          // body 下载完了（成功或失败）
        var error: IOException? = null
        var cancelled = false
        // 等 body 的那个调用。kind 是 "chunk" 时等的是下一块，有数据到就给；其余的等下完
        var pendingCallId = 0
        var pendingKind: String? = null
        var streaming = false          // JS 按块读过它。从这一刻起才做背压
    }

    fun start(url: String, optionsJson: String, requestBody: NacreBlob?, callId: Int): Int {
        val request = try {
            buildRequest(url, optionsJson, requestBody)
        } catch (e: IllegalArgumentException) {
            // OkHttp 只认 http 和 https，网址不合法也在这里。JS 还没拿到 Promise，
            // Settle 本来就排到下一轮
            settle.reject(callId, "TypeError", "Invalid URL: ${e.message ?: url}")
            return 0
        }
        val requestId = nextRequestId++
        val task = Task(requestId, callId)
        tasks[requestId] = task
        val call = client.newCall(request)
        task.call = call
        call.enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) = finish(task, e)
            override fun onResponse(call: Call, response: Response) = received(task, response)
        })
        return requestId
    }

    private fun buildRequest(url: String, optionsJson: String, requestBody: NacreBlob?): Request {
        val options = runCatching { JSONObject(optionsJson) }.getOrDefault(JSONObject())
        val method = options.optString("method", "GET").uppercase()
        val headers = Headers.Builder()
        val pairs = options.optJSONArray("headers") ?: JSONArray()
        for (i in 0 until pairs.length()) {
            val pair = pairs.optJSONArray(i) ?: continue
            if (pair.length() != 2) continue
            // 用 add 不用 set：同名多值要保留
            headers.addUnsafeNonAscii(pair.getString(0), pair.getString(1))
        }
        // 请求体只认 Blob：字符串、ArrayBuffer、类型数组在 JS 侧都已经包成了 Blob。
        // POST 这类方法没有请求体时 OkHttp 也要一个空的
        val body = when {
            requestBody != null -> requestBody.data.toRequestBody()
            method in METHODS_WITH_BODY -> ByteArray(0).toRequestBody()
            else -> null
        }
        return Request.Builder().url(url).headers(headers.build()).method(method, body).build()
    }

    // 响应头到了：现在就兑现 Response，body 在这个线程上接着读
    private fun received(task: Task, response: Response) {
        val headerPairs = JSONArray()
        for ((name, value) in response.headers) headerPairs.put(JSONArray().put(name).put(value))
        val payload = JSONObject()
            .put("requestId", task.requestId)
            .put("status", response.code)
            .put("url", response.request.url.toString())
            .put("headers", headerPairs)
        synchronized(task.lock) { task.responded = true }
        settle.json(task.callId, payload.toString())

        var failure: IOException? = null
        try {
            response.body.source().use { source ->
                val chunk = ByteArray(64 * 1024)
                while (true) {
                    val n = source.read(chunk)
                    if (n < 0) break
                    synchronized(task.lock) {
                        task.body.write(chunk, 0, n)
                        if (task.streaming && task.pendingCallId != 0) {
                            val waiting = task.pendingCallId
                            task.pendingCallId = 0
                            deliverChunk(task, waiting)
                        }
                        // 攒够了还没人来读：先别收了，等读走
                        while (task.streaming && !task.cancelled &&
                               task.body.size() >= STREAM_HIGH_WATER_MARK) {
                            task.lock.wait()
                        }
                    }
                }
            }
        } catch (e: IOException) {
            failure = e
        } catch (e: InterruptedException) {
            failure = IOException("interrupted", e)
        }
        finish(task, failure)
    }

    // 请求结束了（下完了，或者失败了）
    private fun finish(task: Task, error: IOException?) {
        synchronized(task.lock) {
            task.completed = true
            task.error = error
            if (!task.responded) {
                // 响应头都没到就结束了（连不上、超时、被取消）：拒绝 fetch 的 Promise。
                // JS 那边没有建出 Response，不会有人来 release，记录在这里删掉
                if (error != null) reject(task, task.callId)
                tasks.remove(task.requestId)
                return
            }
            // 响应头到了之后才结束的：错误留在记录里，等读 body 时交出去
            if (task.pendingCallId != 0) {
                val waiting = task.pendingCallId
                task.pendingCallId = 0
                if (task.pendingKind == "chunk") deliverChunk(task, waiting)
                else deliverBody(task, task.pendingKind ?: "text", waiting)
            }
        }
    }

    // 要持有 task.lock
    private fun reject(task: Task, callId: Int) {
        if (task.cancelled) {
            settle.reject(callId, "AbortError", "The operation was aborted")
        } else {
            settle.reject(callId, "TypeError", "Network request failed: ${task.error?.message ?: "unknown error"}")
        }
    }

    // 把整个 body 交出去。重活（UTF-8 解码）在 work 线程池上做。要持有 task.lock
    private fun deliverBody(task: Task, kind: String, callId: Int) {
        if (task.error != null) {
            reject(task, callId)
            return
        }
        val data = task.body.toByteArray()
        work.execute {
            when (kind) {
                "text" -> settle.json(callId, JSONObject.quote(NacreBlob.decodeUtf8(data)))
                // blob：字节不进 V8 的堆，JS 侧只拿一个句柄
                "blob" -> settle.obj(callId, NacreBlob(data, ""))
                else -> settle.bytes(callId, data)
            }
        }
    }

    // 按块读：把现在攒下的全部字节作为一块交出去。要持有 task.lock。
    // 出错优先于剩下的字节：请求失败之后，还没读走的那一截不再给（和 Web 的流出错时
    // 丢掉队列里的块一致）
    private fun deliverChunk(task: Task, callId: Int) {
        if (task.error != null) {
            reject(task, callId)
            return
        }
        if (task.body.size() == 0) {
            // 下完了，也读完了：用 null 表示没有了
            settle.json(callId, "null")
            return
        }
        val chunk = task.body.toByteArray()
        task.body = ByteArrayOutputStream()
        task.lock.notifyAll()   // 读走了，读 body 的线程接着收
        settle.bytes(callId, chunk)
    }

    fun readBody(requestId: Int, kind: String, callId: Int) {
        val task = tasks[requestId]
        if (task == null) {
            settle.reject(callId, "TypeError", "this request is gone")
            return
        }
        synchronized(task.lock) {
            if (kind == "chunk") {
                // 按块读。第一次来的时候，之前攒下的（可能已经是整个 body）一次给完
                task.streaming = true
                if (task.body.size() > 0 || task.completed) deliverChunk(task, callId)
                else {
                    task.pendingCallId = callId
                    task.pendingKind = kind
                }
                return
            }
            if (task.completed) deliverBody(task, kind, callId)
            else {
                // body 还在下，记下来等完成时再给
                task.pendingCallId = callId
                task.pendingKind = kind
            }
        }
    }

    fun cancel(requestId: Int) {
        val task = tasks[requestId] ?: return
        stop(task)
    }

    private fun stop(task: Task) {
        synchronized(task.lock) {
            task.cancelled = true
            task.lock.notifyAll()   // 读 body 的线程可能停在背压上
        }
        task.call?.cancel()
    }

    // 这个请求的内容不会再有人读了：Response 被回收了，或者它的流被取消了。
    // 有人正等着下一块的话，在这里结算掉，不然 JS 那边会一直等
    fun release(requestId: Int) {
        val task = tasks.remove(requestId) ?: return
        synchronized(task.lock) {
            if (task.pendingCallId != 0) {
                val waiting = task.pendingCallId
                task.pendingCallId = 0
                settle.reject(waiting, "AbortError", "The operation was aborted")
            }
        }
        // 还没下完就没人要了：停掉下载，不然它会在后台下完再整个扔掉
        if (!task.completed) stop(task)
    }

    // 运行时关掉时：停掉所有请求
    fun close() {
        for (task in tasks.values) stop(task)
        tasks.clear()
        work.shutdownNow()
    }

    companion object {
        // 按块读的请求最多攒多少字节就暂停读，和 iOS 一样 1 MiB
        private const val STREAM_HIGH_WATER_MARK = 1 shl 20

        // OkHttp 要求这几种方法一定带请求体（它自己的判断在 internal 包里，不用）
        private val METHODS_WITH_BODY = setOf("POST", "PUT", "PATCH", "PROPPATCH", "REPORT")
    }
}
