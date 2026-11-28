// Blob 在原生这一侧：一段不可变的字节加一个类型。JS 那边的 Blob 只拿着它的句柄，
// 字节不进 V8 的堆（core/builtin/parts/23-fetch.js）。
package nacre.runtime

import java.nio.ByteBuffer
import java.nio.charset.CodingErrorAction

internal class NacreBlob(val data: ByteArray, val type: String) {
    companion object {
        // UTF-8 解码，照 Web 的 TextDecoder：开头的 BOM 去掉，不合法的字节换成 U+FFFD
        fun decodeUtf8(data: ByteArray): String {
            val decoder = Charsets.UTF_8.newDecoder()
                .onMalformedInput(CodingErrorAction.REPLACE)
                .onUnmappableCharacter(CodingErrorAction.REPLACE)
            val text = decoder.decode(ByteBuffer.wrap(data)).toString()
            return if (text.startsWith('﻿')) text.substring(1) else text
        }

        // new Blob(parts, { type })。parts 是一段段字节，按顺序拼起来。字符串段已经由
        // 内置脚本编成 UTF-8 字节（core/builtin/parts/23-fetch.js），这里只有字节
        fun fromParts(parts: Array<ByteArray>, type: String): NacreBlob {
            val out = java.io.ByteArrayOutputStream()
            for (bytes in parts) out.write(bytes)
            return NacreBlob(out.toByteArray(), type)
        }
    }
}
