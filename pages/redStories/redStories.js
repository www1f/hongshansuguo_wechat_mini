const storyService = require('../../utils/storyService.js')

Page({
  data: {
    stories: [],
    loading: false,
    page: 1,
    hasMore: true
  },
  
  async onLoad() {
    this.setData({ loading: true });
    try {
      const stories = await storyService.getStories(10, 0);
      this.setData({
        stories,
        loading: false,
        hasMore: stories.length === 10
      });
    } catch (error) {
      console.error('加载故事列表失败：', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
      this.setData({ loading: false });
    }
  },
  
  // 加载更多故事
  async loadMore() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ loading: true });
    try {
      const newStories = await storyService.getStories(10, this.data.stories.length);
      this.setData({
        stories: [...this.data.stories, ...newStories],
        loading: false,
        hasMore: newStories.length === 10
      });
    } catch (error) {
      console.error('加载更多故事失败：', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
      this.setData({ loading: false });
    }
  },
  
  // 下拉刷新
  async onPullDownRefresh() {
    try {
      const stories = await storyService.getStories(10, 0);
      this.setData({
        stories,
        hasMore: stories.length === 10
      });
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('刷新故事列表失败：', error);
      wx.showToast({
        title: '刷新失败',
        icon: 'error'
      });
    } finally {
      wx.stopPullDownRefresh();
    }
  },
  
  // 上拉加载更多
  onReachBottom() {
    this.loadMore();
  },
  
  // 查看故事详情
  viewStoryDetail(e) {
    const story = e.currentTarget.dataset.story;
    if (!story || !story._id) {
      wx.showToast({
        title: '故事数据错误',
        icon: 'error'
      });
      return;
    }
    
    wx.navigateTo({
      url: `../storyDetail/storyDetail?id=${story._id}`
    });
  }
}); 