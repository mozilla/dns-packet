export function encode (str: string, buf?: Buffer, offset?: number) {
  if (!buf) buf = Buffer.allocUnsafe(encodingLength(str))
  if (!offset) offset = 0
  const oldOffset = offset

  // strip leading and trailing .
  const n = str.replace(/^\.|\.$/gm, '')
  if (n.length) {
    const list = n.split('.')

    for (let i = 0; i < list.length; i++) {
      const len = buf.write(list[i], offset + 1)
      buf[offset] = len
      offset += len + 1
    }
  }

  buf[offset++] = 0

  encode.bytes = offset - oldOffset
  return buf
}

encode.bytes = 0

export function decode (buf: Buffer, offset: number): string {
  if (!offset) offset = 0

  const list = []
  const oldOffset = offset
  let len = buf[offset++]

  if (len === 0) {
    decode.bytes = 1
    return '.'
  }
  if (len >= 0xc0) {
    const res = decode(buf, buf.readUInt16BE(offset - 1) - 0xc000)
    decode.bytes = 2
    return res
  }

  while (len) {
    if (len >= 0xc0) {
      list.push(decode(buf, buf.readUInt16BE(offset - 1) - 0xc000))
      offset++
      break
    }

    list.push(buf.toString('utf-8', offset, offset + len))
    offset += len
    len = buf[offset++]
  }

  decode.bytes = offset - oldOffset
  return list.join('.')
}

decode.bytes = 0

export function encodingLength (n: string) {
  if (n === '.') return 1
  return Buffer.byteLength(n) + 2
}
