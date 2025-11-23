/**
 * 云存储图片处理工具
 */

/**
 * 获取云存储图片的临时链接
 * @param {string} fileID - 云存储文件ID
 * @returns {Promise} 返回临时链接
 */
const getTempFileURL = (fileID) => {
  return new Promise((resolve, reject) => {
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        if (res.fileList && res.fileList[0]) {
          resolve(res.fileList[0].tempFileURL);
        } else {
          reject(new Error('获取临时链接失败'));
        }
      },
      fail: err => {
        reject(err);
      }
    });
  });
};

/**
 * 批量获取云存储图片的临时链接
 * @param {Array} fileIDs - 云存储文件ID数组
 * @returns {Promise} 返回临时链接数组
 */
const batchGetTempFileURL = async (fileIDs) => {
  try {
    const res = await wx.cloud.getTempFileURL({
      fileList: fileIDs
    });
    return res.fileList.map(file => file.tempFileURL);
  } catch (error) {
    console.error('批量获取临时链接失败:', error);
    throw error;
  }
};

const cloudImage = {
  /**
   * 批量获取云存储文件的临时链接
   * @param {Array} fileIDs - 云存储文件ID数组
   * @returns {Promise<Array>} - 临时链接数组
   */
  async batchGetTempFileURL(fileIDs) {
    if (!fileIDs || !Array.isArray(fileIDs) || fileIDs.length === 0) {
      throw new Error('无效的文件ID数组')
    }

    try {
      const { fileList } = await wx.cloud.getTempFileURL({
        fileList: fileIDs
      })
      
      if (!fileList || fileList.length === 0) {
        throw new Error('未获取到文件列表')
      }

      const urls = fileList.map(file => {
        if (!file.tempFileURL) {
          console.error(`文件 ${file.fileID} 获取临时链接失败:`, file.errMsg)
          return null
        }
        return file.tempFileURL
      }).filter(url => url !== null)

      return urls
    } catch (error) {
      console.error('获取临时链接失败:', error)
      throw error
    }
  },

  /**
   * 上传图片到云存储
   * @param {String} filePath - 本地文件路径
   * @param {String} cloudPath - 云存储路径
   * @returns {Promise<Object>} - 上传结果
   */
  async uploadImage(filePath, cloudPath) {
    if (!filePath || !cloudPath) {
      throw new Error('文件路径和云存储路径不能为空')
    }

    try {
      const result = await wx.cloud.uploadFile({
        cloudPath,
        filePath
      })
      
      if (!result.fileID) {
        throw new Error('上传失败，未获取到文件ID')
      }

      return result
    } catch (error) {
      console.error('上传图片失败:', error)
      throw error
    }
  }
};

module.exports = cloudImage; 