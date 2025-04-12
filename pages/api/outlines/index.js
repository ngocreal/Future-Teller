import pool from '../../../lib/db';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const [rows] = await pool.query('SELECT * FROM outlines');
        res.status(200).json(rows);
        break;

      case 'POST':
        const { step: postStep, title: postTitle, time: postTime, content: postContent, suggest: postSuggest, emoji: postEmoji } = req.body;

        if (!postTitle) {
          return res.status(400).json({ error: 'Tiêu đề không được để trống' });
        }

        const [existing] = await pool.query('SELECT * FROM outlines WHERE title = ?', [postTitle]);
        if (existing.length > 0) {
          return res.status(400).json({ error: 'Tiêu đề đã tồn tại' });
        }

        await pool.query(
          'INSERT INTO outlines (step, title, time, content, suggest, emoji) VALUES (?, ?, ?, ?, ?, ?)',
          [postStep || '', postTitle, postTime || '', postContent || '', postSuggest || '', postEmoji || '']
        );
        res.status(201).json({ message: 'Thêm thành công' });
        break;

      case 'PUT':
        const { id, step: updateStep, title: updateTitle, time: updateTime, content: updateContent, suggest: updateSuggest, emoji: updateEmoji } = req.body;

        if (!id || isNaN(id)) {
          return res.status(400).json({ error: 'ID không hợp lệ' });
        }
        if (!updateTitle) {
          return res.status(400).json({ error: 'Tiêu đề không được để trống' });
        }

        const [existingUpdate] = await pool.query('SELECT * FROM outlines WHERE title = ? AND id != ?', [updateTitle, id]);
        if (existingUpdate.length > 0) {
          return res.status(400).json({ error: 'Tiêu đề đã tồn tại' });
        }

        const [current] = await pool.query('SELECT * FROM outlines WHERE id = ?', [id]);
        if (current.length === 0) {
          return res.status(404).json({ error: 'Bản ghi không tồn tại' });
        }

        await pool.query(
          'UPDATE outlines SET step = ?, title = ?, time = ?, content = ?, suggest = ?, emoji = ? WHERE id = ?',
          [updateStep || '', updateTitle, updateTime || '', updateContent || '', updateSuggest || '', updateEmoji || '', id]
        );
        res.status(200).json({ message: 'Sửa thành công' });
        break;

      case 'DELETE':
        const { id: deleteId } = req.body;

        if (!deleteId || isNaN(deleteId)) {
          return res.status(400).json({ error: 'ID không hợp lệ' });
        }

        const [record] = await pool.query('SELECT * FROM outlines WHERE id = ?', [deleteId]);
        if (record.length === 0) {
          return res.status(404).json({ error: 'Bản ghi không tồn tại' });
        }

        await pool.query('DELETE FROM outlines WHERE id = ?', [deleteId]);
        res.status(200).json({ message: 'Xóa thành công' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}