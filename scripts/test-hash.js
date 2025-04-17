// node scripts/test-hash.js
const bcrypt = require('bcryptjs');

const hashFromDb = '$2b$10$2ncaILAnK2wU16IUEDdO3OcvOwVsYlfTRBdDM6wxinqmI3.2U9Nji';  
const password = '1234';  // mật khẩu gõ ở form

bcrypt.compare(password, hashFromDb)
  .then(isMatch => console.log('Match?', isMatch))
  .catch(err => console.error(err));
