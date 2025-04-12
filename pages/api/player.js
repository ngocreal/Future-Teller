import pool from '../../lib/db';

export default async function handler(req, res) {
  try {
    const [times] = await pool.query('SELECT * FROM times');
    const [majors] = await pool.query('SELECT * FROM majors');
    const [technologies] = await pool.query('SELECT * FROM technologies');
    const [impacts] = await pool.query('SELECT * FROM impacts');
    const [outlines] = await pool.query('SELECT * FROM outlines ORDER BY id ASC');

    // Log dữ liệu để kiểm tra
    console.log('Times:', times);
    console.log('Majors:', majors);
    console.log('Technologies:', technologies);
    console.log('Impacts:', impacts);

    res.status(200).json({
      times,
      majors,
      technologies,
      impacts,
      outlines,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}