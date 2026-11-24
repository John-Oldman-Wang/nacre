#!/usr/bin/env python3
# 生成验收用的字体文件 assets/fonts/tall.ttf。
#
# 自己拼的一个最小 TrueType 字体，不用任何现成的字体（免得带进别人的许可）。
# 它只有一个特点：行特别高。一个 em 是 1000，上伸 2000、下伸 1000，所以排出来的
# 行高是字号的 3 倍（系统字体大约 1.17 倍）。验收靠读 lineHeight 判断字体真的换上了。
# ASCII 的可见字符（0x20–0x7E）全映射到同一个方块字形。
#
#   python3 acceptance-android/scripts/make-test-font.py
import os
import struct

UPM = 1000
ASCENT = 2000
DESCENT = -1000
BOX_W, BOX_H, ADVANCE = 600, 700, 700
FIRST, LAST = 0x20, 0x7E


def checksum(data):
    data += b'\0' * (-len(data) % 4)
    return sum(struct.unpack('>%dI' % (len(data) // 4), data)) & 0xFFFFFFFF


def name_table():
    names = {1: 'NacreTall', 2: 'Regular', 4: 'NacreTall Regular', 6: 'NacreTall-Regular'}
    records, strings = b'', b''
    for name_id, text in names.items():
        raw = text.encode('utf-16-be')
        records += struct.pack('>6H', 3, 1, 0x409, name_id, len(raw), len(strings))
        strings += raw
    return struct.pack('>3H', 0, len(names), 6 + len(records)) + records + strings


def cmap_table():
    seg_count = 2
    glyph_ids = [1] * (LAST - FIRST + 1)
    sub = struct.pack('>4H', seg_count * 2, 4, 1, 0)  # segCountX2 searchRange entrySelector rangeShift
    sub += struct.pack('>2H', LAST, 0xFFFF)            # endCode
    sub += struct.pack('>H', 0)                        # reservedPad
    sub += struct.pack('>2H', FIRST, 0xFFFF)           # startCode
    sub += struct.pack('>2h', 0, 1)                    # idDelta
    sub += struct.pack('>2H', seg_count * 2, 0)        # idRangeOffset：第一段指到 glyphIdArray
    sub += struct.pack('>%dH' % len(glyph_ids), *glyph_ids)
    body = struct.pack('>3H', 4, 6 + len(sub), 0) + sub
    return struct.pack('>2H', 0, 1) + struct.pack('>2HI', 3, 1, 12) + body


def glyf_loca():
    box = struct.pack('>5h', 1, 0, 0, BOX_W, BOX_H)
    box += struct.pack('>H', 3)          # endPtsOfContours
    box += struct.pack('>H', 0)          # instructionLength
    box += bytes([1, 1, 1, 1])           # 四个点都在曲线上，坐标是两字节的
    box += struct.pack('>4h', 0, 0, BOX_W, 0)        # x 的增量
    box += struct.pack('>4h', 0, BOX_H, 0, -BOX_H)   # y 的增量
    box += b'\0' * (-len(box) % 4)
    loca = struct.pack('>3H', 0, 0, len(box) // 2)
    return box, loca


def font():
    glyf, loca = glyf_loca()
    tables = {
        'OS/2': struct.pack('>HhHHH10hh10s4I4sHHHhhhHHIIhhHHH',
                            4, ADVANCE, 400, 5, 0,
                            650, 600, 0, 75, 650, 600, 0, 350, 50, 250,
                            0, b'\0' * 10, 1, 0, 0, 0, b'NONE',
                            0x40 | 0x80, FIRST, LAST,
                            ASCENT, DESCENT, 0, ASCENT, -DESCENT, 1, 0,
                            500, BOX_H, 0, 0x20, 0),
        'cmap': cmap_table(),
        'glyf': glyf,
        'head': struct.pack('>IIIIHHqqhhhhHHhhh',
                            0x00010000, 0x00010000, 0, 0x5F0F3CF5, 0x000B, UPM, 0, 0,
                            0, 0, BOX_W, BOX_H, 0, 8, 2, 0, 0),
        'hhea': struct.pack('>Ihhh H hhh hhh 4h hH'.replace(' ', ''),
                            0x00010000, ASCENT, DESCENT, 0, ADVANCE, 0, 0, BOX_W,
                            1, 0, 0, 0, 0, 0, 0, 0, 2),
        'hmtx': struct.pack('>4H', 500, 0, ADVANCE, 0),
        'loca': loca,
        'maxp': struct.pack('>I14H', 0x00010000, 2, 4, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0),
        'name': name_table(),
        'post': struct.pack('>IIhhIIIII', 0x00030000, 0, -100, 50, 0, 0, 0, 0, 0),
    }
    tags = sorted(tables)
    n = len(tags)
    search = 1 << (n.bit_length() - 1)
    header = struct.pack('>IHHHH', 0x00010000, n, search * 16, search.bit_length() - 1, n * 16 - search * 16)
    offset = 12 + 16 * n
    directory, body = b'', b''
    for tag in tags:
        data = tables[tag]
        directory += struct.pack('>4sIII', tag.encode('ascii'), checksum(data), offset + len(body), len(data))
        body += data + b'\0' * (-len(data) % 4)
    out = bytearray(header + directory + body)
    # head.checkSumAdjustment：整个文件的校验和凑成 0xB1B0AFBA
    head_offset = 12 + 16 * n + sum(len(tables[t]) + (-len(tables[t]) % 4) for t in tags[:tags.index('head')])
    struct.pack_into('>I', out, head_offset + 8, (0xB1B0AFBA - checksum(bytes(out))) & 0xFFFFFFFF)
    return bytes(out)


if __name__ == '__main__':
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'fonts', 'tall.ttf')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'wb') as f:
        f.write(font())
    print(os.path.normpath(path))
