import db from '../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { username } = req.query;
    try {
      const [rows] = await db.execute(
        'SELECT id, username, email, password_hash FROM users WHERE username = ?',
        [username]
      );
      if (rows.length > 0) {
        res.status(200).json(rows[0]);
      } else {
        res.status(404).json({ error: 'Không tìm thấy người dùng' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Lỗi server' });
    }
  } else if (req.method === 'PUT') {
    const { id, password } = req.body;
    try {
      // Mã hóa mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const [result] = await db.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [hashedPassword, id]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Cập nhật mật khẩu thành công' });
      } else {
        res.status(404).json({ error: 'Người dùng không tồn tại' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Lỗi server' });
    }
  } else if (req.method === 'POST' && req.body.action === 'reset') {
    const { username, newPassword } = req.body;
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const [result] = await db.execute(
        'UPDATE users SET password_hash = ? WHERE username = ?',
        [hashedPassword, username]
      );
      if (result.affectedRows > 0) {
        res.status(200).json({ message: `Reset mật khẩu thành công cho ${username}. Mật khẩu mới: ${newPassword}` });
      } else {
        res.status(404).json({ error: 'Người dùng không tồn tại' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Lỗi server' });
    }
  } else {
    res.status(405).json({ error: 'Phương thức không được hỗ trợ' });
  }
}