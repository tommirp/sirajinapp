// /src/pages/WorkingPlans/PlanDetail.jsx
import { Fragment, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { supabase } from '../../supabaseClient'
import { getUserInfo } from '../../utils/auth'

export default function PlanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [plan, setPlan] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
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
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Failed to approve!',
          confirmButtonText: 'OK',
          showCancelButton: false,
        })
      } else {
        
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Approval Success!',
          confirmButtonText: 'OK',
          showCancelButton: false,
        })
        
        setPlan({ ...workingPlan, is_approved: 1, approved_by: email })
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
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Failed to reject!',
          confirmButtonText: 'OK',
          showCancelButton: false,
        })
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Rejection Success!',
          confirmButtonText: 'OK',
          showCancelButton: false,
        })
        setPlan({ ...workingPlan, is_approved: 0, approved_by: email })
      }
    }
  }
  
  async function autoGenerateActivitiesByAI(planId) {
    if (!planId) return

    if (plan.external_info === '' || plan.external_info === null) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Deskripsi Rencana Kerja Wajib Diisi Agar AI Dapat Mempelajari Informasi Rencana Kerja!',
        confirmButtonText: 'OK',
        showCancelButton: false,
      })
      return
    }

    Swal.fire({
      icon: 'warning',
      title: 'Warning',
      text: 'This Feature Will Be Ready Soon!',
      confirmButtonText: 'OK',
      showCancelButton: false,
    })
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

      if (!res.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Failed to generate activities by AI!',
          confirmButtonText: 'OK',
          showCancelButton: false,
        })
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
      {loading ? (
          <div className="d-flex justify-content-center mt-5 vh-100">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 style={{ marginLeft: '10px', marginTop: '5px' }}>Loading...</h4>
          </div>
      ) : (
        <div className="row">
          <div className="col-lg-12 col-md-12 col-sm-12">
            <div className="d-flex justify-between items-center mb-1">
              <button
                onClick={() => navigate('/rencana-kerja')}
                className="btn btn-sm btn-outline-secondary mb-4"  
              >
                <i className='bi bi-arrow-left'></i>
              </button>
              <button
                style={{ marginLeft: '10px' }}
                onClick={() => navigate(`/rencana-kerja/edit/${id}`)}
                className="btn btn-sm btn-warning mb-4"  
              >
                <i className='bi bi-pencil-square'></i>
              </button>
              <h4 className="text-xl font-bold" style={{ marginLeft: '10px' }}>Detail Rencana Kerja</h4>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-3">
                    <label><i>Judul Rencana Kerja :</i></label>
                    <input type="text" className="form-control" disabled={true} value={plan.title} />
                  </div>
                  <div className='col-2'><label><i>Tgl Mulai:</i></label>
                    <input className="form-control" value={plan.start_date} disabled={true} />
                  </div>
                  <div className='col-2'><label><i>Tgl Deadline:</i></label>
                    <input className="form-control" value={plan.deadline_date} disabled={true} />
                  </div>
                  <div className='col-2'><label><i>KPI Target :</i></label>
                    <input className="form-control" value={plan.kpi_indicator} disabled={true} />
                  </div>
                  <div className="col-3">
                      <label><i>Status Persetujuan :</i></label>
                      <div className="d-flex">
                        <input className="form-control" disabled={true} style={{ color: getApprovalStatus(plan.is_approved, plan.approved_by, true, true) }} value={getApprovalStatus(plan.is_approved, plan.approved_by)} />
                        {!restrictedAccess('approval_workingplan') && (
                          <Fragment>
                            {!plan.approved_by && (
                              <Fragment>
                                <button
                                  onClick={handleApprove}
                                  style={{ marginLeft: '12px' }}
                                  className="btn btn-sm btn-success"
                                >
                                  <i className='bi bi-check'></i>
                                </button>
                                <button
                                  onClick={handleReject}
                                  style={{ marginLeft: '10px' }}
                                  className="btn btn-sm btn-danger"
                                >
                                  <i className='bi bi-x'></i>
                                </button>
                              </Fragment>
                            )}
                          </Fragment>
                        )}
                      </div>
                  </div>
                  <div className='col-12 mt-2'>
                    <label><i>Deskripsi Rencana Kerja :</i></label>
                    <textarea className="form-control" rows="2" disabled={true} defaultValue={plan.external_info}></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-12 col-md-12 col-sm-12 mt-4">
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
