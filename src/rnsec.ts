import * as name from './name'
import * as typebitmap from './typebitmap'

export interface NSECValue {
  nextDomain: string
  rrtypes: string[]
}

export function encode (record: NSECValue, buf: Buffer, offset: number) {
  if (!buf) { buf = Buffer.allocUnsafe(encodingLength(record)) }
  if (!offset) { offset = 0 }
  const oldOffset = offset

  offset += 2 // Leave space for length
  name.encode(record.nextDomain, buf, offset)
  offset += name.encode.bytes
  typebitmap.encode(record.rrtypes, buf, offset)
  offset += typebitmap.encode.bytes

  encode.bytes = offset - oldOffset
  buf.writeUInt16BE(encode.bytes - 2, oldOffset)
  return buf
}

encode.bytes = 0

export function decode (buf: Buffer, offset: number) {
  if (!offset) { offset = 0 }
  const oldOffset = offset

  var record: NSECValue = {} as any
  var length = buf.readUInt16BE(offset)
  offset += 2
  record.nextDomain = name.decode(buf, offset)
  offset += name.decode.bytes
  record.rrtypes = typebitmap.decode(buf, offset, length - (offset - oldOffset))
  offset += typebitmap.decode.bytes

  decode.bytes = offset - oldOffset
  return record
}
decode.bytes = 0
export function encodingLength (record: NSECValue) {
  return 2 +
    name.encodingLength(record.nextDomain) +
    typebitmap.encodingLength(record.rrtypes)
}
