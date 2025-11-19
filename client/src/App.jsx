import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login, Register, Home, Profile, Tasks, Documents, Budget } from "./pages"

function App() {

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
