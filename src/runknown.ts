
export function encode (data: Buffer, buf: Buffer, offset: number) {
  if (!buf) buf = Buffer.allocUnsafe(encodingLength(data))
  if (!offset) offset = 0

  buf.writeUInt16BE(data.length, offset)
  data.copy(buf, offset + 2)

  encode.bytes = data.length + 2
  return buf
}

encode.bytes = 0

export function decode (buf: Buffer, offset: number) {
  if (!offset) offset = 0

  const len = buf.readUInt16BE(offset)
  const data = buf.slice(offset + 2, offset + 2 + len)
  decode.bytes = len + 2
  return data
}

decode.bytes = 0

export function encodingLength (data: Buffer) {
  return data.length + 2
}
