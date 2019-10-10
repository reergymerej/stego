const fs = require('fs')

const run = () => {
  const octets = [1]
  console.log(octets)

  // put them in a buffer
  // const buffer = Buffer.alloc(4)

  const buffer = Buffer.from(octets)
  console.log(buffer)
  // describe(buffer)
  console.log(bufferToBinary(buffer))

  const octetsNeededToHide = buffer.length * 8
  const hidingPlace = Buffer.alloc(octetsNeededToHide)
  console.log(bufferToBinary(hidingPlace))

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

const hideOctet = (octet, container) => {
  if (container.length < 4) {
    throw new Error('container not large enough to hide octet')
  }
  return splitOctetIntoPairs(octet)
    .reduce((buffer, value, i) => {
      buffer[i] = buffer[i] + value
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
  const slices = []
  const sliceLength = 4
  for (const [i, octet] of message.entries()) {
    const sliceIndex = i * sliceLength
    const containerSlice = container.slice(sliceIndex, sliceIndex + sliceLength)
    const sliceWithHidden = hideOctet(octet, containerSlice)
    slices.push(sliceWithHidden)
  }
  return Buffer.concat(slices)
}

module.exports = {
  hideBuffer,
  hideOctet,
  pluck,
  splitOctetIntoPairs,
}
