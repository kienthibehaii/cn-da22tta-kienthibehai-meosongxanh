// Nếu đang dev (localhost) thì dùng localhost:5000
// Nếu đã deploy (production) thì dùng chính domain hiện tại (để trống)
const isDev = import.meta.env.MODE === 'development';

export const API_URL = isDev ? 'http://localhost:5000/api' : '/api';