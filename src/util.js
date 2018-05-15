export const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)

export const setProp = (target, path, value, vm) => {
  const segs = path.split('.')
  let currentTarget = target
  segs.forEach((prop, i) => {
    if (prop === '$') return
    const isLast = i === segs.length - 1
    const match = /^(.+)\[(\d+)\]$/.exec(prop)
    if (match) { // set array item value
      const propName = match[1]
      const arrIndex = parseInt(match[2])
      if (!Array.isArray(currentTarget[propName])) {
        vm.$set(currentTarget, propName, [])
      }
      currentTarget = currentTarget[propName]
      if (isLast) {
        vm.$set(currentTarget, arrIndex, value)
      } else if (!currentTarget[arrIndex]) {
        vm.$set(currentTarget, arrIndex, {})
      }
      currentTarget = currentTarget[arrIndex]
    } else {
      if (isLast) {
        vm.$set(currentTarget, prop, value)
      } else if (!(prop in currentTarget)) {
        vm.$set(currentTarget, prop, {})
      }
      currentTarget = currentTarget[prop]
    }
  })
}

export const getProp = (target, path) => {
  const segs = path.split('.')
  let currentTarget = target
  for (let i = 0; i < segs.length; i++) {
    const prop = segs[i]
    if (prop === '$') continue
    if (currentTarget === undefined || currentTarget === null) return
    const match = /^(.+)\[(\d+)\]$/.exec(prop)
    if (match) {
      const propName = match[1]
      const arrIndex = match[2]
      currentTarget = currentTarget[propName]
      if (!Array.isArray(currentTarget)) return
      currentTarget = currentTarget[arrIndex]
    } else {
      currentTarget = currentTarget[prop]
    }
  }
  return currentTarget
}

export const getDefaultValue = type => {
  const defaultValues = {
    string: '',
    boolean: 0,
    number: 0,
    integer: 0,
    null: null,
    object: {},
    array: []
  }
  return defaultValues[type]
}
