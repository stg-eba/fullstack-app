// client/src/TaskMonitor.js
import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useRef, useCallback
import io from 'socket.io-client';
import './output.css'; // Tailwind CSS
import { useAuth } from './AuthContext';

// --- Constants ---
const API_BASE_URL = '/api'; // Base URL for API calls
const SOCKET_SERVER_URL = 'http://localhost:3000'; // Ensure this matches your server

function TaskMonitor() {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskLogs, setSelectedTaskLogs] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [error, setError] = useState(null);
  // Removed socket state, manage socket instance directly in useEffect
  const { auth } = useAuth();

  // Keep track of the selected task ID without causing effect re-runs
  const selectedTaskIdRef = useRef(selectedTaskId);
  useEffect(() => {
    selectedTaskIdRef.current = selectedTaskId;
  }, [selectedTaskId]);

  // --- Data Fetching Functions (using useCallback) ---
  const fetchTasks = useCallback(async () => {
    setIsLoadingTasks(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/scheduled-tasks`, {
        credentials: 'include',
      });
      if (!response.ok) {
        // Try to get more specific error message
        let errorMsg = `Failed to fetch tasks: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (_) { /* Ignore if response is not JSON */ }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'タスクの読み込みに失敗しました。');
    } finally {
      setIsLoadingTasks(false);
    }
  }, []); // Empty dependency array as it doesn't depend on component state/props

  const fetchLogs = useCallback(async (taskId) => {
    if (!taskId) return;
    // Don't reset selectedTaskId here, just fetch logs for the given ID
    setIsLoadingLogs(true);
    setError(null);
    // Clear previous logs when fetching for a *new* task ID
    if (selectedTaskIdRef.current !== taskId) {
        setSelectedTaskLogs([]);
    }

    try {
      // Fetch logs for the *passed* taskId
      const response = await fetch(`${API_BASE_URL}/scheduled-tasks/${taskId}/logs?limit=50`, {
        credentials: 'include',
      });
      if (!response.ok) {
         let errorMsg = `Failed to fetch logs: ${response.statusText}`;
         try {
           const errorData = await response.json();
           errorMsg = errorData.message || errorMsg;
         } catch (_) { /* Ignore */ }
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setSelectedTaskLogs(data); // Update logs
    } catch (err) {
      console.error(err);
      setError(err.message || 'ログの読み込みに失敗しました。');
    } finally {
      setIsLoadingLogs(false);
    }
  }, []); 


  const handleSelectTask = useCallback((taskId) => {
    setSelectedTaskId(taskId); 
    fetchLogs(taskId);       
  }, [fetchLogs]); 


  useEffect(() => {
    if (auth) {
      fetchTasks();
    } else {

      setTasks([]);
      setSelectedTaskLogs([]);
      setSelectedTaskId(null);
      setError(null);
    }
  }, [auth, fetchTasks]);


  useEffect(() => {

    if (!auth) return;

    const newSocket = io(SOCKET_SERVER_URL, {
      withCredentials: true,

    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server (Task Monitor)');
    });

    newSocket.on('connect_error', (err) => {
        console.error('WebSocket Connection Error:', err);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server (Task Monitor):', reason);

    });

    newSocket.on('task_update', (updatedTaskData) => {
      console.log('Task update received:', updatedTaskData);

      setTasks(currentTasks =>
        currentTasks.map(task =>
          task.id === updatedTaskData.id ? { ...task, ...updatedTaskData } : task
        )
      );


      if (selectedTaskIdRef.current === updatedTaskData.id) {
         console.log(`Selected task ${updatedTaskData.id} updated, refetching logs.`);
         fetchLogs(selectedTaskIdRef.current); 
      }
    });


    return () => {
      console.log('Disconnecting WebSocket (Task Monitor)');
      newSocket.disconnect();
    };

  }, [auth, fetchLogs]);


  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'retrying': return 'text-yellow-600';
      case 'idle':
      default: return 'text-gray-500';
    }
  };

  const getLogLevelColor = (level) => {
      switch (level) {
          case 'error': return 'text-red-400';
          case 'warn': return 'text-yellow-400';
          case 'info':
          default: return 'text-gray-300'; // Keep info logs visible
      }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">スケジュールタスクモニター</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="md:col-span-1 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">タスクリスト</h2>
          {isLoadingTasks ? (
            <p>読み込み中...</p>
          ) : tasks.length === 0 ? (
            <p>スケジュールされたタスクはありません。</p>
          ) : (
            <ul className="space-y-2">
              {tasks.map(task => (
                <li
                  key={task.id}

                  onClick={() => handleSelectTask(task.id)}
                  className={`p-2 rounded cursor-pointer transition-colors duration-150 ease-in-out hover:bg-gray-100 ${selectedTaskId === task.id ? 'bg-blue-100 ring-2 ring-blue-300' : ''}`}
                >
                  <div className="font-medium">{task.name}</div>
                  <div className="text-sm">
                    ステータス: <span className={`font-semibold ${getStatusColor(task.status)}`}>{task.status}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    最終実行: {task.lastRunAt ? new Date(task.lastRunAt).toLocaleString() : '未実行'}
                  </div>
                   <div className="text-xs text-gray-500">
                    次回実行: {task.nextRunAt ? new Date(task.nextRunAt).toLocaleString() : '未定'}
                  </div>

                  {task.lastLogMessage && (
                    <div className="text-xs text-gray-600 truncate mt-1" title={task.lastLogMessage}>
                      最新ログ: {task.lastLogMessage}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>


        <div className="md:col-span-2 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">
            ログ {selectedTaskId ? `(${tasks.find(t => t.id === selectedTaskId)?.name || '不明なタスク'})` : ''}
          </h2>
          {selectedTaskId ? (
            isLoadingLogs ? (
              <p>ログを読み込み中...</p>
            ) : selectedTaskLogs.length === 0 ? (
              <p>ログはありません。</p>
            ) : (

              <div className="h-96 overflow-y-auto bg-gray-800 text-white p-3 rounded font-mono text-xs border border-gray-700 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {selectedTaskLogs.map(log => (

                  <p key={log.id} className={`${getLogLevelColor(log.level)}`}>
                    <span className="text-gray-500">[{new Date(log.createdAt).toLocaleString()}]</span>{' '}
                    <span className={`font-bold ${getLogLevelColor(log.level)}`}>[{log.level.toUpperCase()}]</span>{' '}
                    <span className="whitespace-pre-wrap">{log.message}</span>
                  </p>
                ))}
              </div>
            )
          ) : (
            <p className="text-gray-500">タスクを選択してログを表示します。</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskMonitor;

