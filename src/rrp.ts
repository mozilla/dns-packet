import * as name from './name'

export interface RPValue {
  mbox: string
  txt: string
}

export function encode (data: RPValue, buf?: Buffer, offset = 0) {
  if (!buf) { buf = Buffer.allocUnsafe(encodingLength(data)) }
  if (!offset) { offset = 0 }
  const oldOffset = offset

  offset += 2 // Leave space for length
  name.encode(data.mbox || '.', buf, offset)
  offset += name.encode.bytes
  name.encode(data.txt || '.', buf, offset)
  offset += name.encode.bytes
  encode.bytes = offset - oldOffset
  buf.writeUInt16BE(encode.bytes - 2, oldOffset)
  return buf
}
encode.bytes = 0

export function decode (buf: Buffer, offset = 0) {
  if (!offset) { offset = 0 }
  const oldOffset = offset

  const data: RPValue = {} as any
  offset += 2
  data.mbox = name.decode(buf, offset) || '.'
  offset += name.decode.bytes
  data.txt = name.decode(buf, offset) || '.'
  offset += name.decode.bytes
  decode.bytes = offset - oldOffset
  return data
}
decode.bytes = 0
export function encodingLength (data: RPValue) {
  return 2 + name.encodingLength(data.mbox || '.') + name.encodingLength(data.txt || '.')
}
