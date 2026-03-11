import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import SingIn from './components/SignIn'

function App() {

  return (
    <>  
      <Routes>
      
        <Route 
          path="/" 
          element={<h1>Home Page</h1>} 
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
