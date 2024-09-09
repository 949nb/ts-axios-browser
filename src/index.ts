import { buildData } from './helpers/data'
import { bulidURL } from './helpers/url'
import { AxiosRequestConfig, AxiosError as AxiosErrorOrigin } from './types'
import xhr from './xhr'
function axios(config: AxiosRequestConfig) {
  processConfig(config)
  return xhr(config)
}

function processConfig(config: AxiosRequestConfig): void {
  transformUrl(config)
  transformRequestData(config)
}

function transformUrl(config: AxiosRequestConfig): void {
  bulidURL(config)
}
function transformRequestData(config: AxiosRequestConfig): void {
  buildData(config)
}

export type AxiosError = AxiosErrorOrigin
export default axios
