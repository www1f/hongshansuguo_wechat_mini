const db = wx.cloud.database()
const errorHandler = require('../../utils/error.js')
const auth = require('../../utils/auth.js')

Page({
  data: {
    userInfo: {
      nickName: "",
      avatarUrl: "",
      phoneNumber: "",
      email: ""
    },
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    // 侧滑栏相关已移除
  },

  onLoad() {
    this.getUserData()
  },

  onShow() {
    // 每次显示页面时刷新用户数据
    this.getUserData()
  },

  // 从云数据库获取用户信息
  async getUserData() {
    try {
      // 使用新的认证系统获取用户信息
      const authenticatedUser = auth.getAuthenticatedUser()
      
      if (!authenticatedUser) {
        // 用户未登录或登录已过期
        wx.navigateTo({
          url: '/pages/login/login'
        })
        return
      }
      
      // 从数据库获取最新用户信息
      const res = await db.collection('users').where({
        _id: authenticatedUser._id
      }).get()
      
      if (res.data.length > 0) {
        const userData = res.data[0]
        this.setData({
          userInfo: {
            nickName: userData.nickName || '',
            avatarUrl: userData.avatarUrl || '',
            phoneNumber: userData.phoneNumber || '',
            email: userData.email || ''
          },
          hasUserInfo: true
        })
        
        // 更新认证系统中的用户信息（过滤掉保留字段）
        const safeUserData = {
          nickName: userData.nickName,
          avatarUrl: userData.avatarUrl,
          phoneNumber: userData.phoneNumber,
          email: userData.email,
          gender: userData.gender
        }
        auth.updateUserInfo(safeUserData)
      } else {
        // 用户信息不存在，可能已被删除
        auth.clearLogin()
        wx.navigateTo({
          url: '/pages/login/login'
        })
      }
    } catch (err) {
      errorHandler.handleError(err, '获取用户信息失败')
    }
  },

  // 点击图片预览（放大）
  previewImage(e) {
    const imageSrc = e.currentTarget.dataset.imageSrc
    
    // 将 cloud ID 转换为 HTTP URL 用于预览
    wx.cloud.getTempFileURL({
      fileList: [imageSrc],
      success: res => {
        if (res.fileList && res.fileList[0]) {
          const httpUrl = res.fileList[0].tempFileURL
          wx.previewImage({
            urls: [httpUrl], // 需要是 HTTP URL 数组
            current: httpUrl // 当前显示的图片链接
          })
        }
      },
      fail: err => {
        console.error('获取图片临时链接失败:', err)
        wx.showToast({
          title: '预览失败',
          icon: 'none'
        })
      }
    })
  },

  // 长按保存图片
  saveImage(e) {
    const imageSrc = e.currentTarget.dataset.imageSrc
    
    wx.showModal({
      title: '保存图片',
      content: '是否保存此图片到相册？',
      success: (res) => {
        if (res.confirm) {
          // 用户点击确定
          this.downloadAndSaveImage(imageSrc)
        }
      }
    })
  },

  // 下载并保存图片
  downloadAndSaveImage(imageSrc) {
    wx.showLoading({
      title: '保存中...',
    })

    // 先将 cloud ID 转换为 HTTP URL
    wx.cloud.getTempFileURL({
      fileList: [imageSrc],
      success: res => {
        if (res.fileList && res.fileList[0]) {
          const httpUrl = res.fileList[0].tempFileURL
          
          // 下载图片到本地
          wx.downloadFile({
            url: httpUrl,
            success: (downloadRes) => {
              if (downloadRes.statusCode === 200) {
                // 保存图片到系统相册
                wx.saveImageToPhotosAlbum({
                  filePath: downloadRes.tempFilePath,
                  success: () => {
                    wx.hideLoading()
                    wx.showToast({
                      title: '保存成功',
                      icon: 'success',
                      duration: 2000
                    })
                  },
                  fail: (saveErr) => {
                    wx.hideLoading()
                    console.error('保存失败:', saveErr)
                    
                    // 处理权限问题
                    if (saveErr.errMsg.includes('auth deny') || saveErr.errMsg.includes('authorized')) {
                      this.showAuthGuide()
                    } else {
                      wx.showToast({
                        title: '保存失败',
                        icon: 'none'
                      })
                    }
                  }
                })
              }
            },
            fail: (downloadErr) => {
              wx.hideLoading()
              console.error('下载失败:', downloadErr)
              wx.showToast({
                title: '下载失败',
                icon: 'none'
              })
            }
          })
        }
      },
      fail: err => {
        wx.hideLoading()
        console.error('获取图片链接失败:', err)
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    })
  },

  // 显示权限引导
  showAuthGuide() {
    wx.showModal({
      title: '需要相册权限',
      content: '保存图片需要您授权访问相册，请在设置中开启相册权限',
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting({
            success: (settingRes) => {
              console.log('用户设置结果:', settingRes)
            }
          })
        }
      }
    })
  },

  // 跳转到我的预约
  goToAppointment() {
    wx.navigateTo({
      url: '/pages/appointment/appointment'
    })
  },

  // 跳转到我的反馈
  goToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    })
  },

  // 联系人工客服
  contactService() {
    wx.makePhoneCall({
      phoneNumber: '400-xxx-xxxx'
    })
  },

  // 编辑资料入口（占位，不新建页面）
  goToEditProfile() {
    wx.navigateTo({
      url: '/pages/userInfoEdit/userInfoEdit'
    })
  }
}) 
