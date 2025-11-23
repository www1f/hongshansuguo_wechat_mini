/**
 * 密码加密工具
 * 使用 MD5 双层加密算法
 * 
 * 加密流程：
 * 1. 第一层 MD5: MD5(password)
 * 2. 生成盐值: MD5(phoneNumber + secretKey)
 * 3. 第二层 MD5: MD5(第一层结果 + 盐值)
 */

/**
 * MD5 哈希函数 - 标准实现
 * @param {string} str - 要哈希的字符串
 * @returns {string} - 32位16进制 MD5 哈希值
 */
function md5(str) {
  // MD5 初始变量
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  
  // 预处理：计算消息长度（以位为单位）
  const len = str.length * 8;
  
  // 预处理：填充消息
  let msg = str;
  msg += '\x80';
  while ((msg.length % 64) !== 56) msg += '\x00';
  
  // 附加原始消息长度
  for (let i = 0; i < 8; i++) {
    msg += String.fromCharCode((len >>> (i * 8)) & 0xff);
  }
  
  // MD5 常量表
  const constants = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ];
  
  // 循环处理每个 512 位块
  for (let offset = 0; offset < msg.length; offset += 64) {
    const x = [];
    for (let i = 0; i < 16; i++) {
      x[i] = (msg.charCodeAt(offset + i * 4) & 0xff) |
             ((msg.charCodeAt(offset + i * 4 + 1) & 0xff) << 8) |
             ((msg.charCodeAt(offset + i * 4 + 2) & 0xff) << 16) |
             ((msg.charCodeAt(offset + i * 4 + 3) & 0xff) << 24);
    }
    
    let [aa, bb, cc, dd] = [a, b, c, d];
    
    for (let i = 0; i < 64; i++) {
      let f, g;
      if (i < 16) {
        f = (bb & cc) | (~bb & dd);
        g = i;
      } else if (i < 32) {
        f = (dd & bb) | (~dd & cc);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = bb ^ cc ^ dd;
        g = (3 * i + 5) % 16;
      } else {
        f = cc ^ (bb | ~dd);
        g = (7 * i) % 16;
      }
      
      const shift = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
                     5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
                     4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
                     6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21][i];
      
      const temp = (aa + f + constants[i] + x[g]) >>> 0;
      aa = (temp >>> (32 - shift)) | ((temp << shift) & 0xffffffff);
      [aa, bb, cc, dd] = [dd, (aa + bb) >>> 0, bb, cc];
    }
    
    a = (a + aa) >>> 0;
    b = (b + bb) >>> 0;
    c = (c + cc) >>> 0;
    d = (d + dd) >>> 0;
  }
  
  // 输出最终的 MD5 哈希值（小端字节序）
  const toHex = (n) => {
    let hex = '';
    for (let i = 0; i < 4; i++) {
      hex += ('0' + ((n >>> (i * 8)) & 0xff).toString(16)).slice(-2);
    }
    return hex;
  };
  
  return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}

/**
 * 生成盐值
 * @param {string} phoneNumber - 手机号作为盐值的一部分
 * @returns {string} - 盐值（32位16进制字符串）
 */
function generateSalt(phoneNumber) {
  const secretKey = 'RedMountainBareBeauty#2025@Security';
  return md5(phoneNumber + secretKey);
}

/**
 * 加密密码 - 双层 MD5
 * @param {string} password - 原始密码
 * @param {string} phoneNumber - 手机号（用于生成盐值）
 * @returns {string} - 加密后的密码
 */
function encryptPassword(password, phoneNumber) {
  if (!password || !phoneNumber) {
    throw new Error('密码和手机号不能为空');
  }
  
  // 第一层 MD5
  const firstHash = md5(password);
  
  // 生成盐值
  const salt = generateSalt(phoneNumber);
  
  // 第二层 MD5：MD5(firstHash + salt)
  const secondHash = md5(firstHash + salt);
  
  return secondHash;
}

/**
 * 验证密码
 * @param {string} inputPassword - 用户输入的密码
 * @param {string} storedPassword - 数据库中存储的加密密码
 * @param {string} phoneNumber - 手机号
 * @returns {boolean} - 密码是否匹配
 */
function verifyPassword(inputPassword, storedPassword, phoneNumber) {
  try {
    const encryptedInput = encryptPassword(inputPassword, phoneNumber);
    return encryptedInput === storedPassword;
  } catch (error) {
    console.error('密码验证失败:', error);
    return false;
  }
}

module.exports = {
  encryptPassword,
  verifyPassword
};
