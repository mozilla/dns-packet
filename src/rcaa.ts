import * as string from './string'

export interface CAAValue {
  flags: number
  tag: string
  value: string
  issuerCritical: boolean
}

export const ISSUER_CRITICAL = 1 << 7

export function encode (data: CAAValue, buf: Buffer, offset: number) {
  const len = encodingLength(data)

  if (!buf) buf = Buffer.allocUnsafe(encodingLength(data))
  if (!offset) offset = 0

  if (data.issuerCritical) {
    data.flags = ISSUER_CRITICAL
  }

  buf.writeUInt16BE(len - 2, offset)
  offset += 2
  buf.writeUInt8(data.flags || 0, offset)
  offset += 1
  string.encode(data.tag, buf, offset)
  offset += string.encode.bytes
  buf.write(data.value, offset)
  offset += Buffer.byteLength(data.value)

  encode.bytes = len
  return buf
}

encode.bytes = 0

export function decode (buf: Buffer, offset: number) {
  if (!offset) offset = 0

  const len = buf.readUInt16BE(offset)
  offset += 2

  const oldOffset = offset
  const data: CAAValue = {} as any
  data.flags = buf.readUInt8(offset)
  offset += 1
  data.tag = string.decode(buf, offset)
  offset += string.decode.bytes
  data.value = buf.toString('utf-8', offset, oldOffset + len)

  data.issuerCritical = !!(data.flags & ISSUER_CRITICAL)

  decode.bytes = len + 2

  return data
}

decode.bytes = 0

export function encodingLength (data: CAAValue) {
  return string.encodingLength(data.tag) + string.encodingLength(data.value) + 2
}
