import React, { useState, useEffect } from 'react';
import './output.css'; 
import { useAuth } from './AuthContext';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const { auth } = useAuth();

  const [editingTodoId, setEditingTodoId] = useState(null); 
  const [editingTodoTitle, setEditingTodoTitle] = useState('');

  useEffect(() => {
    if (auth) { 
        fetchTodos();
    }

  }, [auth]);

  const fetchTodos = async () => {
    try {
      const response = await fetch('http://localhost:3000/todos', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      } else {
        console.error('Failed to fetch todos:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async () => {
    if (!newTodoTitle.trim()) return;
    try {
      const response = await fetch('http://localhost:3000/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title: newTodoTitle }),
      });
      if (response.ok) {
        const newTodo = await response.json();
        setTodos([...todos, newTodo]);
        setNewTodoTitle('');
      } else {
        console.error('Failed to add todo:', await response.text());
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const updateTodo = async (id, updatedFields) => {
    try {
      const response = await fetch(`http://localhost:3000/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedFields),
      });
      if (response.ok) {
        const updatedTodoFromServer = await response.json();
        setTodos(todos.map(todo => (todo.id === updatedTodoFromServer.id ? updatedTodoFromServer : todo)));
        if (updatedFields.hasOwnProperty('title')) {
            setEditingTodoId(null);
            setEditingTodoTitle('');
        }
      } else {
        console.error('Failed to update todo:', await response.text());
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/todos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setTodos(todos.filter(todo => todo.id !== id));
      } else {
        console.error('Failed to delete todo:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleEditClick = (todo) => {
    setEditingTodoId(todo.id);
    setEditingTodoTitle(todo.title); 
  };

  const handleSaveClick = (id) => {
    if (!editingTodoTitle.trim()) {
        console.warn("Todo title cannot be empty.");
        return;
    }
    updateTodo(id, { title: editingTodoTitle });
  };

  const handleCancelClick = () => {
    setEditingTodoId(null);
    setEditingTodoTitle('');
  };

  const handleInputChange = (e) => {
    setEditingTodoTitle(e.target.value);
  };

  const handleInputKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      handleSaveClick(id);
    } else if (e.key === 'Escape') {
      handleCancelClick();
    }
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo リスト</h1>

      <div className="mb-4 flex">
        <input
          type="text"
          value={newTodoTitle}
          onChange={(e) => setNewTodoTitle(e.target.value)}
          placeholder="todoを追加"
          className="border border-gray-300 p-2 rounded-md mr-2 flex-grow" 
          onKeyDown={(e) => e.key === 'Enter' && addTodo()} 
        />
        <button onClick={addTodo} className="bg-blue-500 text-white p-2 rounded-md flex-shrink-0"> 
          追加
        </button>
      </div>

      
      <ul>
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center mb-2 p-2 border rounded hover:bg-gray-50">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => updateTodo(todo.id, { completed: !todo.completed })}
              className="mr-3 flex-shrink-0" 
              disabled={editingTodoId === todo.id} 
            />

            
            {editingTodoId === todo.id ? (
              <input
                type="text"
                value={editingTodoTitle}
                onChange={handleInputChange}
                onKeyDown={(e) => handleInputKeyDown(e, todo.id)}
                className="border border-gray-300 p-1 rounded-md flex-grow mr-2" 
                autoFocus 
              />
            ) : (
              <span
                className={`flex-grow mr-2 ${todo.completed ? 'line-through text-gray-500' : ''}`}
                onDoubleClick={() => handleEditClick(todo)} 
              >
                {todo.title}
              </span>
            )}

            
            <div className="flex gap-1 flex-shrink-0">
              {editingTodoId === todo.id ? (
                <>
                  <button
                    onClick={() => handleSaveClick(todo.id)}
                    className="bg-green-500 text-white p-1 px-2 rounded-md text-xs hover:bg-green-600"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancelClick}
                    className="bg-gray-500 text-white p-1 px-2 rounded-md text-xs hover:bg-gray-600"
                  >
                    取消
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEditClick(todo)}
                    className="bg-yellow-500 text-white p-1 px-2 rounded-md text-xs hover:bg-yellow-600" // Yellow edit button
                  >
                    編集
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="bg-red-500 text-white p-1 px-2 rounded-md text-xs hover:bg-red-600"
                  >
                    削除
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
