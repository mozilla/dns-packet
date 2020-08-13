import * as typebitmap from './typebitmap'

export interface NSEC3Value {
  algorithm: number
  flags: number
  iterations: number
  salt: Buffer
  nextDomain: Buffer
  rrtypes: string[]
}

export function encode (record: NSEC3Value, buf: Buffer, offset: number) {
  if (!buf) { buf = Buffer.allocUnsafe(encodingLength(record)) }
  if (!offset) { offset = 0 }
  const oldOffset = offset

  const salt = record.salt
  if (!Buffer.isBuffer(salt)) {
    throw new Error('salt must be a Buffer')
  }

  const nextDomain = record.nextDomain
  if (!Buffer.isBuffer(nextDomain)) {
    throw new Error('nextDomain must be a Buffer')
  }

  offset += 2 // Leave space for length
  buf.writeUInt8(record.algorithm, offset)
  offset += 1
  buf.writeUInt8(record.flags, offset)
  offset += 1
  buf.writeUInt16BE(record.iterations, offset)
  offset += 2
  buf.writeUInt8(salt.length, offset)
  offset += 1
  salt.copy(buf, offset, 0, salt.length)
  offset += salt.length
  buf.writeUInt8(nextDomain.length, offset)
  offset += 1
  nextDomain.copy(buf, offset, 0, nextDomain.length)
  offset += nextDomain.length
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

  var record: NSEC3Value = {} as any
  var length = buf.readUInt16BE(offset)
  offset += 2
  record.algorithm = buf.readUInt8(offset)
  offset += 1
  record.flags = buf.readUInt8(offset)
  offset += 1
  record.iterations = buf.readUInt16BE(offset)
  offset += 2
  const saltLength = buf.readUInt8(offset)
  offset += 1
  record.salt = buf.slice(offset, offset + saltLength)
  offset += saltLength
  const hashLength = buf.readUInt8(offset)
  offset += 1
  record.nextDomain = buf.slice(offset, offset + hashLength)
  offset += hashLength
  record.rrtypes = typebitmap.decode(buf, offset, length - (offset - oldOffset))
  offset += typebitmap.decode.bytes

  decode.bytes = offset - oldOffset
  return record
}

decode.bytes = 0

export function encodingLength (record: NSEC3Value) {
  return 8 +
    record.salt.length +
    record.nextDomain.length +
    typebitmap.encodingLength(record.rrtypes)
}
