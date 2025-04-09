import pool from '../../../lib/db';
import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';

// Cấu hình multer để lưu file vào public/uploads/
const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
});

// Middleware để xử lý upload
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

// Chỉ tắt bodyParser cho các yêu cầu có upload file
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
        const [rows] = await pool.query('SELECT * FROM times');
        res.status(200).json(rows);
        break;

      case 'POST':
        // Xử lý upload file
        await runMiddleware(req, res, upload.single('image'));
        const { title } = req.body;

        // Kiểm tra title trùng
        const [existing] = await pool.query('SELECT * FROM times WHERE title = ?', [title]);
        if (existing.length > 0) {
          return res.status(400).json({ error: 'Tiêu đề đã tồn tại' });
        }

        // Lưu tên file ảnh vào database
        const image = req.file ? `/uploads/${req.file.filename}` : null;
        await pool.query('INSERT INTO times (title, image) VALUES (?, ?)', [title, image]);
        res.status(201).json({ message: 'Thêm thành công' });
        break;

      case 'PUT':
        // Xử lý upload file khi sửa
        await runMiddleware(req, res, upload.single('image'));
        const { id, title: updateTitle } = req.body;

        // Kiểm tra title trùng (trừ bản ghi hiện tại)
        const [existingUpdate] = await pool.query('SELECT * FROM times WHERE title = ? AND id != ?', [updateTitle, id]);
        if (existingUpdate.length > 0) {
          return res.status(400).json({ error: 'Tiêu đề đã tồn tại' });
        }

        // Nếu có file mới, xóa file cũ
        const [current] = await pool.query('SELECT image FROM times WHERE id = ?', [id]);
        if (req.file && current[0]?.image) {
          const oldImagePath = path.join(process.cwd(), 'public', current[0].image);
          await fs.unlink(oldImagePath).catch(() => {});
        }

        const updateImage = req.file ? `/uploads/${req.file.filename}` : current[0]?.image;
        await pool.query('UPDATE times SET title = ?, image = ? WHERE id = ?', [updateTitle, updateImage, id]);
        res.status(200).json({ message: 'Sửa thành công' });
        break;

      case 'DELETE':
        // Parse body thủ công vì bodyParser bị tắt
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

        // Xóa file ảnh liên quan
        const [record] = await pool.query('SELECT image FROM times WHERE id = ?', [deleteId]);
        if (record[0]?.image) {
          const imagePath = path.join(process.cwd(), 'public', record[0].image);
          await fs.unlink(imagePath).catch(() => {});
        }
        await pool.query('DELETE FROM times WHERE id = ?', [deleteId]);
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