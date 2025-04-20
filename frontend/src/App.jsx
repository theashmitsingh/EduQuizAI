import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import toast, { Toaster } from 'react-hot-toast';
import About from './pages/About';
import Navbar from './components/Navbar';
import Footer from './components/Footer'
import Contact from './pages/Contact';
import ChatBot from './pages/ChatBot';
import Quiz from './pages/Quiz';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import GenerateQuiz from './pages/GenerateQuiz';
import PreviousQuiz from './components/PreviousQuiz';

const App = () => {
  return (
    <div>
      <Toaster />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/chatbot' element={<ChatBot />} />
        <Route path='/quiz' element={<Quiz />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/generate-quiz' element={<GenerateQuiz />} />
        <Route path="/previous-quiz/:quizId" element={<PreviousQuiz key={window.location.pathname} />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App