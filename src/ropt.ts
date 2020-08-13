
import * as roption from './roption'
import { encodingLengthList, encodeList } from './utils'

export function encode (options: roption.OptionValue[], buf: Buffer, offset: number) {
  if (!buf) { buf = Buffer.allocUnsafe(encodingLength(options)) }
  if (!offset) { offset = 0 }
  const oldOffset = offset

  const rdlen = encodingLengthList(options, roption)
  buf.writeUInt16BE(rdlen, offset)
  offset = encodeList(options, roption, buf, offset + 2)

  encode.bytes = offset - oldOffset
  return buf
}

encode.bytes = 0

export function decode (buf: Buffer, offset: number) {
  if (!offset) { offset = 0 }
  const oldOffset = offset

  const options = []
  let rdlen = buf.readUInt16BE(offset)
  offset += 2
  let o = 0
  while (rdlen > 0) {
    options[o++] = roption.decode(buf, offset)
    offset += roption.decode.bytes
    rdlen -= roption.decode.bytes
  }
  decode.bytes = offset - oldOffset
  return options
}
decode.bytes = 0

export function encodingLength (options: roption.OptionValue[]) {
  return 2 + encodingLengthList(options || [], roption)
}
