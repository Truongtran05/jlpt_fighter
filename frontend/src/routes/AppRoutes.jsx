import {Route, Routes} from 'react-router-dom'
import HomePage from '../pages/HomePage.jsx'
import GrammarPage from '../pages/GrammarPage.jsx'
import KanjiPage from '../pages/KanjiPage.jsx'
import VocabularyPage from '../pages/VocabularyPage.jsx'
import QuizPage from '../pages/QuizPage.jsx'
import LoginPage from '../pages/LoginPage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import AccountPage from '../pages/AccountPage.jsx'
import LearningPage from '../pages/LearningPage.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/grammar/:searchQuery?" element={<GrammarPage/>} />
      <Route path="/kanji/:searchQuery?" element={<KanjiPage />} />
      <Route path="/vocab/:searchQuery?" element={<VocabularyPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/learning" element={<LearningPage />} />
      <Route path="/login" element={<LoginPage/>} />
      <Route path="/register" element={<RegisterPage/>} />
      <Route path="/me" element={<AccountPage/>} />
    </Routes>
  )
}
