import './App.css';
import Home from './Components/Home';
import Headers from './Components/Headers';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import SignUp from './Components/SignUp';
import Error from './Components/Error';
import { Routes, Route } from "react-router-dom"
import ForgotPassword from './Components/ForgotPassword';
function App() {
  return (
    <>
      <Headers />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='*' element={<Error />} />
      </Routes>
    </>
  );
}

export default App;
