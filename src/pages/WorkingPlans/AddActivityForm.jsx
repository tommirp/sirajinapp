// /src/pages/WorkingPlans/AddActivityForm.jsx
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

export default function AddActivityForm() {
  const { id } = useParams() // working_plan_ref
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [activityType, setActivityType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [externalInstitution, setExternalInstitution] = useState('')
  const [externalPerson, setExternalPerson] = useState('')
  const [externalPhone, setExternalPhone] = useState('')
  const [activityResult, setActivityResult] = useState('')
  const [nextMoveRemarks, setNextMoveRemarks] = useState('')
  const [activityPicture, setActivityPicture] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!title || !startDate || !endDate) {
        setErrorMsg('Judul, tanggal mulai, dan tanggal selesai wajib diisi.')
        return
    }

    if (new Date(startDate) > new Date(endDate)) {
        setErrorMsg('Tanggal mulai tidak boleh lebih besar dari tanggal selesai.')
        return
    }

    const user = await supabase.auth.getUser()
    const email = user.data?.user?.email
    const employee = user.data?.user?.id

    // Upload gambar jika ada
    let pictureUrl = null
    if (activityPicture) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('activity-pictures')
        .upload(`activity-${Date.now()}-${activityPicture.name}`, activityPicture)

      if (uploadError) {
        setErrorMsg('Upload gambar gagal.')
        return
      }

      const { data: publicUrl } = supabase.storage
        .from('activity-pictures')
        .getPublicUrl(uploadData.path)

      pictureUrl = publicUrl.publicUrl
    }

    const { error } = await supabase.from('working_activities').insert({
      title,
      activity_type: activityType,
      start_date: startDate,
      end_date: endDate,
      external_institution: externalInstitution,
      external_person: externalPerson,
      external_phone: externalPhone,
      activity_result: activityResult,
      next_move_remarks: nextMoveRemarks,
      activity_picture: pictureUrl,
      working_plan_ref: id,
      created_by: email,
      employee: employee,
    })

    if (error) setErrorMsg(error.message)
    else navigate(`/rencana-kerja/${id}`)
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h3 className="text-xl font-semibold mb-4">Tambah Kegiatan</h3>
      {errorMsg && <p className="text-red-600 mb-2">{errorMsg}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Judul Kegiatan"
          className="w-full border px-3 py-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Tipe Kegiatan"
          className="w-full border px-3 py-2 rounded"
          value={activityType}
          onChange={(e) => setActivityType(e.target.value)}
        />
        <div className="flex gap-2">
          <input
            type="datetime-local"
            className="w-full border px-3 py-2 rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="datetime-local"
            className="w-full border px-3 py-2 rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <input
          type="text"
          placeholder="Institusi Eksternal"
          className="w-full border px-3 py-2 rounded"
          value={externalInstitution}
          onChange={(e) => setExternalInstitution(e.target.value)}
        />
        <input
          type="text"
          placeholder="Kontak Person"
          className="w-full border px-3 py-2 rounded"
          value={externalPerson}
          onChange={(e) => setExternalPerson(e.target.value)}
        />
        <input
          type="text"
          placeholder="No Telepon"
          className="w-full border px-3 py-2 rounded"
          value={externalPhone}
          onChange={(e) => setExternalPhone(e.target.value)}
        />
        <textarea
          placeholder="Hasil Kegiatan"
          className="w-full border px-3 py-2 rounded"
          value={activityResult}
          onChange={(e) => setActivityResult(e.target.value)}
        />
        <textarea
          placeholder="Catatan Tindak Lanjut"
          className="w-full border px-3 py-2 rounded"
          value={nextMoveRemarks}
          onChange={(e) => setNextMoveRemarks(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setActivityPicture(e.target.files[0])}
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Simpan Kegiatan
        </button>
      </form>
    </div>
  )
}
