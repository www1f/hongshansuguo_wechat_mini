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