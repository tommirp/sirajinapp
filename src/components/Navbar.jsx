// src/components/Navbar.jsx
import React from 'react'
import { useEffect } from 'react'
import { Link, useNavigate  } from 'react-router-dom'
import { getUserInfo } from '../utils/auth'
import { supabase } from '../supabaseClient'

export default function Navbar() {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = React.useState({})

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error.message)
      return
    } else {
      console.log('User logged out successfully')
      // Optionally redirect or update UI here
      navigate('/login')
    }


  }

  useEffect(() => {
    const fetchDetail = async () => {  
      const userInfo = await getUserInfo()
      if (!userInfo) {
        console.error('User not found or not logged in')
        navigate('/login')
        return
      }

      setUserInfo(userInfo)
    }

    fetchDetail()
  }, [])

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <a className="navbar-brand" href="#">
        <img src="https://www.adaptivewfs.com/wp-content/uploads/2020/07/logo-placeholder-image.png" width="70" height="70" alt="logo" />
      </a>
     <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav me-auto">
          <li className="nav-item" style={{ padding: '0px 10px' }}>
            <Link className="nav-link" to="/">Dashboard</Link>
          </li>
          {(userInfo.role === 'karyawan' || userInfo.role === 'pimpinan_cabang') && (
            <li className="nav-item" style={{ padding: '0px 10px' }}>
              <Link className="nav-link" to="/rencana-kerja">Rencana Kerja</Link>
            </li>
          )}
          {userInfo.role === 'admin' && (
            <li className="nav-item" style={{ padding: '0px 10px' }}>
              <Link className="nav-link" to="/user-management">User Management</Link>
            </li>
          )}
        </ul>
        <span className="navbar-text" style={{ padding: '0px 20px 0px 10px' }}>
          Halo, {userInfo.username || userInfo.email} ({userInfo.role}),
          <button className="btn btn-outline-secondary btn-sm ms-2" onClick={() => signOut()}>Logout</button>
        </span>
      </div>
    </nav>
  )
}
