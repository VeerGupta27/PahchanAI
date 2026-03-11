import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'

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
          element={<h1>Sign In Page</h1>} 
        />

      </Routes>
    
    </>
  )
}

export default App
