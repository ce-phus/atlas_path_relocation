import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login, Register } from "./pages"

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/sign-in" element={<Login />} exact />
        <Route path="/sign-up" element={<Register />} exact />
      </Routes>
    </Router>
  )
}

export default App
