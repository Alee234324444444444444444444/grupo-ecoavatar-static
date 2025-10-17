import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Header from './components/Header';
import CharacterCanvas from './components/CharacterCanvas';
import ChallengesSection from './components/ChallengesSection';
import Forum from './components/Forum';
import Login from './components/Login';
import Register from './components/Register';
import AdminChallenges from './components/AdminChallenges';
import ReportTable from './components/ReportTable.jsx';
import Perfil from './components/Perfil.jsx';
import Posts from './pages/Posts';
import ContextPage from './components/Context.jsx';
import Footerpages from './components/Footerpages.jsx';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={
                <>
                  <Header />
                  <ContextPage />
                  <CharacterCanvas />
                  <ChallengesSection />
                </>
              } />
              
              <Route path="/login" element={<Login />} />
              <Route path="/comments" element={<Forum />} />
              <Route path="/challenges" element={<ChallengesSection />} />
              <Route path="/admin/challenges" element={<AdminChallenges />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reports" element={<ReportTable/>} />
              <Route path="/publicaciones" element={
                <>
                  <Posts />
                  <Forum />
                </>
              } />
              <Route path="/api/perfil" element={<Perfil/>} />
            </Routes>
          </main>
          <Footerpages />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;