// src/components/Navbar.jsx
import React from 'react'
import { useEffect } from 'react'
import { Link, useNavigate  } from 'react-router-dom'
import Swal from 'sweetalert2'
import { getUserInfo } from '../utils/auth'
import { supabase } from '../supabaseClient'
import Logo from '../assets/sirajin.png';

export default function Navbar() {
  const navigate = useNavigate()
  const [userData, setUserData] = React.useState({})

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error logging out:', error.message)
      return
    } else {
      console.log('User logged out successfully')
      // Optionally redirect or update UI here
      localStorage.removeItem('userSession');
      localStorage.removeItem('usersList');
      navigate('/login')
    }
  }

  function printRole(role) {
    return role.replace('_', ' ').toUpperCase();
  }

  async function showUserDetail() {
    const userInfo = await getUserInfo()
    if (userInfo) {
      
      Swal.fire({
        title: 'User Information',
        html: `You Are Logged In as :<br><b>${userInfo.username}<br>(${userInfo.email})</b>.<br><br>Your Role :<br><b>${userInfo.role_detail.role_name}</b><br><br>Your Branch :<br><b>${userInfo.branch}</b>`,
        confirmButtonText: 'OK',
        showCancelButton: false,
      })
    } else {
      
      Swal.fire({
        icon: 'error',
        title: 'User Information',
        text: `User Information not found!`,
        confirmButtonText: 'OK',
        showCancelButton: false,
      })
    }
  }

  useEffect(() => {
    const fetchDetail = async () => {  
      setTimeout(async () => {
        const userInfo = await getUserInfo()
        setUserData(userInfo)
      }, 1000)
    }
    
    fetchDetail()
  }, [])

  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top bg-light">
      <a className="navbar-brand" href="#">
        <img src={Logo} height={40} alt="logo" style={{ marginLeft: '20px' }} />
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
          <li className="nav-item" style={{ padding: '0px 10px' }}>
            <Link className="nav-link" to="/rencana-kerja">Rencana Kerja</Link>
          </li>
        </ul>
        <span className="navbar-text" style={{ padding: '0px 20px 0px 10px' }}>
          <div className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
            <div className="btn-group mr-2" role="group" aria-label="First group">
              <button type="button" className="btn btn-outline-secondary" onClick={showUserDetail}>{userData.username || userData.email}</button>
              <button type="button" className="btn btn-danger" onClick={signOut}><i className='bi bi-box-arrow-right'></i> Sign Out</button>
            </div>
          </div>
        </span>
      </div>
    </nav>
  )
}
