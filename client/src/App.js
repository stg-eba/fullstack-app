import Login from './Login';
import TodoList from './ToDoList'; // Import the TodoList component
import React from 'react';
import Navbar from './Navbar';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import PrivateRoute from './PrivateRoute'; 
import TaskMonitor from './TaskMonitor';
function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
        <Route path="/" element={<Home />} />
          <Route path="/todo" element={<TodoList />} />
          <Route path="/todo/list" element={<TodoList />} />
          <Route path="/tasks" element={<TaskMonitor />} /> 
        </Route>
      </Routes>
    </>
  );
}

export default App;