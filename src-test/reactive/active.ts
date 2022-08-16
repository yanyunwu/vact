
export class Activer {
  callback: () => any
  flag: string = 'activer'


  constructor(fn: () => any) {
    this.callback = fn
  }

  get value(): any {
    return this.callback()
  }

}


export function active(fn: () => any): Activer {
  return new Activer(fn)
}

