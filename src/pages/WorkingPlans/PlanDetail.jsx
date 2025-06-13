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


  if (loading) {
    return (
      <div className="d-flex justify-content-center  mt-5 vh-100">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 style={{ marginLeft: '10px', marginTop: '5px' }}>Loading...</h4>
      </div>
    )
  }
  if (!plan) return <div className="p-6">Rencana kerja tidak ditemukan</div>

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/rencana-kerja')}
        className="text-sm text-blue-600 mb-4"
      >
        ← Kembali
      </button>

      <h2 className="text-2xl font-semibold mb-2">{plan.title}</h2>
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

      <p className="text-sm text-gray-500 mb-2">KPI: {plan.kpi_indicator}</p>
      <p className="mb-4">
        Mulai: {plan.start_date} | Deadline: {plan.deadline_date}
      </p>
      <p className="mb-6">{plan.external_info}</p>

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
  )
}
