// /src/pages/WorkingPlans/AddPlanForm.jsx
import { useEffect, useState, Fragment } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { getUserInfo } from '../../utils/auth'
import Select from 'react-select';

export default function AddPlanForm() {
  const [title, setTitle] = useState('')
  const [kpiIndicator, setKpiIndicator] = useState('')
  const [startDate, setStartDate] = useState('')
  const [deadlineDate, setDeadlineDate] = useState('')
  const [realizationTarget, setRealizationTarget] = useState('')
  const [externalInfo, setExternalInfo] = useState('')
  const [alertMsg, setAlertMsg] = useState('')
  
  const [options, setOptions] = useState([]);
  const [involvedUsers, setInvolvedUsers] = useState([]);
  const [searchText, setSearchText] = useState('');

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAlertMsg('')

    // Ambil email user dari supabase auth session
    const user = await getUserInfo()

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

    // Insert ke supabase
    const { data, error } = await supabase.from('working_plans').insert({
      title,
      kpi_indicator: kpiIndicator,
      start_date: startDate,
      deadline_date: deadlineDate,
      realization_target: realizationTarget ? parseInt(realizationTarget) : null,
      external_info: externalInfo,
      created_by: user.email,
      is_approved: 0,
    }).select('id').single();

    if (error) {
      setAlertMsg(error.message)
      return
    }

    const planId = data?.id;

    // Insert ke involved_users
    if (involvedUsers.length > 0) {
      const userInvolvement = involvedUsers.map(x => ({
        user_id: x.item.id,  // Ambil id dari item yang dipilih 
        working_plan_id: planId,
        created_by: user.email,
        created_at: new Date().toISOString(),
      }));

      const { error: involvementError } = await supabase.from('working_plans_employees').insert(userInvolvement);
      if (involvementError) {
        setAlertMsg(involvementError.message);
        return;
      }
    }

    // Reset form fields
    setTitle('')
    setKpiIndicator('')
    setStartDate('')
    setDeadlineDate('')
    setRealizationTarget('')
    setExternalInfo('')
    setInvolvedUsers([])
    setSearchText('')

    // Show success message
    setAlertMsg('Working plan created successfully!')
  }

  useEffect(() => {    
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('registered_users')
        .select('*');

      if (error) {
        console.error(error);
        return [];
      }

      const items = data.map((item) => ({
        value: item.id,
        label: item.full_name,
        item,
      }));

      setOptions(items);
      return;
    };

    fetchUsers();
  }, []);

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
    <div className='d-flex justify-content-center align-items-center mt-3'>
      <div className="card shadow"  style={{ width: '50%' }}>
        <div className="card-body">
          <div className="max-w-lg mx-auto p-6">
            <div className="d-flex mb-4">
              <button
                className="btn btn-sm btn-outline-secondary"
                style={{ width: '40px', height: '35px' }}
                onClick={() => navigate('/rencana-kerja')}
              >
                <i className='bi bi-arrow-left'></i>
              </button>
              <h3 className="text-xl font-semibold" style={{ marginLeft: '20px' }}>Tambah Rencana Kerja Baru</h3>
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
              <div className="col-8">
                <label>Judul</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="col-4">
                <label>KPI Indicator</label>
                <input
                  type="text"
                  className="form-control"
                  value={kpiIndicator}
                  onChange={(e) => setKpiIndicator(e.target.value)}
                />
              </div>
              <div className="col-4">
                <label>Tanggal Mulai</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="col-4">
                <label>Tanggal Deadline</label>
                <input
                  type="date"
                  className="form-control"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                />
              </div>
              <div className="col-4">
                <label>Target Realisasi</label>
                <input
                  type="number"
                  className="form-control"
                  value={realizationTarget}
                  onChange={(e) => setRealizationTarget(e.target.value)}
                />
              </div>
              <div className="col-12">
                <label>Informasi Eksternal</label>
                <textarea
                  className="form-control"
                  value={externalInfo}
                  onChange={(e) => setExternalInfo(e.target.value)}
                ></textarea>
              </div>
              <div className="col-12">
                <hr />
                <h6>Search & Select Employees :</h6>
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
                <button type="submit" className="btn btn-primary" style={{ float: 'right' }}>Save Working Plan</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
