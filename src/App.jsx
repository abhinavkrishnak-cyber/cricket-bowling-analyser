import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import AnalysisPage from './components/AnalysisPage';
import Dashboard from './components/Dashboard';
import HistoryPage from './components/HistoryPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'analyze' | 'history' | 'dashboard'
  const [historyData, setHistoryData] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [userName, setUserName] = useState("Guest Bowler");

  // Fetch session history from Express API on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/sessions');
        if (response.ok) {
          const data = await response.json();
          setHistoryData(data);
        } else {
          throw new Error("Failed to fetch sessions from server API");
        }
      } catch (err) {
        console.error("Express API offline, initializing local storage session fallback:", err);
        // Fallback to local storage
        const localData = localStorage.getItem('ai_bowling_sessions');
        if (localData) {
          setHistoryData(JSON.parse(localData));
        } else {
          // Initialize empty array
          setHistoryData([]);
        }
      }
    };

    fetchSessions();
  }, []);

  const handleAnalysisComplete = async (analysisResult) => {
    console.log("Starting analysis...");
    // Keep user's configured bowler name
    setUserName(analysisResult.bowlerName);

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analysisResult)
      });

      if (response.ok) {
        const savedSession = await response.json();
        console.log("Analysis response:", savedSession);
        setHistoryData((prev) => [savedSession, ...prev]);
        setSelectedSession(savedSession);
        setActiveTab('dashboard');
      } else {
        throw new Error("Failed to save to server database. Status: " + response.status);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      // Client-side local storage fallback
      const updatedHistory = [analysisResult, ...historyData];
      setHistoryData(updatedHistory);
      localStorage.setItem('ai_bowling_sessions', JSON.stringify(updatedHistory));
      
      setSelectedSession(analysisResult);
      setActiveTab('dashboard');
    }
  };

  const handleViewSession = (session) => {
    setSelectedSession(session);
    setUserName(session.bowlerName);
    setActiveTab('dashboard');
  };

  const handleDeleteSession = (id) => {
    // Delete in local state
    const updatedHistory = historyData.filter((sess) => sess.id !== id);
    setHistoryData(updatedHistory);
    localStorage.setItem('ai_bowling_sessions', JSON.stringify(updatedHistory));

    // Optional: Call Express backend if deleting is needed (for state symmetry)
    // For simplicity, local state update persists on front end immediately.
  };

  const startAnalysisFromCTA = () => {
    setActiveTab('analyze');
  };

  const startDemoFromCTA = () => {
    // Simulates starting an analysis with a pre-loaded fast bowling demo immediately
    setActiveTab('analyze');
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-dark text-slate-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-grow">
        {activeTab === 'home' && (
          <LandingPage 
            onStartAnalysis={startAnalysisFromCTA} 
            onStartDemo={startDemoFromCTA} 
          />
        )}
        
        {activeTab === 'analyze' && (
          <AnalysisPage 
            onAnalysisComplete={handleAnalysisComplete} 
          />
        )}

        {activeTab === 'dashboard' && selectedSession && (
          <Dashboard 
            sessionData={selectedSession} 
            historyData={historyData}
            onReset={() => setActiveTab('analyze')}
            bowlerName={userName}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage 
            historyData={historyData} 
            onViewSession={handleViewSession} 
            onDeleteSession={handleDeleteSession}
          />
        )}
      </main>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
