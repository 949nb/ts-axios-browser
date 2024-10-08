import axios from '../../src/index'
import NProgress from 'nprogress'

/**
 * 跨域携带Cookie
 * 为xhr的实例添加 withCredentials: boolean
 * 可以跨域的同时带上cookie
 * 
 * 对cookie来说
 * 1. 可以前端自己设置（问题就是在跨域的时候没办法带上当前域名下的cookie）
 * 2. 通过服务端response setCookie来设置，resonse设置的cookie 跨域请求是可以带上的。这就需要在第一次跨域请求的时候，带上一些身份验证的信息，服务器验证通过之后，再去设置setcookie。
 * 
 * node examples\server2.js (开启8088的本地服务器)
 */
function CORS() {
  axios.get('/more/get').then(res => {
    console.log(res.data)
  })
  
  axios.post('http://127.0.0.1:8088/more/server2', null, {
    withCredentials: true
  }).then(res => {
    console.log(res)
  })
}
// CORS()

/**
 * CSRF 防御
 * CSRF攻击主要是浏览器Cookie自动带入的机制导致在钓鱼网站的假请求带上了用户浏览器内的真cookie
 * 如果能在请求的时候带入一个前后端都认同的token，这样浏览器自动带cookie的行为就不会影响服务端的鉴权
 * 
 * 功能：在请求的时候{
 *     xsrfCookieName: 'XSRF-TOKEN-D',
 *     xsrfHeaderName: 'X-XSRF-TOKEN-D'
 *   }
 */
function CSRF() {
  const instance = axios.create({
    xsrfCookieName: 'XSRF-TOKEN-D',
    xsrfHeaderName: 'X-XSRF-TOKEN-D'
  })

  instance.get('/more/get').then(res => {
    console.log(res.data)
  })
}
// CSRF()

/**
 * 展示上传和下载进度
 */
function processTest() {
    const instance = axios.create()

  function calculatePercentage(loaded: number, total: number) {
    console.log(Math.floor(loaded * 1.0) / total)
    return Math.floor(loaded * 1.0) / total
  }

  function loadProgressBar() {
    const setupStartProgress = () => {
      instance.interceptors.request.use(config => {
        NProgress.start()
        return config
      })
    }

    const setupUpdateProgress = () => {
      const update = (e: ProgressEvent) => {
        console.log(e)
        NProgress.set(calculatePercentage(e.loaded, e.total))
      }
      instance.defaults.onDownloadProgress = update
      instance.defaults.onUploadProgress = update
    }

    const setupStopProgress = () => {
      instance.interceptors.response.use(response => {
        NProgress.done()
        return response
      }, error => {
        NProgress.done()
        return Promise.reject(error)
      })
    }

    setupStartProgress()
    setupUpdateProgress()
    setupStopProgress()
  }

  loadProgressBar()

  const downloadEl = document.getElementById('download')

  downloadEl!.addEventListener('click', e => {
    instance.get('')
  })

  const uploadEl = document.getElementById('upload')

  uploadEl!.addEventListener('click', e => {
    const data = new FormData()
    const fileEl = document.getElementById('file') as HTMLInputElement
    if (fileEl.files) {
      data.append('file', fileEl.files[0])

      instance.post('/more/upload', data)
    }
  })
}
processTest()