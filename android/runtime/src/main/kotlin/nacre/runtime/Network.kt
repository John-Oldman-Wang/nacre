// fetch 和 WebSocket 共用的一个 OkHttp 客户端：连接池、线程都是一份。
package nacre.runtime

import okhttp3.Dispatcher
import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit

internal object Network {
    // 超时和 iOS 的 NSURLSession 默认一样：60 秒没有任何数据进出才算超时，整个请求不限
    // 时长（网页的 fetch 本来就没有总时长的限制）。OkHttp 默认是各 10 秒，慢一点的服务就超了。
    // 每个主机最多同时 64 个请求：OkHttp 默认 5 个，并发的请求会被排成几轮
    val client: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(60, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .dispatcher(Dispatcher().apply { maxRequestsPerHost = 64 })
            .build()
    }
}
