const toString = Object.prototype.toString

export const isDate = (val: any): val is Date => {
  return toString.call(val) === '[Object Date]'
}

// 对于 FormData、ArrayBuffer 这些类型，isObject 判断也为 true
export const isObject = (val: any): val is Object => {
  return val !== null && typeof val === 'object'
}

// 判断是不是普通对象
export const isPlainObject = (val: any): val is Object => {
  return toString.call(val) === '[object Object]'
}
