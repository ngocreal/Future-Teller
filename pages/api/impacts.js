import pool from '../../lib/db';
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

const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET': {
        const result = await pool.query('SELECT * FROM impacts;');
        return res.status(200).json(result.rows);
      }

      case 'POST': {
        await runMiddleware(req, res, upload.single('image'));
        const { title } = req.body;
        if (!title) return res.status(400).json({ error: 'Thiếu title' });

        const exists = await pool.query(
          'SELECT id FROM impacts WHERE title = $1',
          [title]
        );
        if (exists.rows.length > 0) {
          return res.status(400).json({ error: 'Tiêu đề đã tồn tại' });
        }

        const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
        await pool.query(
          'INSERT INTO impacts (title, image) VALUES ($1, $2)',
          [title, imagePath]
        );
        return res.status(201).json({ message: 'Thêm thành công' });
      }

      case 'PUT': {
        await runMiddleware(req, res, upload.single('image'));
        const { id, title: newTitle } = req.body;
        if (!id || !newTitle) {
          return res.status(400).json({ error: 'Thiếu id hoặc title' });
        }

        const dup = await pool.query(
          'SELECT id FROM impacts WHERE title = $1 AND id != $2',
          [newTitle, id]
        );
        if (dup.rows.length > 0) {
          return res.status(400).json({ error: 'Tiêu đề đã tồn tại' });
        }

        // Fetch current image to delete if replaced
        const curr = await pool.query(
          'SELECT image FROM impacts WHERE id = $1',
          [id]
        );
        const currentImage = curr.rows[0]?.image;
        if (req.file && currentImage) {
          await fs.unlink(path.join(process.cwd(), 'public', currentImage)).catch(() => {});
        }

        const updatedImage = req.file ? `/uploads/${req.file.filename}` : currentImage;
        await pool.query(
          'UPDATE impacts SET title = $1, image = $2 WHERE id = $3',
          [newTitle, updatedImage, id]
        );
        return res.status(200).json({ message: 'Sửa thành công' });
      }

      case 'DELETE': {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        await new Promise(r => req.on('end', r));
        const { id: deleteId } = body ? JSON.parse(body) : {};
        if (!deleteId) {
          return res.status(400).json({ error: 'Thiếu id trong body' });
        }

        const rec = await pool.query(
          'SELECT image FROM impacts WHERE id = $1',
          [deleteId]
        );
        const img = rec.rows[0]?.image;
        if (img) await fs.unlink(path.join(process.cwd(), 'public', img)).catch(() => {});

        await pool.query('DELETE FROM impacts WHERE id = $1', [deleteId]);
        return res.status(200).json({ message: 'Xóa thành công' });
      }

      default:
        res.setHeader('Allow', ['GET','POST','PUT','DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Impacts API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
