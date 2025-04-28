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
      console.error('Lỗi server (GET):', error);
      res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
  } else if (req.method === 'PUT') {
    const { id, username, email, password } = req.body;

    try {
      // Trường hợp cập nhật mật khẩu
      if (password) {
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
      }
      // Trường hợp cập nhật username và email
      else if (id && username && email) {
        // Kiểm tra username có trùng không
        const [usernameCheck] = await db.execute(
          'SELECT id FROM users WHERE username = ? AND id != ?',
          [username, id]
        );
        if (usernameCheck.length > 0) {
          return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
        }

        // Kiểm tra email có trùng không
        const [emailCheck] = await db.execute(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [email, id]
        );
        if (emailCheck.length > 0) {
          return res.status(400).json({ error: 'Email đã tồn tại' });
        }

        // Cập nhật username và email
        const [result] = await db.execute(
          'UPDATE users SET username = ?, email = ? WHERE id = ?',
          [username, email, id]
        );
        if (result.affectedRows > 0) {
          res.status(200).json({ message: 'Cập nhật thông tin thành công' });
        } else {
          res.status(404).json({ error: 'Người dùng không tồn tại' });
        }
      } else {
        res.status(400).json({ error: 'Thiếu thông tin cần thiết (id, username, email hoặc password)' });
      }
    } catch (error) {
      console.error('Lỗi server (PUT):', error);
      res.status(500).json({ error: 'Lỗi server: ' + error.message });
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
      console.error('Lỗi server (POST):', error);
      res.status(500).json({ error: 'Lỗi server: ' + error.message });
    }
  } else {
    res.status(405).json({ error: 'Phương thức không được hỗ trợ' });
  }
}