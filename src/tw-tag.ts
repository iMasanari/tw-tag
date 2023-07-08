type Compress<T extends string> =
  T extends `${infer U}  ${infer R}` ? Compress<`${U} ${R}`> : T

type Trim<T extends string> =
  T extends ` ${infer R}` ? Trim<R> :
  T extends `${infer U} ` ? Trim<U> :
  T

type Normalize<T extends string> =
  T extends `${infer U}${'\f' | '\n' | '\r' | '\t'}${infer R}` ? `${U} ${Normalize<R>}` : T

type Tw = <T extends string>(template: TemplateStringsArray | T) => Compress<Trim<Normalize<T>>>

let didWarnUsingTagAtRuntime = false

export const tw: Tw = (template) => {
  if (!didWarnUsingTagAtRuntime) {
    console.info('[tw-tag] `tw` tag at runtime are not recommended. Consider using the Babel plugin.')

    didWarnUsingTagAtRuntime = true
  }

  const value = typeof template === 'string' ? template : template[0]!
  const className = value.replace(/[\t\r\f\n ]+/g, ' ').replace(/^ | $/g, '')

  return className as string as any
}
