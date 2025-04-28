import pool from '../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET': {
        const { username } = req.query;
        if (!username) {
          return res.status(400).json({ error: 'Thiếu username' });
        }

        const result = await pool.query(
          'SELECT id, username, email, password_hash FROM users WHERE username = $1',
          [username]
        );
        const rows = result.rows;

        if (rows.length > 0) {
          return res.status(200).json(rows[0]);
        } else {
          return res.status(404).json({ error: 'Không tìm thấy người dùng' });
        }
      }

      case 'PUT': {
        const { id, username, email, password } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Thiếu user id' });
        }

        // If updating password
        if (password) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          const updatePw = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id',
            [hashedPassword, id]
          );
          if (updatePw.rowCount > 0) {
            return res.status(200).json({ message: 'Cập nhật mật khẩu thành công' });
          }
          return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }

        // If updating username/email
        if (username && email) {
          // kt username conflict
          const userCheck = await pool.query(
            'SELECT id FROM users WHERE username = $1 AND id != $2',
            [username, id]
          );
          if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
          }

          // Check email conflict
          const emailCheck = await pool.query(
            'SELECT id FROM users WHERE email = $1 AND id != $2',
            [email, id]
          );
          if (emailCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Email đã tồn tại' });
          }

          const updateInfo = await pool.query(
            'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id',
            [username, email, id]
          );
          if (updateInfo.rowCount > 0) {
            return res.status(200).json({ message: 'Cập nhật thông tin thành công' });
          }
          return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }

        return res.status(400).json({ error: 'Thiếu thông tin để cập nhật' });
      }

      case 'POST': {
        // reset password action
        const { action, username, newPassword } = req.body;
        if (action === 'reset') {
          if (!username || !newPassword) {
            return res.status(400).json({ error: 'Thiếu username hoặc newPassword' });
          }

          const salt = await bcrypt.genSalt(10);
          const hashed = await bcrypt.hash(newPassword, salt);

          const reset = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE username = $2 RETURNING id',
            [hashed, username]
          );
          if (reset.rowCount > 0) {
            return res.status(200).json({ message: `Reset mật khẩu thành công cho ${username}` });
          }
          return res.status(404).json({ error: 'Người dùng không tồn tại' });
        }
        return res.status(400).json({ error: 'Action không hợp lệ' });
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} không được hỗ trợ` });
    }
  } catch (error) {
    console.error('Lỗi server:', error);
    return res.status(500).json({ error: 'Lỗi server: ' + error.message });
  }
}
