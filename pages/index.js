import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Chuyển hướng tự động
    router.push('/player');
  }, [router]);

  return (
    <div>
      <h1>Đang chuyển hướng đến trang người chơi...</h1>
    </div>
  );
}