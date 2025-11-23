Page({
  data: {
    content: '',
    images: []
  },

  // 输入反馈内容
  inputContent(e) {
    this.setData({
      content: e.detail.value
    })
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          images: [...this.data.images, ...res.tempFilePaths]
        })
      }
    })
  },

  // 提交反馈
  submitFeedback() {
    if (!this.data.content) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '提交中...'
    })

    // 模拟提交
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateBack()
          }, 2000)
        }
      })
    }, 1500)
  }
}) 