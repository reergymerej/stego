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
  const pairs = [
    (octet >> 6) % mod, // shift right 6, drop everything left of mod
    (octet >> 4) % mod,
    (octet >> 2) % mod,
    (octet >> 0) % mod,
  ]
  return pairs
}

// console.log(splitOctetIntoPairs(0))
// console.log(splitOctetIntoPairs(1))
// console.log(splitOctetIntoPairs(5))
// console.log(splitOctetIntoPairs(1 + 4 + 16 + 64))
// console.log(splitOctetIntoPairs(
//   128
//   + 64
//   + 32
//   + 16
//   + 8
//   + 4
//   + 2
//   +1
// ))
// console.log(splitOctetIntoPairs(255))

module.exports = {
  splitOctetIntoPairs,
}
