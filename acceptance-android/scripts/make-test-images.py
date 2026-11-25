#!/usr/bin/env python3
# 生成验收用的图片，放在 assets/images/。
#
# 全是脚本自己拼的字节，不用任何现成的图（免得带进别人的许可），也不依赖第三方库。
#
#   halves.png  40 × 30，左半边纯红（#ff0000）、右半边纯蓝（#0000ff），不透明。
#               验收靠读像素判断真的解对了、缩小和裁切对不对
#   alpha.png   20 × 10，全是半透明的红（#ff000080）。不透明的图 Android 不算预乘，
#               验 isPremultiplied 和 unpremultipliedRequired 要用带透明度的图
#   spin.gif    8 × 8 的动图，两帧：红、绿，每帧 100 毫秒，无限循环（NETSCAPE2.0 的循环次数是 0）
#
#   python3 acceptance-android/scripts/make-test-images.py
import os
import struct
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'assets', 'images')


def png(width, height, pixel, color_type=2):
    def chunk(kind, data):
        body = kind + data
        return struct.pack('>I', len(data)) + body + struct.pack('>I', zlib.crc32(body) & 0xFFFFFFFF)

    raw = bytearray()
    for y in range(height):
        raw.append(0)  # 这一行不做预测
        for x in range(width):
            raw.extend(pixel(x, y))
    ihdr = struct.pack('>IIBBBBB', width, height, 8, color_type, 0, 0, 0)  # 8 位；2 是 RGB，6 是 RGBA
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) +
            chunk(b'IDAT', zlib.compress(bytes(raw))) + chunk(b'IEND', b''))


def lzw(indices, min_code_size):
    # GIF 的 LZW：变长码，低位在前
    clear = 1 << min_code_size
    end = clear + 1
    out = []
    bits = 0
    nbits = 0
    code_size = min_code_size + 1

    def emit(code):
        nonlocal bits, nbits
        bits |= code << nbits
        nbits += code_size
        while nbits >= 8:
            out.append(bits & 0xFF)
            bits >>= 8
            nbits -= 8

    table = {(i,): i for i in range(clear)}
    next_code = end + 1
    emit(clear)
    current = (indices[0],)
    for index in indices[1:]:
        candidate = current + (index,)
        if candidate in table:
            current = candidate
            continue
        emit(table[current])
        if next_code < 4096:
            table[candidate] = next_code
            next_code += 1
            if next_code > (1 << code_size) and code_size < 12:
                code_size += 1
        current = (index,)
    emit(table[current])
    emit(end)
    if nbits > 0:
        out.append(bits & 0xFF)
    data = bytes(out)
    blocks = bytearray()
    for i in range(0, len(data), 255):
        part = data[i:i + 255]
        blocks.append(len(part))
        blocks.extend(part)
    blocks.append(0)
    return bytes(blocks)


def gif(width, height, palette, frames, delay_cs):
    # 调色板 4 色（2 位）
    table = b''.join(bytes(c) for c in palette)
    out = bytearray(b'GIF89a')
    out += struct.pack('<HHBBB', width, height, 0x80 | 0x01, 0, 0)  # 全局调色板，2^(1+1) = 4 色
    out += table
    # NETSCAPE2.0：循环次数 0 = 无限
    out += b'\x21\xff\x0bNETSCAPE2.0\x03\x01' + struct.pack('<H', 0) + b'\x00'
    for index in frames:
        out += b'\x21\xf9\x04' + struct.pack('<BHBB', 0x04, delay_cs, 0, 0)  # 不处置、不透明
        out += b'\x2c' + struct.pack('<HHHHB', 0, 0, width, height, 0)
        out += bytes([2]) + lzw([index] * (width * height), 2)
    out += b'\x3b'
    return bytes(out)


def main():
    os.makedirs(OUT, exist_ok=True)
    halves = png(40, 30, lambda x, y: (255, 0, 0) if x < 20 else (0, 0, 255))
    with open(os.path.join(OUT, 'halves.png'), 'wb') as f:
        f.write(halves)
    alpha = png(20, 10, lambda x, y: (255, 0, 0, 128), color_type=6)
    with open(os.path.join(OUT, 'alpha.png'), 'wb') as f:
        f.write(alpha)
    spin = gif(8, 8, [(255, 0, 0), (0, 255, 0), (0, 0, 255), (0, 0, 0)], [0, 1], 10)
    with open(os.path.join(OUT, 'spin.gif'), 'wb') as f:
        f.write(spin)
    print('halves.png', len(halves), 'bytes; alpha.png', len(alpha), 'bytes; spin.gif', len(spin), 'bytes')


if __name__ == '__main__':
    main()
