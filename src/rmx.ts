import * as name from './name'

export interface MXValue {
  preference: number
  exchange: string
}

export function encode (data: MXValue, buf: Buffer, offset: number) {
  if (!buf) { buf = Buffer.allocUnsafe(encodingLength(data)) }
  if (!offset) { offset = 0 }

  const oldOffset = offset
  offset += 2
  buf.writeUInt16BE(data.preference || 0, offset)
  offset += 2
  name.encode(data.exchange, buf, offset)
  offset += name.encode.bytes

  buf.writeUInt16BE(offset - oldOffset - 2, oldOffset)
  encode.bytes = offset - oldOffset
  return buf
}
encode.bytes = 0

export function decode (buf: Buffer, offset: number) {
  if (!offset) { offset = 0 }

  const oldOffset = offset

  const data: MXValue = {} as any
  offset += 2
  data.preference = buf.readUInt16BE(offset)
  offset += 2
  data.exchange = name.decode(buf, offset)
  offset += name.decode.bytes

  decode.bytes = offset - oldOffset
  return data
}

decode.bytes = 0

export function encodingLength (data: MXValue) {
  return 4 + name.encodingLength(data.exchange)
}
