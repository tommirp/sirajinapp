// /src/pages/WorkingPlans/AddActivityForm.jsx
import { useEffect, useState, Fragment } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select';
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
  const [alertMsg, setAlertMsg] = useState('')
  
  const [options, setOptions] = useState([])
  const [involvedUsers, setInvolvedUsers] = useState([])

  async function fetchFirst() {
    const userInfo = await getUserInfo()

    supabase
      .from('working_plans_employees')
      .select('*, user:registered_users(*)')
      .eq('working_plan_id', id)
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching employees:', error)
          return
        }

        const formattedOptions = data.filter(x => x.email !== userInfo.email).map(employee => ({
          value: employee.user.id,
          label: employee.user.full_name,
          item: employee.user
        }))

        setOptions(formattedOptions)
      })
  }

  useEffect(() => {
    if (id)
    {
      fetchFirst();
    }
  }, [id]);
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setAlertMsg('')

    // Validasi semua input
    if (!title || !startDate || !deadlineDate || !realizationTarget || !externalInfo || !kpiIndicator) {
      setAlertMsg('Please fill in all fields!')
      return
    }

    if (new Date(startDate) > new Date(deadlineDate)) {
      setAlertMsg('Start date cannot be later than deadline date!')
      return
    }

    if (involvedUsers.length === 0) {
      setAlertMsg('Please select at least one employee to involve in this working plan!')
      return
    }

    const user = await getUserInfo()
    
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
      working_plan_ref: id,
      created_by: user.email,
      created_at: new Date().toISOString(),
    })
    
    if (error) {
      setAlertMsg(error.message)
      return
    }
    
    // Upload gambar jika ada

    // Insert ke involved_users
    if (involvedUsers.length > 0) {
      const userInvolvement = involvedUsers.map(x => ({
        user_id: x.item.id,  // Ambil id dari item yang dipilih 
        working_plan_id: id,
        created_by: user.email,
        created_at: new Date().toISOString(),
      }));

      if (!involvedUsers.find(x => x.item.id === user.id)) {
        userInvolvement.push({
          user_id: user.id,  // Tambahkan user yang membuat rencana kerja
          working_plan_id: id,
          created_by: user.email,
          created_at: new Date().toISOString(),
        })
      }

      const { error: involvementError } = await supabase.from('working_plans_employees').insert(userInvolvement);
      if (involvementError) {
        setAlertMsg(involvementError.message);
        return;
      }
    }
  }

  const handleSelected = (selectedOptions) => {
    if (selectedOptions) {
      const exist = involvedUsers.some(user => user.item.id === selectedOptions.item.id);
      if (!exist) {
        const tempUserList = [...involvedUsers];
        tempUserList.push(selectedOptions);
        setInvolvedUsers(tempUserList);
      }
    }
  };

  return (
    <div className="row">
      <div className="col-lg-3 col-md-3 col-sm-12"></div>
      <div className="col-lg-6 col-md-6 col-sm-12">
        <div className='d-flex justify-content-center align-items-center mt-3'>
          <div className="card shadow" >
            <div className="card-body">
              <div className="max-w-lg mx-auto p-6">
                <div className="d-flex mb-4">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    style={{ width: '40px', height: '35px' }}
                    onClick={() => navigate(`/rencana-kerja/${id}`)}
                  >
                    <i className='bi bi-arrow-left'></i>
                  </button>
                  <h4 className="text-xl font-semibold" style={{ marginLeft: '20px' }}>Tambah Aktifitas Baru</h4>
                </div>
                {alertMsg && alertMsg.includes('created successfully') ? (
                  <Fragment>
                    {alertMsg && alertMsg !== '' && (
                      <div className="alert alert-success alert-dismissible fade show" role="alert">
                        {alertMsg}
                      </div>
                    )}
                  </Fragment>
                ) : (
                  <Fragment>
                    {alertMsg && alertMsg !== '' && (
                      <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {alertMsg}
                      </div>
                    )}
                  </Fragment>
                )}
                <form onSubmit={handleSubmit} className="row g-3">
                  <div className="col-lg-12 col-md-12 col-sm-12">
                    <label>Judul Aktifitas</label>
                    <input
                      type="text"
                      className="form-control"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="col-lg-4 col-md-4 col-sm-12">
                    <label>Tipe Aktifitas</label>
                    <input
                      type="text"
                      className="form-control"
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                    />
                  </div>
                  <div className="col-lg-4 col-md-4 col-sm-6">
                    <label>Tanggal Mulai</label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="col-lg-4 col-md-4 col-sm-6">
                    <label>Tanggal Selesai</label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="col-lg-4 col-md-4 col-sm-12">
                    <label>Nama Institusi</label>
                    <input
                      type="text"
                      className="form-control"
                      value={externalInstitution}
                      onChange={(e) => setExternalInstitution(e.target.value)}
                    />
                  </div>
                  <div className="col-lg-4 col-md-4 col-sm-12">
                    <label>Nama PIC Institusi</label>
                    <input
                      type="text"
                      className="form-control"
                      value={externalPerson}
                      onChange={(e) => setExternalPerson(e.target.value)}
                    />
                  </div>
                  <div className="col-lg-4 col-md-4 col-sm-12">
                    <label>No Hp PIC Institusi</label>
                    <input
                      type="text"
                      className="form-control"
                      value={externalPhone}
                      onChange={(e) => setExternalPhone(e.target.value)}
                    />
                  </div>
                  <div className="col-lg-12 col-md-12 col-sm-12">
                    <hr />
                    <label>Pilih staff yang terlibat dalam kegiatan (List dari staff yang ada di Rencana Kerja) :</label>
                    <div className="w-full">
                      <Select
                        onChange={handleSelected}
                        options={options}
                        placeholder="Search and select Employee..."
                        isClearable
                        isSearchable
                      />
                    </div>
                    {involvedUsers.length > 0 && (
                      <div className="mt-3">
                        <h6>Selected Employees:</h6>
                        <ul className="list-group">
                          {involvedUsers.map((user, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                              {index + 1}. {user.label} ({user.item.email})
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                style={{ float: 'right' }}
                                onClick={() => {
                                  const updatedUsers = involvedUsers.filter(x => x.item.id !== user.item.id);
                                  setInvolvedUsers(updatedUsers);
                                }}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <hr style={{ marginBottom: '0px' }} />
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-success" style={{ float: 'right' }}>Add New Activity</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-3 col-md-3 col-sm-12"></div>
    </div>
  )
}
