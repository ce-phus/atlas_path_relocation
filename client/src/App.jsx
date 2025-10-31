import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from "./pages"

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} exact />
      </Routes>
    </Router>
  )
}

export default App
