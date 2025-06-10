// /src/pages/WorkingPlans/EditActivityForm.jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

export default function EditActivityForm() {
  const { id, activityId } = useParams()
  const navigate = useNavigate()
  const [activity, setActivity] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const fetchActivity = async () => {
      const { data, error } = await supabase
        .from('working_activities')
        .select('*')
        .eq('id', activityId)
        .single()

      if (error) setErrorMsg('Gagal mengambil data activity.')
      else setActivity(data)
    }

    fetchActivity()
  }, [activityId])

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!activity.title || !activity.start_date || !activity.end_date) {
      setErrorMsg('Judul dan tanggal wajib diisi.')
      return
    }

    if (new Date(activity.start_date) > new Date(activity.end_date)) {
      setErrorMsg('Tanggal mulai harus < tanggal selesai.')
      return
    }

    const { error } = await supabase
      .from('working_activities')
      .update(activity)
      .eq('id', activityId)

    if (error) setErrorMsg(error.message)
    else navigate(`/rencana-kerja/${id}`)
  }

  const handleChange = (field, value) => {
    setActivity({ ...activity, [field]: value })
  }

  if (!activity) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h3 className="text-xl font-semibold mb-4">Edit Kegiatan</h3>
      {errorMsg && <p className="text-red-600">{errorMsg}</p>}
      <form onSubmit={handleUpdate} className="space-y-4">
        <input
          type="text"
          value={activity.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="datetime-local"
          value={activity.start_date?.slice(0, 16)}
          onChange={(e) => handleChange('start_date', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="datetime-local"
          value={activity.end_date?.slice(0, 16)}
          onChange={(e) => handleChange('end_date', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          value={activity.activity_result}
          onChange={(e) => handleChange('activity_result', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  )
}
