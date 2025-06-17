// /src/pages/WorkingPlans/index.jsx
import { Fragment, use, useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { getUserInfo, signOutUser } from '../../utils/auth'

export default function WorkingPlansPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 576)
  const [plans, setPlans] = useState([])
  const [userRole, setUserRole] = useState(null)
  const navigate = useNavigate()

  const fetchPlans = async () => {
    const {
      data,
      error
    } = await supabase
      .from('working_plans')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else setPlans(data)
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 576)
    }
    
    const initPage = async () => {
      const usr = await getUserInfo()
      
      if (!usr || !usr.role_detail) {
        signOutUser()
        navigate('/login')
      }
  
      if (usr.role_detail) {
        setUserRole(usr.role_detail)
  
        window.addEventListener('resize', handleResize)
        window.removeEventListener('resize', handleResize)
    
        fetchPlans()
      }
    }

    initPage()
  }, [])

  async function deletePlan(planId, title) {
    if (userRole.delete_workingplan === 'YES') {
      if (!planId) return
  
      const confirmed = window.confirm(`Are you sure you want to delete this Plan : "${title}"?`)
  
      if (confirmed) {
        const { error } = await supabase
          .from('working_plans')
          .delete()
          .eq('id', planId)
  
        if (error) {
          alert('Error deleting plan:')
        } else {
          alert('Plan deleted successfully')
          fetchPlans()
        }
      }
    } else alert('You Cannot Delete This! Your Access is Restricted!')
  }

  async function editPlan(planId) {
    if (userRole.update_workingplan === 'YES') {
      if (!planId) return

      navigate(`/rencana-kerja/edit/${planId}`)
    } else alert('You Cannot Delete This! Your Access is Restricted!')
  }

  
  const handleApprove = async (id, title) => {
    const confirmed = window.confirm(`Are you sure you want to approve this Plan : "${title}"?`)

    if (confirmed) {
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
  }
  
  const handleReject = async (id, title) => {
    const confirmed = window.confirm(`Are you sure you want to reject this Plan : "${title}"?`)

    if (confirmed) {
      const user = await supabase.auth.getUser()
      const email = user.data?.user?.email

      const { error } = await supabase
        .from('working_plans')
        .update({ is_approved: 0, approved_by: email })
        .eq('id', id)

      if (error) {
        alert('Gagal mereject: ' + error.message)
      } else {
        alert('Berhasil mereject.')
        setWorkingPlan({ ...workingPlan, is_approved: 0, approved_by: email })
      }
    }
  }

  function restrictedAccess(field, is_approved = 0) {
    let disabled = true;
    const disabledCondition = userRole && userRole[field] === 'YES' || false;
    if (disabledCondition) {
      if (is_approved === 0) disabled = false;
    }
    
    return disabled;
  }

  function getApprovalStatus(is_approved, approved_by, is_bool = false, is_color = null) {
    let stat = is_bool ? 0 : 'Belum Disetujui';
    if (is_approved === 1 && approved_by && approved_by !== '') {
      stat = is_bool ? 1 : `Disetujui (${approved_by})`;
    }

    if (is_approved === 0 && approved_by && approved_by !== '') {
      stat = is_bool ? 2 : `Ditolak (${approved_by})`;
    }

    if (is_color) {
      if (stat === 1) return 'green';
      if (stat === 2) return 'red';
      return 'black';
    }
    
    return stat;
  }

  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-between items-center mb-4">
        <h4 className="text-xl font-bold">Daftar Rencana Kerja</h4>
        {!restrictedAccess('create_workingplan') ? (
          <button className="btn btn-sm btn-outline-secondary" style={{ marginLeft: '20px', height: '30px' }} onClick={() => navigate('/rencana-kerja/tambah')}>+ Tambah</button>
        ) : ""}
      </div>
      <Fragment>
        {isMobile ? (
          <div>
            {plans.map((plan, index) => (
              <div className="card mb-2" key={index}>
                <div className="card-body">
                  <div className="card-title">
                    <h6 className='card-title'>{plan.title}</h6>
                    <span style={{ fontSize: '12px', display: 'block' }}>Date : <b>{plan.start_date ? new Date(plan.start_date).toLocaleDateString() : '-'} s/d {plan.deadline_date ? new Date(plan.deadline_date).toLocaleDateString() : '-'}</b></span>
                    <span style={{ fontSize: '12px', display: 'block' }}>Target : <b>{plan.realization_target || 0}</b></span>
                    <span style={{ fontSize: '12px', display: 'block' }}>Approval : <span style={{ color: getApprovalStatus(plan.is_approved, plan.approved_by, true, true) }}><b>{getApprovalStatus(plan.is_approved, plan.approved_by)}</b></span></span>
                    <span style={{ fontSize: '12px', display: 'block' }}>By : <b>{plan.created_by} ({plan.created_at ? new Date(plan.created_at).toLocaleDateString() : ''})</b></span>
                    <div className="row mt-2">
                      <div className="col-3">
                        <button className='btn btn-sm w-100 btn-success' onClick={() => navigate(`/rencana-kerja/${plan.id}`)}>
                          <i className='bi bi-list-task'></i>
                        </button>
                      </div>
                      <div className="col-3">
                        <button
                          disabled={restrictedAccess('update_workingplan', getApprovalStatus(plan.is_approved, plan.approved_by, true))}
                          className={!restrictedAccess('update_workingplan', getApprovalStatus(plan.is_approved, plan.approved_by, true)) ? "btn btn-sm w-100 btn-warning" : "btn btn-sm w-100 btn-secondary"}
                          onClick={() => editPlan(plan.id)}
                        >
                          <i className='bi bi-pencil-square'></i>
                        </button>
                      </div>
                      <div className="col-3">
                        <button
                          disabled={restrictedAccess('delete_workingplan', getApprovalStatus(plan.is_approved, plan.approved_by, true))}
                          className={!restrictedAccess('delete_workingplan', getApprovalStatus(plan.is_approved, plan.approved_by, true)) ? "btn btn-sm w-100 btn-danger" : "btn btn-sm w-100 btn-secondary"}
                          onClick={() => deletePlan(plan.id, plan.title)}
                        >
                          <i className='bi bi-trash'></i>
                        </button>
                      </div>
                      <div className="col-3">
                        <button
                          disabled={restrictedAccess('approval_workingplan', getApprovalStatus(plan.is_approved, plan.approved_by, true))}
                          className={!restrictedAccess('approval_workingplan', getApprovalStatus(plan.is_approved, plan.approved_by, true)) ? "btn btn-sm w-100 btn-success" : "btn btn-sm w-100 btn-secondary"}
                          onClick={() => deletePlan(plan.id, plan.title)}
                        >
                          <i className='bi bi-check'></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <table className="table table-hover table-bordered table-striped">
              <thead>
                <tr>
                  <th scope="col" className='text-center'>Action</th>
                  <th scope="col" className='text-center'>Judul Rencana Kerja</th>
                  <th scope="col" className='text-center'>Tanggal Mulai</th>
                  <th scope="col" className='text-center'>Deadline</th>
                  <th scope="col" className='text-center'>Info External</th>
                  <th scope="col" className='text-center'>Realisasi Target</th>
                  <th scope="col" className='text-center'>Persetujuan</th>
                  <th scope="col" className='text-center'>Dibuat Oleh</th>
                  <th scope="col" className='text-center'>Tgl Dibuat</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan, index) => (
                  <tr key={index}>
                    <th scope="row">
                      <div className="d-flex justify-content-center">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => navigate(`/rencana-kerja/${plan.id}`)}
                          >
                            <i className='bi bi-list-task'></i>
                          </button>
                          <button
                            disabled={restrictedAccess('update_workingplan', getApprovalStatus(plan.is_approved, plan.approved_by, true))}
                            className={!restrictedAccess('update_workingplan', getApprovalStatus(plan.is_approved, plan.approved_by, true)) ? "btn btn-sm btn-warning" : "btn btn-sm btn-secondary"}
                            style={{ marginLeft: '5px' }}
                            onClick={() => editPlan(plan.id)}
                          >
                            <i className='bi bi-pencil-square'></i>
                          </button>
                          <button
                            disabled={restrictedAccess('delete_workingplan', getApprovalStatus(plan.is_approved, plan.approved_by, true))}
                            className={!restrictedAccess('delete_workingplan', getApprovalStatus(plan.is_approved, plan.approved_by, true)) ? "btn btn-sm btn-danger" : "btn btn-sm btn-secondary"}
                            style={{ marginLeft: '5px' }}
                            onClick={() => deletePlan(plan.id, plan.title)}
                          >
                            <i className='bi bi-trash'></i>
                          </button>
                          <div style={{ marginLeft: '10px', marginRight: '4px' }}>|</div>
                          <button
                            disabled={restrictedAccess('approval_workingplan', getApprovalStatus(plan.is_approved, plan.approved_by, true))}
                            className={!restrictedAccess('approval_workingplan', getApprovalStatus(plan.is_approved, plan.approved_by, true)) ? "btn btn-sm btn-success" : "btn btn-sm btn-secondary"}
                            style={{ marginLeft: '5px' }}
                            onClick={() => handleApprove(plan.id, plan.title)}
                          >
                            <i className='bi bi-check'></i>
                          </button>
                          <button
                            disabled={restrictedAccess('approval_workingplan', getApprovalStatus(plan.is_approved, plan.approved_by, true))}
                            className={!restrictedAccess('approval_workingplan', getApprovalStatus(plan.is_approved, plan.approved_by, true)) ? "btn btn-sm btn-danger" : "btn btn-sm btn-secondary"}
                            style={{ marginLeft: '5px' }}
                            onClick={() => handleReject(plan.id, plan.title)}
                          >
                            <i className='bi bi-x'></i>
                          </button>
                      </div>
                    </th>
                    <td>{plan.title}</td>
                    <td className='text-center'>{plan.start_date}</td>
                    <td className='text-center'>{plan.deadline_date}</td>
                    <td>{plan.external_info}</td>
                    <td className='text-center'>{plan.realization_target}</td>
                    <td className='text-center' style={{ color: getApprovalStatus(plan.is_approved, plan.approved_by, true, true) }}>{getApprovalStatus(plan.is_approved, plan.approved_by)}</td>
                    <td className='text-center'>{plan.created_by}</td>
                    <td className='text-center'>{plan.created_at ? new Date(plan.created_at).toLocaleString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Fragment>
    </div>
  )
}
