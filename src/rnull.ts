
export function encode (data: string | Buffer, buf?: Buffer, offset = 0) {
  if (!buf) buf = Buffer.allocUnsafe(encodingLength(data))
  if (!offset) offset = 0

  if (typeof data === 'string') data = Buffer.from(data)
  if (!data) data = Buffer.allocUnsafe(0)

  const oldOffset = offset
  offset += 2

  const len = data.length
  data.copy(buf, offset, 0, len)
  offset += len

  buf.writeUInt16BE(offset - oldOffset - 2, oldOffset)
  encode.bytes = offset - oldOffset
  return buf
}

encode.bytes = 0

export function decode (buf: Buffer, offset = 0) {
  if (!offset) offset = 0
  const oldOffset = offset
  const len = buf.readUInt16BE(offset)

  offset += 2

  const data = buf.slice(offset, offset + len)
  offset += len

  decode.bytes = offset - oldOffset
  return data
}

decode.bytes = 0

export function encodingLength (data: Buffer | string) {
  if (!data) return 2
  return (Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data)) + 2
}
