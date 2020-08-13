import * as types from './types'
import * as classes from './classes'
import * as name from './name'
import * as ropt from './ropt'

import { FLUSH_MASK, NOT_FLUSH_MASK } from './index'
import { OptionValue } from './roption'
import { renc } from './renc'

export interface AnswerValue {
  type: string
  class: string
  flush: boolean
  name: string
  data: string | object
  options: OptionValue[]
  udpPayloadSize: number
  extendedRcode: number
  ednsVersion: number
  flags: number
  flag_do: boolean
  ttl: number
}

export function encode (a: AnswerValue, buf: Buffer, offset: number) {
  if (!buf) { buf = Buffer.allocUnsafe(encodingLength(a)) }
  if (!offset) { offset = 0 }

  const oldOffset = offset

  name.encode(a.name, buf, offset)
  offset += name.encode.bytes

  buf.writeUInt16BE(types.toType(a.type), offset)

  if (a.type.toUpperCase() === 'OPT') {
    if (a.name !== '.') {
      throw new Error('OPT name must be root.')
    }
    buf.writeUInt16BE(a.udpPayloadSize || 4096, offset + 2)
    buf.writeUInt8(a.extendedRcode || 0, offset + 4)
    buf.writeUInt8(a.ednsVersion || 0, offset + 5)
    buf.writeUInt16BE(a.flags || 0, offset + 6)

    offset += 8
    ropt.encode(a.options || [], buf, offset)
    offset += ropt.encode.bytes
  } else {
    let klass = classes.toClass(a.class === undefined ? 'IN' : a.class)
    if (a.flush) { klass |= FLUSH_MASK } // the 1st bit of the class is the flush bit
    buf.writeUInt16BE(klass, offset + 2)
    buf.writeUInt32BE(a.ttl || 0, offset + 4)

    offset += 8
    const enc = renc(a.type)
    enc.encode(a.data as any, buf, offset)
    offset += enc.encode.bytes
  }

  encode.bytes = offset - oldOffset
  return buf
}
encode.bytes = 0

export function decode (buf: Buffer, offset: number) {
  if (!offset) { offset = 0 }

  const a: AnswerValue = {} as any
  const oldOffset = offset

  a.name = name.decode(buf, offset)
  offset += name.decode.bytes
  a.type = types.toString(buf.readUInt16BE(offset))
  if (a.type === 'OPT') {
    a.udpPayloadSize = buf.readUInt16BE(offset + 2)
    a.extendedRcode = buf.readUInt8(offset + 4)
    a.ednsVersion = buf.readUInt8(offset + 5)
    a.flags = buf.readUInt16BE(offset + 6)
    a.flag_do = ((a.flags >> 15) & 0x1) === 1
    a.options = ropt.decode(buf, offset + 8)
    offset += 8 + ropt.decode.bytes
  } else {
    const klass = buf.readUInt16BE(offset + 2)
    a.ttl = buf.readUInt32BE(offset + 4)

    a.class = classes.toString(klass & NOT_FLUSH_MASK)
    a.flush = !!(klass & FLUSH_MASK)

    const enc = renc(a.type)
    a.data = enc.decode(buf, offset + 8)
    offset += 8 + enc.decode.bytes
  }

  decode.bytes = offset - oldOffset
  return a
}

decode.bytes = 0

export function encodingLength (a: AnswerValue) {
  const data = (a.data !== null && a.data !== undefined) ? a.data : a.options
  return name.encodingLength(a.name) + 8 + (renc(a.type).encodingLength(data as any))
}
