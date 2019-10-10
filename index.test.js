const mod = require('./')

describe('splitOctetIntoPairs', () => {
  it.each`
    input | output
    ${0} | ${[0, 0, 0, 0]}
    ${1} | ${[0, 0, 0, 1]}
    ${2} | ${[0, 0, 0, 2]}
    ${3} | ${[0, 0, 0, 3]}
    ${4} | ${[0, 0, 1, 0]}
    ${5} | ${[0, 0, 1, 1]}
    ${8} | ${[0, 0, 2, 0]}
    ${9} | ${[0, 0, 2, 1]}
    ${10} | ${[0, 0, 2, 2]}
    ${11} | ${[0, 0, 2, 3]}
    ${12} | ${[0, 0, 3, 0]}
    ${32} | ${[0, 2, 0, 0]}
    ${33} | ${[0, 2, 0, 1]}
    ${32 + 16} | ${[0, 3, 0, 0]}
    ${32 + 16 + 1} | ${[0, 3, 0, 1]}
    ${64} | ${[1, 0, 0, 0]}
    ${64 + 1} | ${[1, 0, 0, 1]}
    ${128} | ${[2, 0, 0, 0]}
    ${128 + 64} | ${[3, 0, 0, 0]}
    ${128 + 64 + 32 + 16 + 8 + 4 + 2 + 1} | ${[3, 3, 3, 3]}
    ${128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 + 1} | ${[0, 0, 0, 0]}
  `('$input -> $output', ({ input, output }) => {
    expect(mod.splitOctetIntoPairs(input)).toEqual(output)
  })
})

describe('hideOctet', () => {
  it('should throw if the container is not large enough', () => {
    expect(() => {
      const container = Buffer.from([0, 0, 0])
      mod.hideOctet(255, container)
    }).toThrow('container')
  })

  it.each`
    octet | container | expected
    ${1} | ${[0, 0, 0, 255]}, ${[0, 0, 0, 255 - 3 + 1]}
    ${1} | ${[0, 0, 0, 0]}, ${[0, 0, 0, 1]}
    ${2} | ${[0, 0, 0, 0]}, ${[0, 0, 0, 2]}
    ${1} | ${[0, 0, 0, 1]}, ${[0, 0, 0, 1]}
    ${4} | ${[0, 0, 0, 0]}, ${[0, 0, 1, 0]}
    ${2 + 8 + 32 + 128} | ${[0, 0, 0, 0]}, ${[2, 2, 2, 2]}
    ${2 + 8 + 32 + 128} | ${[255, 255, 255, 255]}, ${[255 - 3 + 2, 255 - 3 + 2, 255 - 3 + 2, 255 - 3 + 2]}
    ${255} | ${[255, 255, 255, 255]}, ${[255, 255, 255, 255]}
  `('hide $octet in $container -> $expected', ({ octet, container, expected }) => {
    const result = mod.hideOctet(octet, Buffer.from(container))
    expect(result).toEqual(Buffer.from(expected))
  })
})

describe('pluck', () => {
  it.each`
    input | expected
    ${[0, 0, 1, 0]} | ${[0, 0, 1, 0]}
    ${[0, 0, 0, 1]} | ${[0, 0, 0, 1]}
    ${[0, 0, 0, 3]} | ${[0, 0, 0, 3]}
    ${[0, 0, 0, 4]} | ${[0, 0, 0, 0]}
  `('should pull $expected from $input', ({ input, expected }) => {
    expect(mod.pluck(Buffer.from(input))).toEqual(expected)
  })
})

describe('hideBuffer', () => {
  it.each(
    [
      [
        // message
        Buffer.from([
          0,
          1,
        ]),
        // container
        null,
        // expected
        Buffer.from([
          0,0,0,0,
          0,0,0,1,
        ]),
      ],
      [
        // message
        Buffer.from([
          255,
          1,
        ]),
        // container
        null,
        // expected
        Buffer.from([
          3,3,3,3,
          0,0,0,1,
        ]),
      ],
      [
        // message
        Buffer.from([
          0,
          1,
        ]),
        // container
        Buffer.from([
          0,0,0,0,
          0,0,0,255,
        ]),
        // expected
        Buffer.from([
          0,0,0,0,
          0,0,0,255 - 3 + 1,
        ]),
      ],
      [
        // message
        Buffer.from([
          100,
          1,
        ]),
        // container
        Buffer.from([
          0,0,0,0,
          0,0,0,255, // 11 11 11 11
        ]),
        // expected
        Buffer.from([
          1,2,1,0,
          0,0,0,255 - 3 + 1, // 11 11 11 01
        ]),
      ],
      [
        // message
        Buffer.from([
          1,
        ]),
        // container
        Buffer.from([
          0,0,0,0,
          0,0,0,0,
        ]),
        // expected
        Buffer.from([
          0,0,0,1,
          0,0,0,0,
        ]),
      ],
    ]
  )('should hide a buffer within another', (message, container, expected) => {
    const hiddenIn = container || Buffer.alloc(message.length * 4)
    const result = mod.hideBuffer(message, hiddenIn)
    expect(result).toEqual(expected)
    expect(result.length).toEqual(hiddenIn.length)
  })
})

describe('getValueFromOctetPairs', () => {
  it('should ', () => {
    // 01 11 00 01
    // 64 32 16 1
    expect(mod.getValueFromOctetPairs([1,3,0,1])).toBe(64 + 32 + 16 + 1)
  })
})

describe('integration', () => {
  it.each(
    [
      [
        'a', // message
        null, // container
      ],

      [
        'a', // message
        Buffer.from('hello'), // container
      ],

      [
        '🤔', // message
        null,
      ],

      [
        'I have a knife! 🤔', // message
        null,
      ],

      [
        'I have a knife! 🤔', // message
        Buffer.from('asfd asdf asdf qwer qwer qwer asdf asdf asdf zxcv xcv xcvb xcvb xcvb sdf gsdfg sdfg '),
      ],
    ]
  )('should hide/retrieve a message', (message, container) => {
    const messageBuffer = Buffer.from(message)
    const hidden = mod.hideBuffer(messageBuffer, container)

    const plucked = mod.pluck(hidden)
    const fromPlucked = mod.bufferFromPlucked(plucked)
    expect(fromPlucked.toString()).toContain(message)
    // expect(fromPlucked.toString()).toEqual(message)
  })
})
