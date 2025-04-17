import { useState } from 'react';
import { useRouter } from 'next/router';
import { FaGraduationCap, FaUserAlt, FaLock, FaSignInAlt, FaUserCircle } from 'react-icons/fa';
import styles from '../styles/Login.module.css';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      // lưu user nếu cần hiển thị sau này
      localStorage.setItem('user', username);
      router.push('/admin');
    } else {
      setError(data.message);
    }
  };

  const handleGuest = () => {
    router.push('/player');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <FaGraduationCap className={styles.icon} />
        <h1 className={styles.title}>Vai trò Admin</h1>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <FaUserAlt className={styles.inputIcon} />
            <input
              className={styles.input}
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <FaLock className={styles.inputIcon} />
            <input
              className={styles.input}
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.btnPrimary}>
            <FaSignInAlt /> Đăng nhập
          </button>
        </form>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}
