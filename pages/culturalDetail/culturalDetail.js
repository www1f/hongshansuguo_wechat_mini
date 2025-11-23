const cloudImage = require('../../utils/cloudImage.js')

Page({
  data: {
    id: null,
    cultural: null,
    isCollected: false,
    safeAreaBottom: 0,
    screenHeight: 0,
    navBarHeight: 90, // 默认导航栏高度
    scrollViewHeight: 'calc(100vh - 90px)' // 默认滚动视图高度
  },
  
  onLoad(options) {
    const { id } = options
    this.setData({
      id: id
    })
    
    // 获取设备信息，适配不同机型
    this.getDeviceInfo()
    
    // 根据ID获取文物详情
    this.getCulturalDetail()
  },
  
  // 获取设备信息，适配不同机型
  getDeviceInfo() {
    try {
      // 获取系统信息
      const systemInfo = wx.getSystemInfoSync()
      
      // 获取安全区域
      const safeArea = systemInfo.safeArea
      const screenHeight = systemInfo.screenHeight
      
      // 计算底部安全区域高度
      const safeAreaBottom = screenHeight - safeArea.bottom
      
      // 适配导航栏高度
      let navBarHeight = 90
      if (systemInfo.statusBarHeight) {
        navBarHeight = systemInfo.statusBarHeight + 44 // 44是导航栏主体高度
      }
      
      this.setData({
        safeAreaBottom: safeAreaBottom,
        screenHeight: screenHeight,
        navBarHeight: navBarHeight,
        scrollViewHeight: `calc(100vh - ${navBarHeight}px)`
      })
    } catch (e) {
      console.error('获取设备信息失败', e)
    }
  },
  
  async getCulturalDetail() {
    try {
      const db = wx.cloud.database()
      const result = await db.collection('cultural')
        .doc(this.data.id)
        .get()

      if (result.data) {
        // 获取文物图片的临时链接
        const tempFileURLs = await cloudImage.batchGetTempFileURL([result.data.image])
        const tempFileURL = tempFileURLs[0]
        
        const cultural = {
          ...result.data,
          image: tempFileURL
        }

        this.setData({
          cultural: cultural
        })
        
        // 设置导航栏标题
        wx.setNavigationBarTitle({
          title: cultural.name
        })
      } else {
        wx.showToast({
          title: '未找到文物详情',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('获取文物详情失败：', error)
      wx.showToast({
        title: '获取文物详情失败',
        icon: 'error'
      })
    }
  },
  
  toggleCollect() {
    this.setData({
      isCollected: !this.data.isCollected
    })
    
    wx.showToast({
      title: this.data.isCollected ? '收藏成功' : '取消收藏',
      icon: 'success'
    })
  },
  
  previewImage() {
    // 如果图片存在才预览
    if (this.data.cultural && this.data.cultural.image) {
      wx.previewImage({
        urls: [this.data.cultural.image],
        current: this.data.cultural.image
      })
    } else {
      wx.showToast({
        title: '暂无高清图片',
        icon: 'none'
      })
    }
  },
  
  // 页面分享功能
  onShareAppMessage() {
    if (this.data.cultural) {
      return {
        title: this.data.cultural.name,
        path: `/pages/culturalDetail/culturalDetail?id=${this.data.id}`
      }
    }
    return {
      title: '红山文物展示',
      path: '/pages/cultural/cultural'
    }
  }
}) 