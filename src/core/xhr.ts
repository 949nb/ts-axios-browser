import { transformResponse } from '../helpers/data'
import { parseHeaders } from '../helpers/headers'
import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from '../types'
import { createAxiosError } from '../helpers/error'
import { isFormData, transform } from '../helpers/util'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      data = null,
      url,
      method = 'get',
      headers = {},
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfCookieName,
      xsrfHeaderName,
      auth,
      validateStatus,
      onDownloadProgress,
      onUploadProgress
    } = config

    const request = new XMLHttpRequest()

    request.open(method.toUpperCase(), url!, true)

    configureRequest()

    addEvents()

    processHeaders()

    processCancel()

    request.send(data)

    function handleResponse(response: AxiosResponse): void {
      if (!validateStatus || validateStatus(response.status)) resolve(response)
      else {
        reject(
          createAxiosError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }

    function configureRequest(): void {
      if (responseType) request.responseType = responseType
      if (timeout) request.timeout = timeout
      if (withCredentials) request.withCredentials = true
    }

    function addEvents(): void {
      request.onreadystatechange = function handleLoad() {
        if (request.readyState !== 4) return
        if (request.status === 0) return
        const responseHeaders = request.getAllResponseHeaders()
        const responseData =
          responseType && responseType !== 'text' ? request.response : request.responseText
        const response: AxiosResponse = {
          data: transformResponse(responseData, request.responseType),
          status: request.status,
          statusText: request.statusText,
          headers: parseHeaders(responseHeaders),
          config,
          request
        }
        response.data = transform(response.data, response.headers, config.transformResponse)
        handleResponse(response)
      }
      request.ontimeout = () =>
        reject(
          createAxiosError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request)
        )
      request.onerror = () => reject(createAxiosError('Network Error', config, null, request))
      if (onDownloadProgress) request.onprogress = onDownloadProgress
      if (onUploadProgress) request.upload.onprogress = onUploadProgress
    }

    function processHeaders(): void {
      if (isFormData(data)) delete headers['Content-Type']

      if (auth) headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)

      if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
        const xsrfValue = cookie.read(xsrfCookieName)
        if (xsrfValue) {
          headers[xsrfHeaderName!] = xsrfValue
        }
      }

      Object.keys(headers).forEach(name => {
        if (data === null && name.toLowerCase() === 'content-type') {
          delete headers[name]
        } else {
          request.setRequestHeader(name, headers[name])
        }
      })
    }

    function processCancel(): void {
      if (cancelToken) {
        cancelToken.promise.then(reason => {
          request.abort()
          reject(reason)
        })
      }
    }
  })
}
