import './index.css'
import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'
import { Routes, Route } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Protected from '@/store/Protected'


function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/register' element={<SignUp />} />

        // Protected Routes
        <Route path='/sidebar' element={<Protected> <Sidebar /> </Protected>} />
      </Routes>

    </>
  )
}

export default App
