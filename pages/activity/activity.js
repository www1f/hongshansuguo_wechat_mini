// pages/activity/activity.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activities: [
      {
        id: 1,
        title: '红山文化遗址探访',
        date: '2023-10-15',
        location: '浙江省温州市乐清市泽雅镇',
        image: '/images/activity1.jpg',
        description: '探访红山文化遗址，了解古代红山文明的发展历程和文化特色，体验传统工艺制作。',
        participants: 68
      },
      {
        id: 2,
        title: '乡村手工艺工作坊',
        date: '2023-11-20',
        location: '浙江省温州市乐清市泽雅镇文化广场',
        image: '/images/activity2.jpg',
        description: '学习传统手工艺技巧，制作泽雅特色工艺品，传承非物质文化遗产。',
        participants: 45
      },
      {
        id: 3,
        title: '农耕文化体验日',
        date: '2023-12-05',
        location: '浙江省温州市乐清市泽雅镇生态农场',
        image: '/images/activity3.jpg',
        description: '体验传统农耕文化，参与稻田劳作，了解农作物种植过程，品尝农家美食。',
        participants: 52
      },
      {
        id: 4,
        title: '红色文化讲座系列',
        date: '2024-01-10',
        location: '浙江省温州市乐清市泽雅镇党群服务中心',
        image: '/images/activity4.jpg',
        description: '邀请专家学者举办红色文化讲座，深入了解革命历史和红色精神。',
        participants: 75
      }
    ],
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '精彩活动'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 模拟刷新数据
    setTimeout(() => {
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      });
      // 停止下拉刷新
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 跳转到活动详情页
   */
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    const activity = this.data.activities.find(item => item.id === id);
    
    wx.navigateTo({
      url: '../activityDetail/activityDetail',
      success: function(res) {
        // 传递数据给详情页
        res.eventChannel.emit('acceptActivityData', { activity: activity })
      }
    })
  }
})