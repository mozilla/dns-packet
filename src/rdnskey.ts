export const PROTOCOL_DNSSEC = 3
export const ZONE_KEY = 0x80
export const SECURE_ENTRYPOINT = 0x8000

export interface DNSKeyValue {
  flags: number
  algorithm: number
  key: Buffer
}

export function encode (key: DNSKeyValue, buf: Buffer, offset: number) {
  if (!buf) { buf = Buffer.allocUnsafe(encodingLength(key)) }
  if (!offset) { offset = 0 }
  const oldOffset = offset

  const keydata = key.key
  if (!Buffer.isBuffer(keydata)) {
    throw new Error('Key must be a Buffer')
  }

  offset += 2 // Leave space for length
  buf.writeUInt16BE(key.flags, offset)
  offset += 2
  buf.writeUInt8(PROTOCOL_DNSSEC, offset)
  offset += 1
  buf.writeUInt8(key.algorithm, offset)
  offset += 1
  keydata.copy(buf, offset, 0, keydata.length)
  offset += keydata.length

  encode.bytes = offset - oldOffset
  buf.writeUInt16BE(encode.bytes - 2, oldOffset)
  return buf
};
encode.bytes = 0

export function decode (buf: Buffer, offset: number) {
  if (!offset) { offset = 0 }
  const oldOffset = offset

  var key: DNSKeyValue = {} as any
  var length = buf.readUInt16BE(offset)
  offset += 2
  key.flags = buf.readUInt16BE(offset)
  offset += 2
  if (buf.readUInt8(offset) !== PROTOCOL_DNSSEC) {
    throw new Error('Protocol must be 3')
  }
  offset += 1
  key.algorithm = buf.readUInt8(offset)
  offset += 1
  key.key = buf.slice(offset, oldOffset + length + 2)
  offset += key.key.length
  decode.bytes = offset - oldOffset
  return key
}

decode.bytes = 0

export function encodingLength (key: DNSKeyValue) {
  return 6 + Buffer.byteLength(key.key)
};
