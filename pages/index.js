import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Chuyển hướng tự động đến /admin
    router.push('/admin');
  }, [router]);

  return (
    <div>
      <h1>Đang chuyển hướng đến trang Admin...</h1>
    </div>
  );
}