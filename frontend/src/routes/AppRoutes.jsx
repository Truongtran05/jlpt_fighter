import {Navigate, Route, Routes} from 'react-router-dom'
import HomePage from '../pages/HomePage.jsx'
import DictionaryPage from '../pages/DictionaryPage.jsx'
import QuizPage from '../pages/QuizPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import AccountPage from '../pages/AccountPage.jsx'
import LearningPage from '../pages/LearningPage.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dictionary" element={<DictionaryPage />} />
      <Route path="/explore" element={<Navigate to="/dictionary" replace />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/learning" element={<LearningPage />} />
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/register" element={<RegisterPage/>} />
      <Route path="/me" element={<AccountPage/>} />
    </Routes>
  )
}
