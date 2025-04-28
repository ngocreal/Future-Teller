import pool from '../../lib/db';

export default async function handler(req, res) {
  try {
    // Sử dụng destructuring để lấy rows
    const { rows: times } = await pool.query('SELECT * FROM times');
    const { rows: majors } = await pool.query('SELECT * FROM majors');
    const { rows: technologies } = await pool.query('SELECT * FROM technologies');
    const { rows: impacts } = await pool.query('SELECT * FROM impacts');
    const { rows: outlines } = await pool.query('SELECT * FROM outlines ORDER BY id ASC');

    console.log('Times:', times);
    console.log('Majors:', majors);
    console.log('Technologies:', technologies);
    console.log('Impacts:', impacts);

    // Trả kq dạng JSON
    res.status(200).json({ times, majors, technologies, impacts, outlines });
  } catch (error) {
    // Xử lý lỗi và trả về thông báo
    res.status(500).json({ error: error.message });
  }
}
