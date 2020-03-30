import { color } from './color'

export type LogType = 'start' | 'end' | 'warn' | 'error' | 'log'

export class Logger {
  constructor(public ctx: string, private readonly startTime = new Date()) {}

  log(...msgs: string[]) {
    console.log(this.printPrefix(`log`), ...msgs.map(color.blue))
  }

  warn(...msgs: string[]) {
    console.warn(this.printPrefix(`warn`), ...msgs.map(color.yellow))
  }

  error(...msgs: string[]) {
    console.error(this.printPrefix(`error`), ...msgs.map(color.red))
  }

  start() {
    console.log(this.printPrefix(`start`), color.green('=> start'))
  }

  end() {
    console.log(this.printPrefix(`end`), color.green('=> end'))
  }

  private printPrefix(type: LogType) {
    const now = new Date()
    const elapsed = now.valueOf() - this.startTime.valueOf()

    let res = ''

    res += '[' + color.bright(this.ctx) + ']' + color.dim(`(+${elapsed})`)
    res = res.padEnd(this.ctx.length + 6)

    return res
  }
}
