type Compress<T extends string> =
  T extends `${infer U}     ${infer R}` ? Compress<`${U} ${R}`> :
  T extends `${infer U}   ${infer R}` ? Compress<`${U} ${R}`> :
  T extends `${infer U}  ${infer R}` ? Compress<`${U} ${R}`> :
  T

type Trim<T extends string> =
  T extends ` ${infer U}` ? Trim<U> :
  T extends `${infer U} ` ? Trim<U> :
  T

type Normalize<T extends string> =
  T extends `${infer U}\f${infer R}` ? Normalize<`${U} ${R}`> :
  T extends `${infer U}\n${infer R}` ? Normalize<`${U} ${R}`> :
  T extends `${infer U}\r${infer R}` ? Normalize<`${U} ${R}`> :
  T extends `${infer U}\t${infer R}` ? Normalize<`${U} ${R}`> :
  T

interface Tw {
  <T extends string>(template: T): Trim<Compress<Normalize<T>>>
  (template: TemplateStringsArray, ...args: string[]): string
}

let didWarnUsingTagAtRuntime = false

export const tw: Tw = (template: string | TemplateStringsArray, ...args: string[]) => {
  if (!didWarnUsingTagAtRuntime) {
    console.info('[tw-tag] `tw` tag at runtime are not recommended. Consider using the Babel plugin.')

    didWarnUsingTagAtRuntime = true
  }

  const value = typeof template === 'string'
    ? template
    : template.reduce((acc, v, i) => acc + v + (args[i] ?? ''), '')

  const className = value.replace(/[\t\r\f\n ]+/g, ' ').replace(/^ | $/g, '')

  return className as string as any
}
