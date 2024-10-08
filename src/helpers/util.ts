import { AxiosRequestConfig, TransformFn } from '../types'

const toString = Object.prototype.toString

export const isDate = (val: any): val is Date => {
  return toString.call(val) === '[object Date]'
}

// 判断是不是普通对象
export const isPlainObject = (val: any): val is Object => {
  return toString.call(val) === '[object Object]'
}

// 混合函数和对象
export const extendsTo = <T, U>(to: T, from: U): T & U => {
  for (const key in from) {
    ;(to as T & U)[key] = from[key] as any
  }
  return to as T & U
}

// 合并传进来的对象
export function deepMerge(...objs: any[]) {
  const result = Object.create(null)
  objs.forEach(obj => {
    if (obj) {
      Object.keys(obj).forEach(key => {
        const val = obj[key]
        if (isPlainObject(val)) {
          if (isPlainObject(result[key])) {
            result[key] = deepMerge(result[key], val)
          } else {
            result[key] = deepMerge({}, val)
          }
        } else {
          result[key] = val
        }
      })
    }
  })
  return result
}

// 执行transformRequest transformResponse
export function transform(data: any, headers: any, fns?: TransformFn | TransformFn[]) {
  if (!fns) return data
  if (!Array.isArray(fns)) {
    fns = [fns]
  }
  fns.forEach(fn => {
    data = fn(data, headers)
  })
  return data
}

// 判断 FormData
export function isFormData(val: any): boolean {
  return typeof val !== 'undefined' && val instanceof FormData
}
// 判断 URLSearchParams
export function isURLSearchParams(val: any): val is URLSearchParams {
  return typeof val !== 'undefined' && val instanceof URLSearchParams
}
