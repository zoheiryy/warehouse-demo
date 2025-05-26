import { useState } from 'react';
import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';

const HomePage = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="hero-section">
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>مرحباً بكم </h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          عدد النقرات: {count}
        </button>
        <p>
          نظام إدارة المخازن - المرحلة الأولى: عمليات الإرسال والاستقبال
        </p>
      </div>
      <p className="read-the-docs">
        استخدم الشريط الجانبي للتنقل بين أقسام النظام
      </p>
    </div>
  );
};

export default HomePage; 