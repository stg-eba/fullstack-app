import Login from './Login';
import Todo from './Todo';
import React from 'react';
import Navbar from './Navbar';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';  // Import PrivateRoute
function App() {
  return (
    <>
    <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} /> 
        
        <Route element={<PrivateRoute />}>
        
          <Route path="/" element={<Todo />} /> 
          <Route path="/todo" element={<Todo />} />  
        </Route>

      </Routes>
    </>
  );
}

export default App;
