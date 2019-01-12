module.exports = {
  upstream: 'http://d-api.cubinote.com/home/printmail',
  ak: 'e8562670b6c840688f34044309b0fdd0',
  domain: 'jcz.onl',
  maxSize: 1400 * 1024, // 1.4MB, because upstream can only receive 2M at most with base64 encoding
  debug: true,
};
