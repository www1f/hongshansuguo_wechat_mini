Page({
  data: {
    id: null,
    newsDetail: null,
    imageError: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({
        id: options.id
      }, () => {
        this.getNewsDetail();
      });
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  /**
   * 获取新闻详情
   */
  getNewsDetail() {
    const that = this;
    const db = wx.cloud.database();
    
    // 直接通过doc方法获取指定_id的文档
    db.collection('news').doc(this.data.id).get({
      success: function(res) {
        // 找到匹配的记录
        const newsDetail = res.data;
        
        that.setData({
          newsDetail: newsDetail,
          imageError: false
        });
        
        // 更新浏览量
        that.updateNewsViews(newsDetail._id);
      },
      fail: function(err) {
        console.error('查询新闻详情失败:', err);
        wx.showToast({
          title: '新闻不存在',
          icon: 'none'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    });
  },

  updateNewsViews(newsId) {
    const that = this; // 保存this引用
    const db = wx.cloud.database();
    const _ = db.command;
    
    db.collection('news').doc(newsId).update({
      data: {
        views: _.inc(1) // 浏览量加1
      },
      success: function(res) {
        let newsDetail = that.data.newsDetail;

        let currentViews = parseInt(newsDetail.views) || 0;
        newsDetail.views = currentViews + 1;
        
        that.setData({
          newsDetail: newsDetail
        });

      },
      fail: function(err) {
        console.error('浏览量更新失败:', err);
        // 显示具体错误信息
        wx.showToast({
          title: '更新失败',
          icon: 'none'
        });
      }
    });
  },

  onImageError() {
    this.setData({ imageError: true });
  },

  /**
   * 处理返回按钮点击
   */
  handleBack() {
    wx.navigateBack();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: this.data.newsDetail?.title || '泽雅新闻',
      path: `/pages/newsDetail/newsDetail?id=${this.data.id}`
    };
  }
});
