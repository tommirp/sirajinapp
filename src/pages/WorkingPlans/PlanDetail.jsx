// /src/pages/WorkingPlans/PlanDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { getUserInfo } from '../../utils/auth'

export default function PlanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [plan, setPlan] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [workingPlan, setWorkingPlan] = useState(null)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)

      const userInfo = getUserInfo()

      setUserRole(userInfo.role)

      // Ambil rencana kerja
      const { data: planData, error: planError } = await supabase
        .from('working_plans')
        .select('*')
        .eq('id', id)
        .single()

      // Ambil aktivitas terkait
      const { data: activityData, error: activityError } = await supabase
        .from('working_activities')
        .select('*')
        .eq('working_plan_ref', id)
        .order('start_date', { ascending: true })

      if (planError) console.error(planError)
      else setPlan(planData)

      if (activityError) console.error(activityError)
      else setActivities(activityData)

      setLoading(false)
    }

    fetchDetail()
  }, [id])

  const handleApprove = async () => {
    const user = await supabase.auth.getUser()
    const email = user.data?.user?.email

    const { error } = await supabase
      .from('working_plans')
      .update({ is_approved: 1, approved_by: email })
      .eq('id', id)

    if (error) {
      alert('Gagal menyetujui: ' + error.message)
    } else {
      alert('Berhasil disetujui.')
      setWorkingPlan({ ...workingPlan, is_approved: 1, approved_by: email })
    }
  }
  
  async function autoGenerateActivitiesByAI(planId) {
    if (!planId) return

    const confirmed = window.confirm(`Are you sure you want to delete this Plan : "${title}"?`)

    if (confirmed) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/generate-working-activities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-working-plan-id": String(planId),
            Authorization: `Bearer ${supabase.auth.getSession()?.access_token ?? ""}` // jika perlu akses login user
          },
          body: JSON.stringify({})
        }
      );

      if (!res.ok) alert("Failed to auto generate activities by AI!");
    }
  }

  return (
    <div className="container-fluid mt-3">
      {loading ? (
          <div className="d-flex justify-content-center mt-5 vh-100">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 style={{ marginLeft: '10px', marginTop: '5px' }}>Loading...</h4>
          </div>
      ) : (
        <div className="row">
          <div className="col-lg-3 col-md-3 col-sm-12">
            <div className="d-flex justify-between items-center mb-1">
              <button
                onClick={() => navigate('/rencana-kerja')}
                className="btn btn-sm btn-outline-secondary mb-4"  
              >
                <i className='bi bi-arrow-left'></i>
              </button>
              <h4 className="text-xl font-bold" style={{ marginLeft: '10px' }}>Detail Rencana Kerja</h4>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-11">
                    <h4 className="text-2xl font-semibold mb-2">{plan.title}</h4>
                  </div>
                  <div className="col-12">
                      {workingPlan?.is_approved === 1 ? (
                        <span className="text-green-600 font-semibold">✅ Telah Disetujui Oleh : {workingPlan.approved_by}</span>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-yellow-600 font-semibold">⏳ Belum Disetujui</span>
                          {userRole === 'pimpinan_cabang' && (
                            <button
                              onClick={handleApprove}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                            >
                              Setujui
                            </button>
                          )}
                        </div>
                      )}

                      <span style={{ display: 'block' }}>KPI: <b>{plan.kpi_indicator}</b></span>
                      <span style={{ display: 'block' }}>Mulai: <b>{plan.start_date}</b></span>
                      <span style={{ display: 'block' }}>Deadline: <b>{plan.deadline_date}</b></span>
                      <span style={{ display: 'block' }}>External Info : <b>{plan.external_info}</b></span>

                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold">Daftar Kegiatan</h3>
                        <button
                          onClick={() => navigate(`/rencana-kerja/${id}/tambah-activity`)}
                          className="bg-blue-600 text-white px-3 py-2 rounded"
                        >
                          + Tambah Activity
                        </button>
                      </div>

                      {activities.length === 0 ? (
                        <p className="text-sm text-gray-500">Belum ada kegiatan.</p>
                      ) : (
                        <ul className="space-y-4">
                          {activities.map((activity) => (
                            <li
                              key={activity.id}
                              className="border p-4 rounded shadow-sm hover:shadow"
                            >
                              <h4 className="font-medium">{activity.title}</h4>
                              <p className="text-sm text-gray-600">
                                {activity.start_date} → {activity.end_date}
                              </p>
                              <p className="text-sm">{activity.activity_type}</p>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={() =>
                                    navigate(`/rencana-kerja/${plan.id}/edit-activity/${activity.id}`)
                                  }
                                  className="text-sm text-blue-600"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm('Yakin ingin menghapus?')) {
                                      await supabase.from('working_activities').delete().eq('id', activity.id)
                                      setActivities((prev) => prev.filter((a) => a.id !== activity.id))
                                    }
                                  }}
                                  className="text-sm text-red-600"
                                >
                                  🗑️ Hapus
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-9 col-md-9 col-sm-12">
            <div className="d-flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold" style={{ marginLeft: '10px' }}>List Kegiatan</h4>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
