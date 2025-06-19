// src/components/Layout.jsx
import React, { useEffect } from 'react'
import Navbar from './Navbar'
import { initLocalData } from '../utils/auth';
import { Outlet } from 'react-router-dom'

const Layout = () => {
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    initLocalData();
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  }, []);

  return (
    <div className="w-100">
      <div className="container-fluid">
          <div style={{ display: isLoading ? 'block' : 'none' }}>
            <div className="d-flex justify-content-center align-items-center vh-100">
              <div className="spinner-border text-secondary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h4 style={{ marginLeft: '10px', marginTop: '5px' }}>Loading...</h4>
            </div>
          </div>
          <div style={{ display: isLoading ? 'none' : 'block' }}>
            <Navbar />
            <main style={{ marginTop: '100px', marginBottom: '100px' }}>
              <Outlet />
            </main>
            <footer className="footer">
              <p className="text-muted p-3 text-center">© Copyright <a href="https://kibaraya.com">PT Kibaraya Cipta Inovasi</a> {new Date().getFullYear()}. All Right Reserved</p>
            </footer>
          </div>
      </div>
    </div>
  );
};

export default Layout;