import pool from '../../../lib/db';
import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
});

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export const config = {
  api: {
    bodyParser: false,
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
        await runMiddleware(req, res, upload.single('image'));
        const { step: postStep, title: postTitle, time: postTime, content: postContent, suggest: postSuggest, emoji: postEmoji } = req.body;

        const [existing] = await pool.query('SELECT * FROM outlines WHERE title = ?', [postTitle]);
        if (existing.length > 0) {
          return res.status(400).json({ error: 'Tiêu đề đã tồn tại' });
        }

        const image = req.file ? `/uploads/${req.file.filename}` : null;
        await pool.query(
          'INSERT INTO outlines (step, title, time, content, suggest, emoji, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [postStep, postTitle, postTime, postContent, postSuggest, postEmoji, image]
        );
        res.status(201).json({ message: 'Thêm thành công' });
        break;

      case 'PUT':
        await runMiddleware(req, res, upload.single('image'));
        const { id, step: updateStep, title: updateTitle, time: updateTime, content: updateContent, suggest: updateSuggest, emoji: updateEmoji } = req.body;

        const [existingUpdate] = await pool.query('SELECT * FROM outlines WHERE title = ? AND id != ?', [updateTitle, id]);
        if (existingUpdate.length > 0) {
          return res.status(400).json({ error: 'Tiêu đề đã tồn tại' });
        }

        const [current] = await pool.query('SELECT image FROM outlines WHERE id = ?', [id]);
        if (req.file && current[0]?.image) {
          const oldImagePath = path.join(process.cwd(), 'public', current[0].image);
          await fs.unlink(oldImagePath).catch(() => {});
        }

        const updateImage = req.file ? `/uploads/${req.file.filename}` : current[0]?.image;
        await pool.query(
          'UPDATE outlines SET step = ?, title = ?, time = ?, content = ?, suggest = ?, emoji = ?, image = ? WHERE id = ?',
          [updateStep, updateTitle, updateTime, updateContent, updateSuggest, updateEmoji, updateImage, id]
        );
        res.status(200).json({ message: 'Sửa thành công' });
        break;

      case 'DELETE':
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        await new Promise(resolve => req.on('end', resolve));
        const parsedBody = body ? JSON.parse(body) : {};
        const { id: deleteId } = parsedBody;

        if (!deleteId) {
          return res.status(400).json({ error: 'Thiếu id trong body' });
        }

        const [record] = await pool.query('SELECT image FROM outlines WHERE id = ?', [deleteId]);
        if (record[0]?.image) {
          const imagePath = path.join(process.cwd(), 'public', record[0].image);
          await fs.unlink(imagePath).catch(() => {});
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