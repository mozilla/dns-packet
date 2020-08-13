import * as types from './types'
import * as classes from './classes'
import * as name from './name'

export const QU_MASK = 1 << 15
export const NOT_QU_MASK = ~QU_MASK

export interface QuestionValue {
  type: string
  class: string
  name: string
}

export function encode (q: QuestionValue, buf: Buffer, offset: number) {
  if (!buf) { buf = Buffer.allocUnsafe(encodingLength(q)) }
  if (!offset) { offset = 0 }

  const oldOffset = offset

  name.encode(q.name, buf, offset)
  offset += name.encode.bytes

  buf.writeUInt16BE(types.toType(q.type), offset)
  offset += 2

  buf.writeUInt16BE(classes.toClass(q.class === undefined ? 'IN' : q.class), offset)
  offset += 2

  encode.bytes = offset - oldOffset
  return q
}
encode.bytes = 0

export function decode (buf: Buffer, offset: number) {
  if (!offset) { offset = 0 }

  const oldOffset = offset
  const q: QuestionValue = {} as any

  q.name = name.decode(buf, offset)
  offset += name.decode.bytes

  q.type = types.toString(buf.readUInt16BE(offset))
  offset += 2

  q.class = classes.toString(buf.readUInt16BE(offset))
  offset += 2

  const qu = !!((q.class as any) & QU_MASK)
  if (qu) { (q.class as any) &= NOT_QU_MASK }

  decode.bytes = offset - oldOffset
  return q
}

decode.bytes = 0

export function encodingLength (q: QuestionValue) {
  return name.encodingLength(q.name) + 4
}
