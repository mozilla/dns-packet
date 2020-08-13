import * as name from './name'

export interface SRVValue {
  port: number
  target: string
  priority: number
  weight: number
}

export function encode (data: SRVValue, buf?: Buffer, offset = 0) {
  if (!buf) buf = Buffer.allocUnsafe(encodingLength(data))
  if (!offset) offset = 0

  buf.writeUInt16BE(data.priority || 0, offset + 2)
  buf.writeUInt16BE(data.weight || 0, offset + 4)
  buf.writeUInt16BE(data.port || 0, offset + 6)
  name.encode(data.target, buf, offset + 8)

  const len = name.encode.bytes + 6
  buf.writeUInt16BE(len, offset)

  encode.bytes = len + 2
  return buf
}

encode.bytes = 0

export function decode (buf: Buffer, offset = 0) {
  if (!offset) offset = 0

  const len = buf.readUInt16BE(offset)

  const data: SRVValue = {} as any
  data.priority = buf.readUInt16BE(offset + 2)
  data.weight = buf.readUInt16BE(offset + 4)
  data.port = buf.readUInt16BE(offset + 6)
  data.target = name.decode(buf, offset + 8)

  decode.bytes = len + 2
  return data
}

decode.bytes = 0

export function encodingLength (data: SRVValue) {
  return 8 + name.encodingLength(data.target)
}
