Page({

  /**
   * 页面的初始数据
   */
  data: {
    activity: null,
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '活动详情'
    })
    
    // 获取由活动列表页传递的数据
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('acceptActivityData', (data) => {
      this.setData({
        activity: data.activity
      })
    });
  },
  
  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  },
  
  /**
   * 分享活动
   */
  shareActivity() {
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    })
  },
  
  /**
   * 报名参加活动
   */
  joinActivity() {
    wx.showModal({
      title: '报名确认',
      content: `您确定要报名参加"${this.data.activity.title}"活动吗？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '报名成功',
            icon: 'success'
          })
        }
      }
    })
  }
}) 