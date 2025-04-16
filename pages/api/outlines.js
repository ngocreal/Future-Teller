import pool from '../../lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { method } = req;

  // Hàm kiểm tra emoji sang Unicode
  const normalizeEmoji = (emoji) => {
    if (!emoji) return '😊'; // Giá trị mặc định
    try {
      return String.fromCodePoint(...[...emoji].map(c => c.codePointAt(0)));
    } catch (e) {
      return '😊'; // Trả emoji mặc định nếu lỗi
    }
  };

  try {
    switch (method) {
      case 'GET':
        const [rows] = await pool.query('SELECT * FROM outlines');
        res.status(200).json(rows);
        break;

      case 'POST':
        let bodyPost = '';
        req.on('data', chunk => {
          bodyPost += chunk.toString();
        });
        await new Promise(resolve => req.on('end', resolve));

        const formDataPost = {};
        const boundaryPost = req.headers['content-type'].split('boundary=')[1];
        const partsPost = bodyPost.split(`--${boundaryPost}`);

        for (const part of partsPost) {
          if (part.includes('Content-Disposition')) {
            const nameMatch = part.match(/name="([^"]+)"/);
            if (nameMatch) {
              const name = nameMatch[1];
              const valueMatch = part.split('\r\n\r\n')[1];
              if (valueMatch) {
                const value = valueMatch.split('\r\n')[0];
                formDataPost[name] = value;
              }
            }
          }
        }

        const postTitle = formDataPost.title;
        if (!postTitle) {
          return res.status(400).json({ error: 'Tiêu đề là bắt buộc' });
        }

        const [existing] = await pool.query('SELECT * FROM outlines WHERE title = ?', [postTitle]);
        if (existing.length > 0) {
          return res.status(400).json({ error: 'Tiêu đề đã tồn tại' });
        }

        const postEmoji = normalizeEmoji(formDataPost.emoji);
        await pool.query(
          'INSERT INTO outlines (step, title, time, content, suggest, emoji) VALUES (?, ?, ?, ?, ?, ?)',
          [
            formDataPost.step || '',
            postTitle,
            formDataPost.time || '',
            formDataPost.content || '',
            formDataPost.suggest || '',
            postEmoji
          ]
        );
        res.status(201).json({ message: 'Thêm thành công' });
        break;

      case 'PUT':
        let bodyPut = '';
        req.on('data', chunk => {
          bodyPut += chunk.toString();
        });
        await new Promise(resolve => req.on('end', resolve));

        const formDataPut = {};
        const boundaryPut = req.headers['content-type'].split('boundary=')[1];
        const partsPut = bodyPut.split(`--${boundaryPut}`);

        for (const part of partsPut) {
          if (part.includes('Content-Disposition')) {
            const nameMatch = part.match(/name="([^"]+)"/);
            if (nameMatch) {
              const name = nameMatch[1];
              const valueMatch = part.split('\r\n\r\n')[1];
              if (valueMatch) {
                const value = valueMatch.split('\r\n')[0];
                formDataPut[name] = value;
              }
            }
          }
        }

        const updateId = formDataPut.id;
        const updateTitle = formDataPut.title;

        if (!updateId) {
          return res.status(400).json({ error: 'Thiếu id trong body' });
        }
        if (!updateTitle) {
          return res.status(400).json({ error: 'Tiêu đề là bắt buộc' });
        }

        const [existingUpdate] = await pool.query('SELECT * FROM outlines WHERE title = ? AND id != ?', [updateTitle, updateId]);
        if (existingUpdate.length > 0) {
          return res.status(400).json({ error: 'Tiêu đề đã tồn tại' });
        }

        const updateEmoji = normalizeEmoji(formDataPut.emoji);
        await pool.query(
          'UPDATE outlines SET step = ?, title = ?, time = ?, content = ?, suggest = ?, emoji = ? WHERE id = ?',
          [
            formDataPut.step || '',
            updateTitle,
            formDataPut.time || '',
            formDataPut.content || '',
            formDataPut.suggest || '',
            updateEmoji,
            updateId
          ]
        );
        res.status(200).json({ message: 'Sửa thành công' });
        break;

      case 'DELETE':
        let bodyDelete = '';
        req.on('data', chunk => {
          bodyDelete += chunk.toString();
        });
        await new Promise(resolve => req.on('end', resolve));
        const parsedBody = bodyDelete ? JSON.parse(bodyDelete) : {};
        const deleteId = parsedBody.id;

        if (!deleteId) {
          return res.status(400).json({ error: 'Thiếu id trong body' });
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