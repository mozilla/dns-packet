export function encode (s: string, buf?: Buffer, offset = 0) {
  if (!buf) buf = Buffer.allocUnsafe(encodingLength(s))
  if (!offset) offset = 0

  const len = buf.write(s, offset + 1)
  buf[offset] = len
  encode.bytes = len + 1
  return buf
}

encode.bytes = 0

export function decode (buf: Buffer, offset = 0) {
  if (!offset) offset = 0

  const len = buf[offset]
  const s = buf.toString('utf-8', offset + 1, offset + 1 + len)
  decode.bytes = len + 1
  return s
}

decode.bytes = 0

export function encodingLength (s: string) {
  return Buffer.byteLength(s) + 1
}
