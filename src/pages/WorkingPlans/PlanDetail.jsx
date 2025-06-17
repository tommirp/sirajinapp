// /src/pages/WorkingPlans/PlanDetail.jsx
import { Fragment, useEffect, useState } from 'react'
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

      const usr = await getUserInfo()
      if (!usr || !usr.role_detail) {
        signOutUser()
        navigate('/login')
      }
      
      if (usr.role_detail) {
        setUserRole(usr.role_detail)

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
      }

      setLoading(false)
    }

    fetchDetail()
  }, [id])

  const handleApprove = async () => {
    const confirmed = window.confirm(`Are you sure you want to approve this Plan?`)

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
  
  const handleReject = async () => {
    const confirmed = window.confirm(`Are you sure you want to reject this Plan?`)

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
  
  async function autoGenerateActivitiesByAI(planId) {
    if (!planId) return

    alert('Coming Soon!')
    return

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
                    <label><i>Title :</i></label>
                    <h5 className="text-2xl font-semibold mb-2">{plan.title}</h5>
                  </div>
                  <div className="col-12 mt-2">
                      <label><i>Approval Status :</i></label>
                      <div className="d-flex">
                        <span style={{ color: getApprovalStatus(plan.is_approved, plan.approved_by, true, true) }}><b>{getApprovalStatus(plan.is_approved, plan.approved_by)}</b></span>
                        {!restrictedAccess('approval_workingplan') && (
                          <Fragment>
                            {!plan.approved_by && (
                              <Fragment>
                                <button
                                  onClick={handleApprove}
                                  style={{ marginLeft: '12px', padding: '2px 7px' }}
                                  className="btn btn-sm btn-success"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={handleReject}
                                  style={{ marginLeft: '10px', padding: '2px 7px' }}
                                  className="btn btn-sm btn-danger"
                                >
                                  Reject
                                </button>
                              </Fragment>
                            )}
                          </Fragment>
                        )}
                      </div>

                      <div style={{ display: 'block' }} className='mt-2'><label><i>KPI:</i></label> <span style={{ display: 'block' }}><b>{plan.kpi_indicator}</b></span></div>
                      <div style={{ display: 'block' }} className='mt-2'><label><i>Mulai:</i></label> <span style={{ display: 'block' }}><b>{plan.start_date}</b></span></div>
                      <div style={{ display: 'block' }} className='mt-2'><label><i>Deadline:</i></label> <span style={{ display: 'block' }}><b>{plan.deadline_date}</b></span></div>
                      <div style={{ display: 'block' }} className='mt-2'><label><i>External Info :</i></label> <span style={{ display: 'block' }}><b>{plan.external_info}</b></span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-9 col-md-9 col-sm-12">
            <div className="d-flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold" style={{ marginLeft: '10px' }}>List Kegiatan</h4>
              {!restrictedAccess('create_activity') && (
                <Fragment>
                  <button
                    onClick={() => navigate(`/rencana-kerja/${id}/tambah-activity`)}
                    className="btn btn-sm btn-outline-secondary"
                    style={{ marginLeft: '20px', height: '30px'}}
                  >
                    + Tambah Activity
                  </button>
                  
                  <button
                    onClick={() => autoGenerateActivitiesByAI(id)}
                    className="btn btn-sm btn-warning"
                    style={{ marginLeft: '20px', height: '30px'}}
                  >
                    <i className='bi bi-robot'></i> Try Auto Generate by AI
                  </button>
                </Fragment>
              )}
            </div>
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                                  
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <table className="table table-hover table-bordered table-striped">
                          <thead>
                            <tr>
                              <th scope="col" className='text-center'>Action</th>
                              <th scope="col" className='text-center'>Judul</th>
                              <th scope="col" className='text-center'>Tgl Mulai</th>
                              <th scope="col" className='text-center'>Tgl Selesai</th>
                              <th scope="col" className='text-center'>Ext Institution</th>
                              <th scope="col" className='text-center'>Ext Person</th>
                              <th scope="col" className='text-center'>Ext Phone</th>
                              <th scope="col" className='text-center'>Dibuat Oleh</th>
                              <th scope="col" className='text-center'>Tgl Dibuat</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activities.length ? (
                              <Fragment>
                                {activities.map((activity, index) => (
                                  <tr key={index}>
                                    <th scope="row">
                                      <div className="d-flex justify-content-center">
                                          <button
                                            className="btn btn-sm btn-success"
                                            onClick={() => navigate(`/rencana-kerja/${activity.id}`)}
                                          >
                                            <i className='bi bi-list-task'></i>
                                          </button>
                                          <button
                                            disabled={restrictedAccess('update_activity')}
                                            className={!restrictedAccess('update_activity') ? "btn btn-sm btn-warning" : "btn btn-sm btn-secondary"}
                                            style={{ marginLeft: '5px' }}
                                            onClick={() => editPlan(activity.id)}
                                          >
                                            <i className='bi bi-pencil-square'></i>
                                          </button>
                                          <button
                                            disabled={restrictedAccess('delete_activity')}
                                            className={!restrictedAccess('delete_activity') ? "btn btn-sm btn-danger" : "btn btn-sm btn-secondary"}
                                            style={{ marginLeft: '5px' }}
                                            onClick={() => deletePlan(activity.id, activity.title)}
                                          >
                                            <i className='bi bi-trash'></i>
                                          </button>
                                      </div>
                                    </th>
                                    <td>{activity.title}</td>
                                    <td className='text-center'>{activity.start_date}</td>
                                    <td className='text-center'>{activity.end_date}</td>
                                    <td>{activity.external_institution}</td>
                                    <td>{activity.external_person}</td>
                                    <td>{activity.external_phone}</td>
                                    <td className='text-center'>{activity.created_by}</td>
                                    <td className='text-center'>{activity.created_at ? new Date(plan.created_at).toLocaleString() : ''}</td>
                                  </tr>
                                ))}
                              </Fragment>
                            ) : (
                              <tr key={0}>
                                <td colSpan={9} style={{ textAlign: 'center' }}>No Activities Data</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
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
