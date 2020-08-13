import * as ip from 'ip'

export function encode (host: string, buf: Buffer, offset: number) {
  if (!buf) { buf = Buffer.allocUnsafe(encodingLength()) }
  if (!offset) { offset = 0 }

  buf.writeUInt16BE(4, offset)
  offset += 2
  ip.toBuffer(host, buf, offset)
  encode.bytes = 6
  return buf
}
encode.bytes = 0

export function decode (buf: Buffer, offset: number) {
  if (!offset) { offset = 0 }

  offset += 2
  const host = ip.toString(buf, offset, 4)
  decode.bytes = 6
  return host
}
decode.bytes = 0
export function encodingLength () {
  return 6
}
