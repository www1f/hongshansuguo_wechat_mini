Page({
  data: {
    mapUrl: '/images/map.jpg'
  },

  onLoad() {
    // 页面加载时的处理
  },

  // 图片加载失败处理
  imageError(e) {
    console.error('图片加载失败', e)
    wx.showToast({
      title: '图片加载失败',
      icon: 'none'
    })
  }
}) 