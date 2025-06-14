import React, { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [planCount, setPlanCount] = useState(0)
  const [activityCount, setActivityCount] = useState(0)
  const [recentPlans, setRecentPlans] = useState([])
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true)

      // hitung total rencana kerja
      const { count: countPlans, error: errPlanCount } = await supabase
        .from('working_plans')
        .select('id', { count: 'exact', head: true })

      if (errPlanCount) {
        console.error('Error count plans:', errPlanCount)
      } else {
        setPlanCount(countPlans)
      }

      // hitung total aktivitas
      const { count: countActivities, error: errActivityCount } = await supabase
        .from('working_activities')
        .select('id', { count: 'exact', head: true })

      if (errActivityCount) {
        console.error('Error count activities:', errActivityCount)
      } else {
        setActivityCount(countActivities)
      }

      // ambil 5 rencana kerja terbaru
      const { data: plansData, error: errPlans } = await supabase
        .from('working_plans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (errPlans) {
        console.error('Error fetching plans:', errPlans)
      } else {
        setRecentPlans(plansData)
      }

      // ambil 5 aktivitas terbaru
      const { data: activitiesData, error: errActivities } = await supabase
        .from('working_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (errActivities) {
        console.error('Error fetching activities:', errActivities)
      } else {
        setRecentActivities(activitiesData)
      }

      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5 vh-100">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4 style={{ marginLeft: '10px', marginTop: '5px' }}>Loading...</h4>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-4">Dashboard</h3>
      <div className="row mb-3">
        <div className="col-2">
          <label>Data Period/Year</label>
          <select className='form-control'>
            <option value="2024">2024</option>
            <option value="2025" selected>2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
        <div className="col-2">
          <label>Region</label>
          <select className='form-control'>
            <option value="Riau" selected>Riau</option>
          </select>
        </div>
        <div className="col-2">
          <label>Branch</label>
          <select className='form-control'>
            <option value="Dumai" selected>Dumai</option>
          </select>
        </div>
        <div className="col-2">
          <label>Sub Branch</label>
          <select className='form-control'>
            <option value="KCP Dumai Kota" selected>KCP Dumai Kota</option>
          </select>
        </div>
      </div>
      <hr />
      <div className="row">
        <div className="col-2">
          <div className="rounded shadow text-center" style={{ padding: '15px 2px 4px 2px' }}>
            <h5 className="text-lg font-semibold" style={{ fontSize: '13px' }}>TOTAL RENCANA KERJA</h5>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>
        <div className="col-2">
          <div className="rounded shadow text-center" style={{ padding: '15px 2px 4px 2px' }}>
            <h5 className="text-sm font-semibold" style={{ fontSize: '13px' }}>TOTAL KEGIATAN</h5>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>
        <div className="col-2">
          <div className="rounded shadow text-center" style={{ padding: '15px 2px 4px 2px' }}>
            <h5 className="text-sm font-semibold" style={{ fontSize: '13px' }}>% REALISASI</h5>
            <p className="text-3xl font-bold">0%</p>
          </div>
        </div>
        <div className="col-2">
          <div className="rounded shadow text-center" style={{ padding: '15px 2px 4px 2px' }}>
            <h5 className="text-sm font-semibold" style={{ fontSize: '13px' }}>RK TAHUN LALU VS KINI</h5>
            <p className="text-3xl font-bold">^0%</p>
          </div>
        </div>
        <div className="col-2">
          <div className="rounded shadow text-center" style={{ padding: '15px 2px 4px 2px' }}>
            <h5 className="text-sm font-semibold" style={{ fontSize: '13px' }}>KARYAWAN TERLIBAT</h5>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>
        <div className="col-2">
          <div className="rounded shadow text-center" style={{ padding: '15px 2px 4px 2px' }}>
            <h5 className="text-sm font-semibold" style={{ fontSize: '13px' }}>KARYAWAN TIDAK TERLIBAT</h5>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-2">
          <div className="rounded shadow text-center" style={{ padding: '15px 2px 4px 2px' }}>
            <h5 className="text-sm font-semibold" style={{ fontSize: '13px' }}>TOTAL RK SELESAI</h5>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>
        <div className="col-2">
          <div className="rounded shadow text-center" style={{ padding: '15px 2px 4px 2px' }}>
            <h5 className="text-sm font-semibold" style={{ fontSize: '13px' }}>TOTAL RK BELUM DISETUJUI</h5>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>
        <div className="col-2">
          <div className="rounded shadow text-center" style={{ padding: '15px 2px 4px 2px' }}>
            <h5 className="text-sm font-semibold" style={{ fontSize: '13px' }}>TOTAL TARGET REALISASI</h5>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>
        <div className="col-2">
          <div className="rounded shadow text-center" style={{ padding: '15px 2px 4px 2px' }}>
            <h5 className="text-sm font-semibold" style={{ fontSize: '13px' }}>TOTAL HASIL REALISASI</h5>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>
        <div className="col-2">
          <div className="rounded shadow text-center" style={{ padding: '15px 2px 4px 2px' }}>
            <h5 className="text-sm font-semibold" style={{ fontSize: '13px' }}>TOTAL CAPAI TARGET</h5>
            <p className="text-3xl font-bold">0%</p>
          </div>
        </div>
        <div className="col-2">
          <div className="rounded shadow text-center" style={{ padding: '15px 2px 4px 2px' }}>
            <h5 className="text-sm font-semibold" style={{ fontSize: '13px' }}>TOTAL TIDAK CAPAI TARGET</h5>
            <p className="text-3xl font-bold">0%</p>
          </div>
        </div>
      </div>
{/* 
      <section className="mb-8 mt-5">
        <h3 className="text-xl font-semibold mb-2">Rencana Kerja Terbaru</h3>
        <ul className="list-disc list-inside">
          {recentPlans.map(plan => (
            <li key={plan.id}>
              <strong>{plan.title || 'No Title'}</strong> — Mulai: {new Date(plan.start_date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-2 mt-5">Aktivitas Terbaru</h3>
        <ul className="list-disc list-inside">
          {recentActivities.map(activity => (
            <li key={activity.id}>
              <strong>{activity.title || 'No Title'}</strong> — Tipe: {activity.activity_type || '-'} — {new Date(activity.start_date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </section> */}
    </div>
  )
}
