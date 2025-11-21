import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login, Register, Home, Profile, Tasks, Documents, Budget } from "./pages"
import { Index } from './consultant/pages';

import { useSelector } from 'react-redux';

function App() {

  const { consultant } = useSelector((state)=>state.getConsultantProfileReducer);

  if (consultant) {
    return (
      <Router>
        <Routes>
          <Route path="/*" element={<Index />} exact />
        </Routes>
      </Router>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/sign-in" element={<Login />} exact />
        <Route path="/sign-up" element={<Register />} exact />
        <Route path="/*" element={<Home />} exact />
        <Route path="/profile" element={<Profile />} exact />
        <Route path="/tasks" element={<Tasks />} exact />
        <Route path="/documents" element={<Documents />} exact />
        <Route path="/budget" element={<Budget />} exact />
      </Routes>
    </Router>
  )
}

export default App
