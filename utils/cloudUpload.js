/**
 * 云存储上传工具
 */

// 云存储目录映射
const cloudDirs = {
  products: 'images/products/',
  cultural: 'images/cultural/',
  banners: 'images/banners/',
  avatars: 'images/avatars/',
  icons: 'images/icons/',
  navIcons: 'images/navIcons/',
  tabbar: 'images/tabbar/'
};

/**
 * 上传单个文件到云存储
 * @param {string} filePath - 本地文件路径
 * @param {string} cloudDir - 云存储目录
 * @param {string} fileName - 文件名
 * @returns {Promise} 返回云存储文件ID
 */
const uploadFile = (filePath, cloudDir, fileName) => {
  return new Promise((resolve, reject) => {
    wx.cloud.uploadFile({
      cloudPath: `${cloudDir}${fileName}`,
      filePath: filePath,
      success: res => {
        resolve(res.fileID);
      },
      fail: err => {
        console.error('上传失败', err);
        reject(err);
      }
    });
  });
};

/**
 * 批量上传文件
 * @param {Array} files - 文件数组,每个元素包含 {path, dir, name}
 * @returns {Promise} 返回所有文件的云存储ID数组
 */
const batchUpload = async (files) => {
  const results = [];
  for (const file of files) {
    try {
      const fileID = await uploadFile(file.path, cloudDirs[file.dir], file.name);
      results.push({
        originalPath: file.path,
        cloudPath: `${cloudDirs[file.dir]}${file.name}`,
        fileID: fileID
      });
    } catch (error) {
      console.error(`文件 ${file.path} 上传失败:`, error);
      results.push({
        originalPath: file.path,
        error: error
      });
    }
  }
  return results;
};

/**
 * 上传商品图片
 * @param {Array} productImages - 商品图片数组
 */
const uploadProductImages = async (productImages) => {
  const files = productImages.map((img, index) => ({
    path: img,
    dir: 'products',
    name: `product_${String(index + 1).padStart(3, '0')}.png`
  }));
  return await batchUpload(files);
};

/**
 * 上传文物图片
 * @param {Array} culturalImages - 文物图片数组
 */
const uploadCulturalImages = async (culturalImages) => {
  const files = culturalImages.map((img, index) => ({
    path: img,
    dir: 'cultural',
    name: `cultural_${String(index + 1).padStart(3, '0')}.png`
  }));
  return await batchUpload(files);
};

/**
 * 上传图标
 * @param {Array} icons - 图标数组
 */
const uploadIcons = async (icons) => {
  const files = icons.map(icon => ({
    path: icon.path,
    dir: icon.dir || 'icons',
    name: icon.name
  }));
  return await batchUpload(files);
};

module.exports = {
  uploadFile,
  batchUpload,
  uploadProductImages,
  uploadCulturalImages,
  uploadIcons
}; 