export function encodingLengthList (list: any[], enc: any) {
  let len = 0
  for (let i = 0; i < list.length; i++) len += enc.encodingLength(list[i]) as number
  return len
}

export function encodeList (list: any[], enc: any, buf: Buffer, offset: number) {
  for (let i = 0; i < list.length; i++) {
    enc.encode(list[i], buf, offset)
    offset += enc.encode.bytes as number
  }
  return offset
}

export function decodeList (list: any[], enc: any, buf: Buffer, offset: number) {
  for (let i = 0; i < list.length; i++) {
    list[i] = enc.decode(buf, offset)
    offset += enc.decode.bytes as number
  }
  return offset
}
