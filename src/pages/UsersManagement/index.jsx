// /src/pages/WorkingPlans/index.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { getUserInfo } from '../../utils/auth'

export default function UsersManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true)

      const userInfo = await getUserInfo()
      if (!userInfo) {
        console.error('User not found or not logged in')
        navigate('/login')
        return
      }

      if (userInfo.role !== 'admin') {
        console.error('Unauthorized access')
        navigate('/')
        return
      }

      const usr = await supabase
        .from('auth.users').select('*')
        
    console.log(usr)

    //   else setUsers(data)

      setLoading(false)
    }

    fetchPlans()
  }, [])

  return (
     <div className="p-4 max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-4">Users Management</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <table className="table table-hover">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{user.user_metadata.full_name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
