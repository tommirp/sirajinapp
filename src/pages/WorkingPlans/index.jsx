// /src/pages/WorkingPlans/index.jsx
import { Fragment, useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { canModifyPlan } from '../../utils/auth'

export default function WorkingPlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchPlans = async () => {
    setLoading(true)

    const {
      data,
      error
    } = await supabase
      .from('working_plans')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else setPlans(data)

    setLoading(false)
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  async function deletePlan(planId, title) {
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
  }

  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Daftar Rencana Kerja</h3>
        <button className="btn btn-sm btn-outline-secondary" style={{ marginLeft: '20px', height: '30px', marginTop: '5px' }} onClick={() => navigate('/rencana-kerja/tambah')}>+ Tambah</button>
      </div>

      {loading ? (
          <div className="d-flex justify-content-center mt-5 vh-100">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 style={{ marginLeft: '10px', marginTop: '5px' }}>Loading...</h4>
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
                        {canModifyPlan(plan) ? (
                          <Fragment>
                            {plan.is_approved !== 1 ? (
                              <Fragment>
                                <button
                                  disabled={plan.is_approved === 1}
                                  className="btn btn-sm btn-warning"
                                  style={{ marginLeft: '5px' }}
                                  onClick={() => navigate(`/rencana-kerja/edit/${plan.id}`)}
                                >
                                  <i className='bi bi-pencil-square'></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  style={{ marginLeft: '5px' }}
                                  onClick={() => deletePlan(plan.id, plan.title)}
                                >
                                  <i className='bi bi-trash'></i>
                                </button>
                              </Fragment>
                            ) : (
                              <Fragment>
                                <button
                                  className="btn btn-sm btn-light"
                                  disabled={true}
                                  style={{ marginLeft: '5px', backgroundColor: 'lightgrey' }}
                                >
                                  <i className='bi bi-pencil-square'></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-light"
                                  disabled={true}
                                  style={{ marginLeft: '5px', backgroundColor: 'lightgrey' }}
                                >
                                  <i className='bi bi-trash'></i>
                                </button>
                              </Fragment>
                            )}
                          </Fragment>
                        ) : ""}
                    </div>
                  </th>
                  <td>{plan.title}</td>
                  <td className='text-center'>{plan.start_date}</td>
                  <td className='text-center'>{plan.deadline_date}</td>
                  <td>{plan.external_info}</td>
                  <td className='text-center'>{plan.realization_target}</td>
                  <td className='text-center' style={{ color: plan.is_approved === 1 ? 'green' : 'black' }}>{plan.is_approved === 1 ? `Disetujui (${plan.approved_by || '-'})` : 'Belum Disetujui'}</td>
                  <td className='text-center'>{plan.created_by}</td>
                  <td className='text-center'>{plan.created_at ? new Date(plan.created_at).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
