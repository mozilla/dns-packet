export type TXTValue = Buffer | string | Buffer[] | string[] | Array<Buffer | string>

export function encode (data: TXTValue, buf?: Buffer, offset = 0) {
  if (!Array.isArray(data)) data = [data]
  for (let i = 0; i < data.length; i++) {
    if (typeof data[i] === 'string') {
      data[i] = Buffer.from(data[i])
    }
    if (!Buffer.isBuffer(data[i])) {
      throw new Error('Must be a Buffer')
    }
  }

  // just a hack for type
  const _data: Buffer[] = data as Buffer[]

  if (!buf) buf = Buffer.allocUnsafe(encodingLength(_data))
  if (!offset) offset = 0

  const oldOffset = offset
  offset += 2

  _data.forEach(function (d) {
    buf![offset++] = d.length
    d.copy(buf!, offset, 0, d.length)
    offset += d.length
  })

  buf.writeUInt16BE(offset - oldOffset - 2, oldOffset)
  encode.bytes = offset - oldOffset
  return buf
}

encode.bytes = 0

export function decode (buf: Buffer, offset = 0) {
  if (!offset) offset = 0
  const oldOffset = offset
  let remaining = buf.readUInt16BE(offset)
  offset += 2

  const data = []
  while (remaining > 0) {
    const len = buf[offset++]
    --remaining
    if (remaining < len) {
      throw new Error('Buffer overflow')
    }
    data.push(buf.slice(offset, offset + len))
    offset += len
    remaining -= len
  }

  decode.bytes = offset - oldOffset
  return data
}

decode.bytes = 0

export function encodingLength (data: TXTValue) {
  if (!Array.isArray(data)) data = [data]
  let length = 2
  data.forEach(function (buf) {
    if (typeof buf === 'string') {
      length += Buffer.byteLength(buf) + 1
    } else {
      length += buf.length + 1
    }
  })
  return length
}
