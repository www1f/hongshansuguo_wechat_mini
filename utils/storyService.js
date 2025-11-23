/**
 * 故事数据服务
 */
const db = wx.cloud.database();

/**
 * 获取故事列表
 * @param {number} limit - 限制返回的数量
 * @param {number} skip - 跳过的数量（用于分页）
 * @returns {Promise<Array>} 故事列表
 */
async function getStories(limit = 10, skip = 0) {
  try {
    const result = await db.collection('stories')
      .field({
        _id: true,
        title: true,
        content: true,
        image: true,
        date: true
      })
      .orderBy('date', 'desc')
      .skip(skip)
      .limit(limit)
      .get();
    
    return result.data;
  } catch (error) {
    console.error('获取故事列表失败：', error);
    throw error;
  }
}

/**
 * 获取首页推荐故事（最新或精选的少量故事）
 * @param {number} limit - 限制返回的数量，默认为2
 * @returns {Promise<Array>} 推荐故事列表
 */
async function getFeaturedStories(limit = 2) {
  try {
    const result = await db.collection('stories')
      .field({
        _id: true,
        title: true,
        content: true,
        image: true,
        date: true
      })
      .orderBy('date', 'desc')
      .limit(limit)
      .get();
    
    return result.data;
  } catch (error) {
    console.error('获取推荐故事失败：', error);
    throw error;
  }
}

module.exports = {
  getStories,
  getFeaturedStories
}; 