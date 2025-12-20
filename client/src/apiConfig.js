// Xác định môi trường đang chạy
const isProduction = import.meta.env.MODE === 'production';

// Đường dẫn Backend
// Production (Render): gọi API cùng domain
// Dev: gọi backend local hoặc từ .env
export const API_URL = isProduction
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');

// API Keys
export const WEATHER_KEY =
  import.meta.env.VITE_WEATHER_API_KEY ||
  '278b369b634e6ed7f3fbb56044eb0196';

export const AQI_KEY =
  import.meta.env.VITE_AQI_API_KEY ||
  'dd55bc5957b6d1acc6b9313ccd429835cdbf95f7';
