import * as string from './string'

export interface HInfoValue {
  cpu: string
  os: string
}

export function encode (data: HInfoValue, buf?: Buffer, offset = 0) {
  if (!buf) buf = Buffer.allocUnsafe(encodingLength(data))
  if (!offset) offset = 0

  const oldOffset = offset
  offset += 2
  string.encode(data.cpu, buf, offset)
  offset += string.encode.bytes
  string.encode(data.os, buf, offset)
  offset += string.encode.bytes
  buf.writeUInt16BE(offset - oldOffset - 2, oldOffset)
  encode.bytes = offset - oldOffset
  return buf
}

encode.bytes = 0
export function decode (buf: Buffer, offset = 0) {
  if (!offset) offset = 0

  const oldOffset = offset

  const data: HInfoValue = {} as any
  offset += 2
  data.cpu = string.decode(buf, offset)
  offset += string.decode.bytes
  data.os = string.decode(buf, offset)
  offset += string.decode.bytes
  decode.bytes = offset - oldOffset
  return data
}

decode.bytes = 0
export function encodingLength (data: HInfoValue) {
  return string.encodingLength(data.cpu) + string.encodingLength(data.os) + 2
}
