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
    // 00 00 10 00
    // 00 10 00 00 - 32
    // 01 00 00 00 - 64
    // 10 00 00 00 - 128
    expect(mod.splitOctetIntoPairs(input)).toEqual(output)
  })
})
