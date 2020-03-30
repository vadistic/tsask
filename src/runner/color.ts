const code = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  //text color

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  //background color

  blackBg: '\x1b[40m',
  redBg: '\x1b[41m',
  greenBg: '\x1b[42m',
  yellowBg: '\x1b[43m',
  blueBg: '\x1b[44m',
  magentaBg: '\x1b[45m',
  cyanBg: '\x1b[46m',
  whiteBg: '\x1b[47m',
}

export const color = {
  dim: (val: string) => code.dim + val + code.reset,
  bright: (val: string) => code.bright + val + code.reset,
  blue: (val: string) => code.blue + val + code.reset,
  green: (val: string) => code.green + val + code.reset,
  yellow: (val: string) => code.yellow + val + code.reset,
  red: (val: string) => code.red + val + code.reset,
}
