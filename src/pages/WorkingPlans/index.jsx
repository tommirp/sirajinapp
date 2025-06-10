// /src/pages/WorkingPlans/index.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { getUserInfo, canModifyPlan } from '../../utils/auth'

export default function WorkingPlansPage() {
  const [plans, setPlans] = useState([])
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true)

      const {
        data,
        error
      } = await supabase
        .from('working_plans')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setPlans(data)

      setLoading(false)
    }

    fetchPlans()
  }, [])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Daftar Rencana Kerja</h3>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/rencana-kerja/tambah')}
        >
          + Tambah
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <table className="table table-hover">
            <thead>
              <tr>
                <th scope="col">Action</th>
                <th scope="col">Judul Rencana Kerja</th>
                <th scope="col">Tanggal Mulai</th>
                <th scope="col">Deadline</th>
                <th scope="col">Nama Instansi</th>
                <th scope="col">Realisasi Target</th>
                <th scope="col">Perstujuan</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan, index) => (
                <tr key={index}>
                  <th scope="row">
                    <button
                      className="btn btn-secondary"
                      onClick={() => navigate(`/rencana-kerja/${plan.id}`)}
                    >
                      Kegiatan
                    </button>
                    {canModifyPlan(plan) ? (
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate(`/rencana-kerja/${plan.id}`)}
                      >
                        Edit
                      </button>
                    ) : ""}
                    {canModifyPlan(plan) ? (
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate(`/rencana-kerja/${plan.id}`)}
                      >
                        Delete
                      </button>
                    ) : ""}
                  </th>
                  <td>{plan.title}</td>
                  <td>{plan.start_date}</td>
                  <td>{plan.deadline_date}</td>
                  <td>{plan.external_info}</td>
                  <td>{plan.realization_target}</td>
                  <td>{plan.approved_by ? `Telah Disetujui Oleh ${plan.approved_by}` : 'Belum Disetujui'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
