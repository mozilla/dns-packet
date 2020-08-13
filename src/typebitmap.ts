import * as types from './types'

export function encode (typelist: string[], buf: Buffer, offset: number) {
  if (!buf) { buf = Buffer.allocUnsafe(encodingLength(typelist)) }
  if (!offset) { offset = 0 }
  const oldOffset = offset

  var typesByWindow: any = []
  for (var i = 0; i < typelist.length; i++) {
    var typeid = types.toType(typelist[i])
    if (typesByWindow[typeid >> 8] === undefined) {
      typesByWindow[typeid >> 8] = []
    }
    typesByWindow[typeid >> 8][(typeid >> 3) & 0x1F] |= 1 << (7 - (typeid & 0x7))
  }

  for (i = 0; i < typesByWindow.length; i++) {
    if (typesByWindow[i] !== undefined) {
      var windowBuf = Buffer.from(typesByWindow[i])
      buf.writeUInt8(i, offset)
      offset += 1
      buf.writeUInt8(windowBuf.length, offset)
      offset += 1
      windowBuf.copy(buf, offset)
      offset += windowBuf.length
    }
  }

  encode.bytes = offset - oldOffset
  return buf
}

encode.bytes = 0

export function decode (buf: Buffer, offset: number, length: number) {
  if (!offset) { offset = 0 }
  const oldOffset = offset

  var typelist = []
  while (offset - oldOffset < length) {
    var window = buf.readUInt8(offset)
    offset += 1
    var windowLength = buf.readUInt8(offset)
    offset += 1
    for (var i = 0; i < windowLength; i++) {
      var b = buf.readUInt8(offset + i)
      for (var j = 0; j < 8; j++) {
        if (b & (1 << (7 - j))) {
          var typeid = types.toString((window << 8) | (i << 3) | j)
          typelist.push(typeid)
        }
      }
    }
    offset += windowLength
  }

  decode.bytes = offset - oldOffset
  return typelist
}

decode.bytes = 0

export function encodingLength (typelist: string[]) {
  var extents: any = []
  for (var i = 0; i < typelist.length; i++) {
    var typeid = types.toType(typelist[i])
    extents[typeid >> 8] = Math.max(extents[typeid >> 8] || 0, typeid & 0xFF)
  }

  var len = 0
  for (i = 0; i < extents.length; i++) {
    if (extents[i] !== undefined) {
      len += 2 + Math.ceil((extents[i] as number + 1) / 8)
    }
  }

  return len
}
