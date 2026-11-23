// 引擎打包参数的格式（core/engine/Engine.cpp 的 PackInto）读成 Kotlin 的值。
// 格式改了，这里和 iOS 的 PackedReader（NacreConvert.mm）一起改。
//
//   开头一个字节 0x01，然后是一个值：
//   z            null（undefined、函数、Symbol、非有限数也写成它）
//   t / f        true / false
//   d + 8 字节   double，小端
//   s + u32 n + n 个 UTF-16 码元（小端）
//   a + u32 n + n 个值
//   o + u32 n + n 个（u32 长度的 UTF-16 键 + 值）
package nacre.runtime

import java.nio.ByteBuffer
import java.nio.ByteOrder

internal object Packed {
    private const val MAGIC: Byte = 0x01

    // 读出来是 null、Boolean、Double、String、List<Any?>、Map<String, Any?> 之一。
    // 格式不对时当成 null，和 iOS 一样
    fun decode(bytes: ByteArray): Any? {
        if (bytes.isEmpty() || bytes[0] != MAGIC) return null
        val buffer = ByteBuffer.wrap(bytes, 1, bytes.size - 1).order(ByteOrder.LITTLE_ENDIAN)
        return try {
            val value = read(buffer)
            if (buffer.hasRemaining()) null else value
        } catch (_: RuntimeException) {
            null
        }
    }

    private fun read(buffer: ByteBuffer): Any? = when (buffer.get().toInt().toChar()) {
        'z' -> null
        't' -> true
        'f' -> false
        'd' -> buffer.double
        's' -> readString(buffer)
        'a' -> List(count(buffer)) { read(buffer) }
        'o' -> {
            val n = count(buffer)
            val map = LinkedHashMap<String, Any?>(n)
            repeat(n) {
                val key = readString(buffer)
                map[key] = read(buffer)
            }
            map
        }
        else -> throw IllegalArgumentException("bad tag")
    }

    private fun count(buffer: ByteBuffer): Int {
        val n = buffer.int
        require(n >= 0 && n <= buffer.remaining()) { "bad length" }
        return n
    }

    private fun readString(buffer: ByteBuffer): String {
        val n = buffer.int
        require(n >= 0 && n.toLong() * 2 <= buffer.remaining()) { "bad length" }
        val chars = CharArray(n) { buffer.char }
        return String(chars)
    }
}
