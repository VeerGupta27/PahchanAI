import { Routes, Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import SignIn from "./components/SignIn"

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignIn showSignup={true} />} />
    </Routes>
  )
}

export default App