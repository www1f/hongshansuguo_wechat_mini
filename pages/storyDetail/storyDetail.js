const db = wx.cloud.database();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    story: null,
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    try {
      const id = options.id;
      if (!id) {
        throw new Error('缺少故事ID');
      }

      const result = await db.collection('stories')
        .doc(id)
        .get();

      if (result.data) {
        wx.setNavigationBarTitle({
          title: result.data.title
        });
        
        this.setData({
          id: id,
          story: result.data,
          loading: false
        });
      } else {
        throw new Error('故事不存在');
      }
    } catch (error) {
      console.error('加载故事详情失败：', error);
      wx.showToast({
        title: '故事不存在',
        icon: 'error'
      });
      
      // 使用 setTimeout 延迟返回，避免动画冲突
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        });
      }, 1500);
    }
  },
  
  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },
  
  /**
   * 分享故事
   */
  shareStory() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },
  
  /**
   * 跳转到其他故事详情
   */
  goToStory(e) {
    const id = e.currentTarget.dataset.id;
    // 重新加载当前页面，但传入不同的id
    wx.redirectTo({
      url: `../storyDetail/storyDetail?id=${id}`
    });
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: this.data.story?.title || '红色故事',
      path: `/pages/storyDetail/storyDetail?id=${this.data.id}`
    };
  }
}) 