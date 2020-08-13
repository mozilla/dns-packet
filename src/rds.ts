
export interface DSValue {
  keyTag: number
  algorithm: number
  digestType: number
  digest: Buffer
}

export function encode (digest: DSValue, buf: Buffer, offset: number) {
  if (!buf) { buf = Buffer.allocUnsafe(encodingLength(digest)) }
  if (!offset) { offset = 0 }
  const oldOffset = offset

  const digestdata = digest.digest
  if (!Buffer.isBuffer(digestdata)) {
    throw new Error('Digest must be a Buffer')
  }

  offset += 2 // Leave space for length
  buf.writeUInt16BE(digest.keyTag, offset)
  offset += 2
  buf.writeUInt8(digest.algorithm, offset)
  offset += 1
  buf.writeUInt8(digest.digestType, offset)
  offset += 1
  digestdata.copy(buf, offset, 0, digestdata.length)
  offset += digestdata.length

  encode.bytes = offset - oldOffset
  buf.writeUInt16BE(encode.bytes - 2, oldOffset)
  return buf
}

encode.bytes = 0

export function decode (buf: Buffer, offset: number) {
  if (!offset) { offset = 0 }
  const oldOffset = offset

  var digest: DSValue = {} as any
  var length = buf.readUInt16BE(offset)
  offset += 2
  digest.keyTag = buf.readUInt16BE(offset)
  offset += 2
  digest.algorithm = buf.readUInt8(offset)
  offset += 1
  digest.digestType = buf.readUInt8(offset)
  offset += 1
  digest.digest = buf.slice(offset, oldOffset + length + 2)
  offset += digest.digest.length
  decode.bytes = offset - oldOffset
  return digest
}

decode.bytes = 0

export function encodingLength (digest: DSValue) {
  return 6 + Buffer.byteLength(digest.digest)
}
