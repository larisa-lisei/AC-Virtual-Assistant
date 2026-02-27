import { Route, Routes } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import ChatPage from './features/chat/ChatPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage/>} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  )
}

export default App;