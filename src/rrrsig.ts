import * as types from './types'
import * as name from './name'

export interface RRSIGValue {
  typeCovered: string
  algorithm: number
  labels: number
  originalTTL: number
  expiration: number
  inception: number
  keyTag: number
  signersName: string
  signature: Buffer
}

export function encode (sig: RRSIGValue, buf: Buffer, offset: number) {
  if (!buf) { buf = Buffer.allocUnsafe(encodingLength(sig)) }
  if (!offset) { offset = 0 }
  const oldOffset = offset

  const signature = sig.signature
  if (!Buffer.isBuffer(signature)) {
    throw new Error('Signature must be a Buffer')
  }

  offset += 2 // Leave space for length
  buf.writeUInt16BE(types.toType(sig.typeCovered), offset)
  offset += 2
  buf.writeUInt8(sig.algorithm, offset)
  offset += 1
  buf.writeUInt8(sig.labels, offset)
  offset += 1
  buf.writeUInt32BE(sig.originalTTL, offset)
  offset += 4
  buf.writeUInt32BE(sig.expiration, offset)
  offset += 4
  buf.writeUInt32BE(sig.inception, offset)
  offset += 4
  buf.writeUInt16BE(sig.keyTag, offset)
  offset += 2
  name.encode(sig.signersName, buf, offset)
  offset += name.encode.bytes
  signature.copy(buf, offset, 0, signature.length)
  offset += signature.length

  encode.bytes = offset - oldOffset
  buf.writeUInt16BE(encode.bytes - 2, oldOffset)
  return buf
}
encode.bytes = 0

export function decode (buf: Buffer, offset: number) {
  if (!offset) { offset = 0 }
  const oldOffset = offset

  var sig: RRSIGValue = {} as any
  var length = buf.readUInt16BE(offset)
  offset += 2
  sig.typeCovered = types.toString(buf.readUInt16BE(offset))
  offset += 2
  sig.algorithm = buf.readUInt8(offset)
  offset += 1
  sig.labels = buf.readUInt8(offset)
  offset += 1
  sig.originalTTL = buf.readUInt32BE(offset)
  offset += 4
  sig.expiration = buf.readUInt32BE(offset)
  offset += 4
  sig.inception = buf.readUInt32BE(offset)
  offset += 4
  sig.keyTag = buf.readUInt16BE(offset)
  offset += 2
  sig.signersName = name.decode(buf, offset)
  offset += name.decode.bytes
  sig.signature = buf.slice(offset, oldOffset + length + 2)
  offset += sig.signature.length
  decode.bytes = offset - oldOffset
  return sig
}

decode.bytes = 0

export function encodingLength (sig: RRSIGValue) {
  return 20 +
    name.encodingLength(sig.signersName) +
    Buffer.byteLength(sig.signature)
}
