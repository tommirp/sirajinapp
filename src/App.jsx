import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthGate from './AuthGate'
import Login from './pages/Login'
import WorkingPlans from './pages/WorkingPlans'
import AddPlanForm from './pages/WorkingPlans/AddPlanForm'
import PlanDetail from './pages/WorkingPlans/PlanDetail'
import AddActivityForm from './pages/WorkingPlans/AddActivityForm'
import EditActivityForm from './pages/WorkingPlans/EditActivityForm'
import EditPlanForm from './pages/WorkingPlans/EditPlanForm'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <AuthGate>
            <Layout />
          </AuthGate>
        }>
          <Route index element={
            <AuthGate>
              <Dashboard />
            </AuthGate>}
          />
          <Route path="/rencana-kerja" element={
            <AuthGate>
              <WorkingPlans />
            </AuthGate>
          } />
          <Route path="/rencana-kerja/tambah" element={
            <AuthGate>
              <AddPlanForm />
            </AuthGate>
          } />
          <Route path="/rencana-kerja/edit/:id" element={
            <AuthGate>
              <EditPlanForm />
            </AuthGate>
          } />
          <Route path="/rencana-kerja/:id" element={
            <AuthGate>
              <PlanDetail />
            </AuthGate>
          } />
          <Route path="/rencana-kerja/:id/tambah-activity" element={
            <AuthGate>
              <AddActivityForm />
            </AuthGate>
          } />
          <Route path="/rencana-kerja/:id/edit-activity/:activityId" element={
            <AuthGate>
              <EditActivityForm />
            </AuthGate>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
