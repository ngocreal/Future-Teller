import styles from '../styles/Admin.module.css';

const AdminTable = ({ data, table, onEdit, onDelete }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>Không có dữ liệu để hiển thị.</p>;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>STT</th>
          {table === 'times' || table === 'majors' || table === 'technologies' || table === 'impacts' || table === 'outlines' ? (
            <>
              {table === 'outlines' && (
                <>
                  <th>Bước</th>
                  <th>Thời gian</th>
                  <th>Nội dung</th>
                  <th>Gợi ý</th>
                  <th>Emoji</th>
                </>
              )}
              <th>{table === 'times' ? 'Thời điểm' : table === 'majors' ? 'Ngành' : table === 'technologies' ? 'Công nghệ' : table === 'impacts' ? 'Tác động' : 'Gợi ý'}</th>
              <th>Ảnh</th>
            </>
          ) : null}
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={item.id}>
            <td>{index + 1}</td>
            {table === 'times' || table === 'majors' || table === 'technologies' || table === 'impacts' || table === 'outlines' ? (
              <>
                {table === 'outlines' && (
                  <>
                    <td>{item.step}</td>
                    <td>{item.time}</td>
                    <td>{item.content}</td>
                    <td>{item.suggest}</td>
                    <td>{item.emoji || '-'}</td>
                  </>
                )}
                <td>{item.title}</td>
                <td>
                  {item.image ? (
                    <img src={item.image} alt={item.title} style={{ width: '100px', height: '100px' }} />
                  ) : (
                    'Không có ảnh'
                  )}
                </td>
              </>
            ) : null}
            <td>
              <button className={styles.editButton} onClick={() => onEdit(item)}>Sửa</button>
              <button className={styles.deleteButton} onClick={() => onDelete(item.id)}>Xóa</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminTable;