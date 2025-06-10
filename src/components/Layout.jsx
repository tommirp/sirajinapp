// src/components/Layout.jsx
import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <div className="w-100">
      <div className="container-fluid">
        <Navbar />
        <main>
          <Outlet />
        </main>
        
        <footer className="footer">
          <p className="text-muted p-3 text-center">© Copyright <a href="https://kibaraya.com">PT Kibaraya Cipta Inovasi</a> {new Date().getFullYear()}. All Right Reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;