import pool from '../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Thiếu username hoặc password' });
  }

  try {
    const result = await pool.query(
      'SELECT username, password_hash FROM users WHERE username = $1',
      [username]
    );
    const rows = result.rows;

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: 'Sai username hoặc password', reason: 'no_user' });
    }

    const { password_hash } = rows[0];
    const isMatch = await bcrypt.compare(password, password_hash);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Sai username hoặc password', reason: 'bad_password' });
    }

    // login thành công
    return res.status(200).json({ success: true, message: 'Đăng nhập thành công' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
  }
}
