import db from '../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  console.log('👉 Login request:', req.method, req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;

  try {
    // Lấy user
    const [rows] = await db.execute(
      'SELECT username, password_hash FROM users WHERE username = ?',
      [username]
    );
    console.log('    → DB rows:', rows);

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: 'Sai username hoặc password', reason: 'no_user' });
    }

    const { password_hash } = rows[0];
    console.log('    → Stored hash:', password_hash);

    // So sánh bcrypt
    const isMatch = await bcrypt.compare(password, password_hash);
    console.log('    → Password match?', isMatch);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Sai username hoặc password', reason: 'bad_password' });
    }

    // Thành công
    console.log('Login successful for', username); 
    return res.status(200).json({ success: true, message: 'Đăng nhập thành công' });
  } catch (err) {
    console.error('Login error:', err); 
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
}