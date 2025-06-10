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
        <footer>My App Footer</footer>
      </div>
    </div>
  );
};

export default Layout;