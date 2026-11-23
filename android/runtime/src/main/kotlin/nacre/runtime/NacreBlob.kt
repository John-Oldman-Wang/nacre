// Blob 在原生这一侧：一段不可变的字节加一个类型。JS 那边的 Blob 只拿着它的句柄，
// 字节不进 V8 的堆（core/builtin/parts/23-fetch.js）。
package nacre.runtime

import org.json.JSONArray
import java.nio.ByteBuffer
import java.nio.CharBuffer
import java.nio.charset.CodingErrorAction

internal class NacreBlob(val data: ByteArray, val type: String) {
    companion object {
        // 落单的代理项编成 U+FFFD（EF BF BD），和 Web 一样。String.toByteArray 会编成 '?'
        private val REPLACEMENT = byteArrayOf(0xEF.toByte(), 0xBF.toByte(), 0xBD.toByte())

        fun utf8(text: String): ByteArray {
            val encoder = Charsets.UTF_8.newEncoder()
                .onMalformedInput(CodingErrorAction.REPLACE)
                .onUnmappableCharacter(CodingErrorAction.REPLACE)
                .replaceWith(REPLACEMENT)
            val out = encoder.encode(CharBuffer.wrap(text))
            return ByteArray(out.remaining()).also { out.get(it) }
        }

        // UTF-8 解码，照 Web 的 TextDecoder：开头的 BOM 去掉，不合法的字节换成 U+FFFD
        fun decodeUtf8(data: ByteArray): String {
            val decoder = Charsets.UTF_8.newDecoder()
                .onMalformedInput(CodingErrorAction.REPLACE)
                .onUnmappableCharacter(CodingErrorAction.REPLACE)
            val text = decoder.decode(ByteBuffer.wrap(data)).toString()
            return if (text.startsWith('﻿')) text.substring(1) else text
        }

        // new Blob(parts, { type })。parts 是 JSON 数组：字符串项直接给，字节项是 null，
        // 真正的字节按同样的下标放在 buffers 里
        fun fromParts(partsJson: String, buffers: Array<ByteArray?>, type: String): NacreBlob {
            val parts = JSONArray(partsJson)
            val out = java.io.ByteArrayOutputStream()
            for (i in 0 until parts.length()) {
                val bytes = buffers.getOrNull(i)
                    ?: if (parts.isNull(i)) ByteArray(0) else utf8(parts.get(i).toString())
                out.write(bytes)
            }
            return NacreBlob(out.toByteArray(), type)
        }
    }
}
