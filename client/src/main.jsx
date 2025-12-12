import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  // Xóa <React.StrictMode> bao quanh
  <BrowserRouter>
    <App />
  </BrowserRouter>
  // Xóa </React.StrictMode>
)