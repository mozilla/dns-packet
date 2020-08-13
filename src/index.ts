'use strict'

import * as header from './header'
import * as name from './name'
import * as string from './string'

import * as answer from './answer'
import * as question from './question'

import { encodingLengthList, encodeList, decodeList } from './utils'

export * from './renc'

export { answer, question, header, name, string }

export const FLUSH_MASK = 1 << 15
export const NOT_FLUSH_MASK = ~FLUSH_MASK

export const AUTHORITATIVE_ANSWER = 1 << 10
export const TRUNCATED_RESPONSE = 1 << 9
export const RECURSION_DESIRED = 1 << 8
export const RECURSION_AVAILABLE = 1 << 7
export const AUTHENTIC_DATA = 1 << 5
export const CHECKING_DISABLED = 1 << 4
export const DNSSEC_OK = 1 << 15

export interface Result {
  type: 'response'
  id: number
  flags: number
  answers: Array<{
    type: string
    name: string
    data: string
  }>
  questions: question.QuestionValue[]
  authorities: any[]
  additionals: any[]
}

export function encode (result: Result, buf: Buffer, offset: number) {
  if (!buf) buf = Buffer.allocUnsafe(encodingLength(result))
  if (!offset) offset = 0

  const oldOffset = offset

  if (!result.questions) result.questions = []
  if (!result.answers) result.answers = []
  if (!result.authorities) result.authorities = []
  if (!result.additionals) result.additionals = []

  header.encode(result, buf, offset)
  offset += header.encode.bytes

  offset = encodeList(result.questions, question, buf, offset)
  offset = encodeList(result.answers, answer, buf, offset)
  offset = encodeList(result.authorities, answer, buf, offset)
  offset = encodeList(result.additionals, answer, buf, offset)

  encode.bytes = offset - oldOffset

  return buf
}

encode.bytes = 0

export function decode (buf: Buffer, offset: number) {
  if (!offset) offset = 0

  const oldOffset = offset
  const result = header.decode(buf, offset)
  offset += header.decode.bytes

  offset = decodeList(result.questions, question, buf, offset)
  offset = decodeList(result.answers, answer, buf, offset)
  offset = decodeList(result.authorities, answer, buf, offset)
  offset = decodeList(result.additionals, answer, buf, offset)

  decode.bytes = offset - oldOffset

  return result
}

decode.bytes = 0

export function encodingLength (result: Result) {
  return header.encodingLength() +
    encodingLengthList(result.questions || [], question) +
    encodingLengthList(result.answers || [], answer) +
    encodingLengthList(result.authorities || [], answer) +
    encodingLengthList(result.additionals || [], answer)
}

export function streamEncode (result: Result) {
  const buf = exports.encode(result)
  const sbuf = Buffer.allocUnsafe(2)
  sbuf.writeUInt16BE(buf.byteLength)
  const combine = Buffer.concat([sbuf, buf])
  streamEncode.bytes = combine.byteLength
  return combine
}

streamEncode.bytes = 0

export function streamDecode (sbuf: Buffer) {
  const len = sbuf.readUInt16BE(0)
  if (sbuf.byteLength < len + 2) {
    // not enough data
    return null
  }
  const result = exports.decode(sbuf.slice(2))
  streamDecode.bytes = exports.decode.bytes
  return result
}

streamDecode.bytes = 0
