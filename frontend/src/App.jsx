import './index.css'

import { Routes, Route } from 'react-router-dom'

import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'

import DashboardLayout from '@/layouts/DashboardLayout'
import Protected from '@/store/Protected'
import Dashboard from '@/pages/Dashboard'
import Reports from '@/pages/Reports'
import Alerts from '@/pages/Alerts'


function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path='/' element={<Login />} />
      <Route path='/register' element={<SignUp />} />

      {/* Protected Routes */}
      <Route element={<Protected />}>
        <Route element={<DashboardLayout />}>
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/reports' element={<Reports />} />
          <Route path='/alerts' element={<Alerts />} />
        </Route>
      </Route>

    </Routes>
  );

}

export default App;
