import * as name from './name'

export interface SOAValue {
  mname: string
  rname: string
  serial: number
  refresh: number
  retry: number
  expire: number
  minimum: number
}

export function encode (data: SOAValue, buf?: Buffer, offset = 0) {
  if (!buf) buf = Buffer.allocUnsafe(encodingLength(data))
  if (!offset) offset = 0

  const oldOffset = offset
  offset += 2
  name.encode(data.mname, buf, offset)
  offset += name.encode.bytes
  name.encode(data.rname, buf, offset)
  offset += name.encode.bytes
  buf.writeUInt32BE(data.serial || 0, offset)
  offset += 4
  buf.writeUInt32BE(data.refresh || 0, offset)
  offset += 4
  buf.writeUInt32BE(data.retry || 0, offset)
  offset += 4
  buf.writeUInt32BE(data.expire || 0, offset)
  offset += 4
  buf.writeUInt32BE(data.minimum || 0, offset)
  offset += 4

  buf.writeUInt16BE(offset - oldOffset - 2, oldOffset)
  encode.bytes = offset - oldOffset
  return buf
}

encode.bytes = 0

export function decode (buf: Buffer, offset = 0) {
  if (!offset) offset = 0

  const oldOffset = offset

  const data: SOAValue = {} as any
  offset += 2
  data.mname = name.decode(buf, offset)
  offset += name.decode.bytes
  data.rname = name.decode(buf, offset)
  offset += name.decode.bytes
  data.serial = buf.readUInt32BE(offset)
  offset += 4
  data.refresh = buf.readUInt32BE(offset)
  offset += 4
  data.retry = buf.readUInt32BE(offset)
  offset += 4
  data.expire = buf.readUInt32BE(offset)
  offset += 4
  data.minimum = buf.readUInt32BE(offset)
  offset += 4

  decode.bytes = offset - oldOffset
  return data
}

decode.bytes = 0

export function encodingLength (data: SOAValue) {
  return 22 + name.encodingLength(data.mname) + name.encodingLength(data.rname)
}
