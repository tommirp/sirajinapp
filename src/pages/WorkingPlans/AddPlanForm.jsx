// /src/pages/WorkingPlans/AddPlanForm.jsx
import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AddPlanForm() {
  const [title, setTitle] = useState('')
  const [kpiIndicator, setKpiIndicator] = useState('')
  const [startDate, setStartDate] = useState('')
  const [deadlineDate, setDeadlineDate] = useState('')
  const [realizationTarget, setRealizationTarget] = useState('')
  const [externalInfo, setExternalInfo] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    // Ambil email user dari supabase auth session
    const user = supabase.auth.getUser()
    const email = (await user).data.user.email

    if (!title || !startDate || !deadlineDate) {
      setErrorMsg('Title, Start Date, dan Deadline harus diisi')
      return
    }

    // Insert ke supabase
    const { data, error } = await supabase.from('working_plans').insert({
      title,
      kpi_indicator: kpiIndicator,
      start_date: startDate,
      deadline_date: deadlineDate,
      realization_target: realizationTarget ? parseInt(realizationTarget) : null,
      external_info: externalInfo,
      created_by: email,
      is_approved: 0,
    })

    if (error) setErrorMsg(error.message)
    else navigate('/rencana-kerja')
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h3 className="text-xl font-semibold mb-4">Tambah Rencana Kerja Baru</h3>
      {errorMsg && <p className="text-red-600 mb-2">{errorMsg}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Judul</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">KPI Indicator</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={kpiIndicator}
            onChange={(e) => setKpiIndicator(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Tanggal Mulai</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Tanggal Deadline</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Target Realisasi</label>
          <input
            type="number"
            className="w-full border px-3 py-2 rounded"
            value={realizationTarget}
            onChange={(e) => setRealizationTarget(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Informasi Eksternal</label>
          <textarea
            className="w-full border px-3 py-2 rounded"
            value={externalInfo}
            onChange={(e) => setExternalInfo(e.target.value)}
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Simpan
        </button>
      </form>
    </div>
  )
}
