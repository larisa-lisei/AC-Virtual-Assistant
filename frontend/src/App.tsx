import { Route, Routes } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import ChatPage from './features/chat/ChatPage';
import ActivateAccountPage from './features/auth/ActivateAccountPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage/>} />
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/activate-account" element={<ActivateAccountPage/>} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>
  )
}

export default App;