// node scripts/hash.js
const bcrypt = require('bcryptjs');

const password = '1234'; // đổi thành mk muốn hash
const saltRounds = 10;

bcrypt.hash(password, saltRounds).then(hash => {
  console.log('Mật khẩu mã hóa:', hash);
});
