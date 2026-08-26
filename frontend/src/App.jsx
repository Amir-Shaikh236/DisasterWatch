import './index.css'

import { Routes, Route } from 'react-router-dom'

import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'

import DashboardLayout from '@/layouts/DashboardLayout'
import Protected from '@/store/Protected'
import Dashboard from '@/pages/Dashboard'
import Reports from '@/pages/Reports'
import Alerts from '@/pages/Alerts'
import { useContext, useEffect } from 'react'
import { listenForNotifications } from '@/services/notification'
import Setting from '@/pages/Setting'
import { useUser } from './store/useUser'
import { AuthContext } from '@/store/AuthProvider'
import { useAlerts } from './store/useAlerts'
import { useReports } from './store/useReports'
import { socket } from './socket/socket'
import { removeSocketListeners, socketListeners } from '@/socket/socketListeners'

function App() {
  const { isInitializing, isAuthenticated } = useContext(AuthContext)
  const fetchUser = useUser((state) => state.fetchUser);
  const fetchAlerts = useAlerts((state) => state.fetchAlerts);
  const fetchReports = useReports((state) => state.fetchReports);

  useEffect(() => {
    if (isInitializing) return;

    if (isAuthenticated) {
      socket.connect();
      socketListeners();
      fetchUser();
      fetchAlerts();
      fetchReports();

    } else {
      socket.disconnect();
      removeSocketListeners()
    }

  }, [isInitializing, isAuthenticated, fetchUser, fetchAlerts, fetchReports]);

  useEffect(() => {
    const unsubscribe = listenForNotifications();

    return () => {
      unsubscribe()
    }

  }, []);

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
          <Route path='/setting' element={<Setting />} />
        </Route>
      </Route>

    </Routes>
  );

}

export default App;
