// pages/news/news.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newsList: [
      {
        id: 1,
        title: '浙江电视台《浙里新风采》：温州大学马克思主义学院教工第一党支部',
        image: 'cloud://cloud1-4gs4byk3b4e9d2d2.636c-cloud1-4gs4byk3b4e9d2d2-1329424972/images/news/new1.jpg',
        bgColor: '#3498db',
        date: '2024-03-30',
        source: '温州大学马院',
        intro: '一面旗帜，闪耀党的光辉；一座堡垒，书写教育初心',
        views: 2583
      },
      {
        id: 2,
        title: '红七月 服务月｜暑期社会实践系列报道（二）“泽途传薪火”和“红山素裹”实践队寻访泽雅红色交通站',
        image: 'cloud://cloud1-4gs4byk3b4e9d2d2.636c-cloud1-4gs4byk3b4e9d2d2-1329424972/images/news/new2.jpg',
        bgColor: '#e74c3c',
        date: '2024-07-18',
        source: '温州大学马院',
        intro: '为庆祝中国共产党成立103周年，深入学习贯彻习近平新时代中国特色社会主义思想和党的二十大精神',
        views: 1967
      },
      {
        id: 3,
        title: '红七月 服务月｜暑期社会实践系列报道（三）“泽途传薪火”和“红山素裹”实践队回访泽雅百岁老交通员',
        image: 'cloud://cloud1-4gs4byk3b4e9d2d2.636c-cloud1-4gs4byk3b4e9d2d2-1329424972/images/news/new3.jpg',
        bgColor: '#2ecc71',
        date: '2024-07-19',
        source: '温州大学马院',
        intro: '2024年7月10日，温州大学马克思主义学院教工第一党支部、行政党支部党员带领“泽途传薪火”和“红山素裹”暑期社会实践队一行',
        views: 3242
      },
      {
        id: 4,
        title: '【双创风采】数理学院党员赴泽雅开展寻踪信仰之旅主题党日活动',
        image: 'cloud://cloud1-4gs4byk3b4e9d2d2.636c-cloud1-4gs4byk3b4e9d2d2-1329424972/images/news/new4.jpg',
        bgColor: '#f39c12',
        date: '2024-11-16',
        source: '温州大学数理学院',
        intro: '11月3日，温州大学数理学院赴泽雅开展党员活动，旨在通过实地探访红色文化遗址，加深党员们对温州革命历史的理解',
        views: 4521
      },
      {
        id: 5,
        title: '梧悦·党建｜重温红色印记 寻访红色基因——梧田一中党支部开展走进马鞍岩革命交通驿站主题党日活动',
        image: 'cloud://cloud1-4gs4byk3b4e9d2d2.636c-cloud1-4gs4byk3b4e9d2d2-1329424972/images/news/new5.jpg',
        bgColor: '#9b59b6',
        date: '2024-11-11',
        source: '温州梧田一中',
        intro: '2024年11月9日，梧田一中的党员老师前往泽雅马鞍岩革命交通驿站开展“走访先驱遗迹，发扬红色精神“主题党日活动。',
        views: 1835
      },
      {
        id: 6,
        title: '百年蒲小 和合教育】追寻红色记忆，传承红色基因——蒲岐一小党支部开展走进马鞍岩革命交通驿站主题党日活动',
        image: 'cloud://cloud1-4gs4byk3b4e9d2d2.636c-cloud1-4gs4byk3b4e9d2d2-1329424972/images/news/new6.jpg',
        bgColor: '#1abc9c',
        date: '2024-11-27',
        source: '百年蒲小',
        intro: '为深入学习贯彻习近平新时代中国特色社会主义思想和党的二十届三中全会精神，缅怀先烈的丰功伟绩和艰苦光荣的战争岁月',
        views: 2754
      },
      {
        id: 7,
        title: '惠风党建 | 赓续红色血脉 传承革命精神',
        image: 'cloud://cloud1-4gs4byk3b4e9d2d2.636c-cloud1-4gs4byk3b4e9d2d2-1329424972/images/news/new7.jpg',
        bgColor: '#d35400',
        date: '2024-12-13',
        source: '温州市实验小学',
        intro: '2024年12月8日，温州市实验小学党委组织了一场以“赓续红色血脉 传承革命精神”为主题的党日活动。',
        views: 3127
      },
      {
        id: 8,
        title: '市新闻传媒中心温州新闻网党支部开展“寻访红色足迹”主题党日活动',
        image: 'cloud://cloud1-4gs4byk3b4e9d2d2.636c-cloud1-4gs4byk3b4e9d2d2-1329424972/images/news/new8.jpg',
        bgColor: '#27ae60',
        date: '2025-03-28',
        source: '温州传媒党建',
        intro: '温州市新闻传媒中心温州新闻网党支部近日组织全体党员赴瓯海区泽雅马鞍岩革命交通站，开展"寻访红色足迹，传承革命精神"主题党日活动。',
        views: 2438
      }
    ],
    loading: false,
    isBottom: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '新闻资讯'
    });
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
    this.setData({
      loading: true
    });
    
    // 模拟刷新数据
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1000
      });
      this.setData({
        loading: false
      });
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.isBottom) return;
    
    this.setData({
      loading: true
    });
    
    // 模拟加载更多
    setTimeout(() => {
      this.setData({
        isBottom: true,
        loading: false
      });
    }, 800);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '泽雅文旅资讯',
      path: '/pages/news/news'
    };
  },

  // 查看新闻详情
  viewNewsDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/newsDetail/newsDetail?id=${id}`
    });
  },
  
  // 处理返回按钮点击
  handleBack() {
    wx.navigateBack();
  }
})