const db = wx.cloud.database()
const crypto = require('../../utils/crypto.js')
const config = require('../../utils/config.js')
const errorHandler = require('../../utils/error.js')
const auth = require('../../utils/auth.js')
const loginRateLimiter = require('../../utils/loginRateLimiter.js')

Page({
  data: {
    username: '',
    password: ''
  },
  onLoad() {
    wx.setNavigationBarTitle({
      title: '登录'
    })
  },
  onShow() {
  },
  inputUsername(e) {
    this.setData({
      username: e.detail.value
    })
  },
  inputPassword(e) {
    this.setData({
      password: e.detail.value
    })
  },
  async login() {
    const { username, password } = this.data
    
    if (!username || !password) {
      errorHandler.showWarning('请输入用户名和密码')
      return
    }
    
    // 检查登录限流
    const rateCheck = loginRateLimiter.canLogin(username)
    if (!rateCheck.canLogin) {
      errorHandler.showWarning(rateCheck.message)
      return
    }
    
    errorHandler.showLoading('登录中...')
    
    try {
      // 加密密码
      const encryptedPassword = crypto.encryptPassword(password, username);

      // 调用云函数进行登录
      const res = await wx.cloud.callFunction({
        name: 'login',
        data: {
          phone: username,
          password: encryptedPassword // 传输加密后的密码
        }
      })

      const result = res.result

      if (!result.success) {
        errorHandler.hideLoading()
        errorHandler.showWarning(result.message || '用户名或密码错误')
        loginRateLimiter.recordLoginAttempt(username, false)
        return
      }

      const userData = result.userInfo
      
      // 使用新的认证系统保存登录状态和令牌
      auth.saveLoginToken(userData, 'phone')
      
      // 记录成功登录（清除尝试次数）
      loginRateLimiter.recordLoginAttempt(username, true)

      errorHandler.hideLoading()
      errorHandler.showSuccess('登录成功')
      
      // 跳转到首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 500)
    } catch (err) {
      errorHandler.hideLoading()
      errorHandler.handleError(err, '登录失败，请重试')
      loginRateLimiter.recordLoginAttempt(username, false)
    }
  },

  // 跳转到注册页面
  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  }
}) 