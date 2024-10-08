import { AxiosRequestConfig } from '../types'
import { deepMerge, isPlainObject } from './util'

export function buildHeaders(config: AxiosRequestConfig): any {
  const { headers = {}, data } = config
  normalizeHeaderName(headers, 'Content-Type')

  if (isPlainObject(data)) {
    if (headers && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json;charset=utf-8'
    }
  }
  return headers
}

function normalizeHeaderName(headers: Record<string, string>, normalizedName: string) {
  if (!headers) {
    return
  }

  Object.keys(headers).forEach(name => {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = headers[name]
      delete headers[name]
    }
  })
}

/**
 * "connection: keep-alive
 *  content-length: 13
 *  content-type: application/json; charset=utf-8
 *  date: Mon, 09 Sep 2024 06:14:30 GMT
 *  etag: W/"d-Ssxx4FRxEutDLwo2+xkkxKc4y0k"
 *  keep-alive: timeout=5
 *  x-powered-by: Express"
 * @param headers
 */
export function parseHeaders(headers: string): Record<string, string> {
  let ParsedHeaders: Record<string, string> = Object.create(null)
  headers.split('\r\n').forEach(header => {
    let [key, val] = header.split(': ')
    if (!key) return
    if (key) key = key.trim()
    if (val) val = val.trim()
    ParsedHeaders[key] = val
  })
  return ParsedHeaders
}

/**
 * 根据不同的method拍平headers
 * @param headers axios.request.config.headers
 * @param method axios.request.config.method
 * @returns axios.request.config.headers
 */
export function flattenHeaders(
  headers: AxiosRequestConfig['headers'],
  method: AxiosRequestConfig['method']
): AxiosRequestConfig['headers'] {
  if (!headers || !method) {
    return headers
  }
  // const methodsWithData: AxiosRequestConfig['method'][] = ['post', 'put', 'patch']
  // const methodsNoData: AxiosRequestConfig['method'][] = ['delete', 'get', 'head', 'options']
  headers = deepMerge(headers.common || {}, headers[method] || {}, headers)
  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common']
  methodsToDelete.forEach(method => {
    delete headers![method]
  })
  return headers
}
