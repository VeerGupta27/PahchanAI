import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import SingIn from './components/SignIn'
import LandingPage from './pages/LandingPage'

function App() {

  return (
    <>  
      <Routes>
      
        <Route 
          path="/" 
          element={<LandingPage />} 
        />
       
       
        <Route 
          path="/signin" 
          element={
            <SingIn />} 
        />

      </Routes>
    
    </>
  )
}

export default App
