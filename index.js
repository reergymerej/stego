const fs = require('fs')

const run = () => {
  const octets = [1]

  // put them in a buffer
  // const buffer = Buffer.alloc(4)

  const buffer = Buffer.from(octets)
  // describe(buffer)

  const octetsNeededToHide = buffer.length * 8
  const hidingPlace = Buffer.alloc(octetsNeededToHide)

  // Distribute the octets we are hiding into the hiding place.

  // write them to a file
  return
  fs.writeFile('out', buffer, () => {
    console.log('done')
  })
}

const describe = (buffer) => {
  // iterate buffer
  for (const [i, octet] of buffer.entries()) {
    const binary = intToBinary(octet)
    console.log({i, octet, binary})
  }
}

const bufferToBinary = (buffer) => {
  let result = ''
  for (const value of buffer.values()) {
    result = `${result} ${intToBinary(value)}`
  }
  return result.trim()
}

const pad = (length, fill) => (string) => {
  let s = `${string}`
  while (s.length < length) {
    s = `${fill}${s}`
  }
  return s
}

const binaryPad = pad(8, '0')

const intToBinary = (int) => binaryPad(int.toString(2))

// run()

const splitOctetIntoPairs = (octet) => {
  const mod = 4 // 0000 0100
  return [0,0,0,0].map((_, i) =>
    // shift right n, drop everything left of mod
    (octet >> (i * 2)) % mod
  ).reverse()
}

// split to octet into 4 groups
// take the first 4 octets from the container
// replace the last 2 bits of each with those from the octet
// octet = 10 01 11 00
// container =
//    00 00 00 00
//    00 00 00 00
//    00 00 00 00
//    00 00 00 00
//
// result =
//    00 00 00 10
//    00 00 00 01
//    00 00 00 11
//    00 00 00 00
const hideOctet = (octet, container) => {
  if (container.length < 4) {
    throw new Error('container not large enough to hide octet')
  }
  return splitOctetIntoPairs(octet)
    .reduce((buffer, value, i) => {
      const bufferValue = buffer[i]
      const bufferValuePairs = splitOctetIntoPairs(bufferValue)
      bufferValuePairs[3] = value
      const newValue = getValueFromOctetPairs(bufferValuePairs)
      buffer[i] = newValue
      return buffer
    }, Buffer.from(container))
}

// return list of octets pulled from last 2 bits of each octet in buffer
const pluck = (buffer) => {
  const result = []
  for (const octet of buffer) {
    const [,,,last] = splitOctetIntoPairs(octet)
    result.push(last)
  }
  return result
}

const hideBuffer = (message, container) => {
  container = container || Buffer.alloc(message.length * 4)
  const slices = []
  const sliceLength = 4
  for (const [i, octet] of message.entries()) {
    const sliceIndex = i * sliceLength
    const containerSlice = container.slice(sliceIndex, sliceIndex + sliceLength)
    const sliceWithHidden = hideOctet(octet, containerSlice)
    slices.push(sliceWithHidden)
  }
  const rewrittenSubBuffer = Buffer.concat(slices)
  const lengthDiff = container.length - rewrittenSubBuffer.length
  if (lengthDiff) {
    const unusedContainer = container.slice(-lengthDiff)
    return Buffer.concat([rewrittenSubBuffer, unusedContainer])
  } else {
    return rewrittenSubBuffer
  }
}

const getValueFromOctetPairs = (pairs) => {
  const mod = 4 // 0000 0100
  const [a, b, c, d] = pairs
  const aVal = a << 6
  const bVal = b << 4
  const cVal = c << 2
  const dVal = d << 0
  return aVal + bVal + cVal + dVal
}

const bufferFromPlucked = (plucked) => {
  const chunkSize = 4
  let chunks = []
  for (let i = 0; i < plucked.length; i += chunkSize) {
    const chunk = plucked.slice(i, i + chunkSize)
    const value = getValueFromOctetPairs(chunk)
    const binary = intToBinary(value)
    chunks.push(value)
  }

  return Buffer.from(chunks)
}

module.exports = {
  bufferFromPlucked,
  bufferToBinary,
  getValueFromOctetPairs,
  hideBuffer,
  hideOctet,
  pluck,
  splitOctetIntoPairs,
}
