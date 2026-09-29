import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getStoredToken, setStoredToken } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Authentication State — Defaults strictly to unauthenticated unless valid session exists
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('trustguard_user');
      const token = getStoredToken();
      if (savedUser && token) {
        const parsed = JSON.parse(savedUser);
        return {
          ...parsed,
          isAuthenticated: true,
          name: parsed.email ? parsed.email.split('@')[0] : 'User',
          avatar: parsed.email ? parsed.email[0].toUpperCase() : 'U',
        };
      }
    } catch {}
    return {
      id: '',
      email: '',
      name: '',
      avatar: '',
      isAuthenticated: false,
    };
  });

  // Real Database-Driven Scans (Zero fake/demo data)
  const [history, setHistory] = useState([]);
  const [isLoadingScans, setIsLoadingScans] = useState(false);
  const [scansError, setScansError] = useState(null);

  // Active Draft / Analysis
  const [activeText, setActiveText] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // User Settings & Policy Preferences
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('trustguard_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      redactionStyle: 'bracket', // 'bracket', 'asterisk', 'block'
      autoCopyProtected: true,
      riskThreshold: 'Medium', // Alerts threshold
      retentionDays: 30,
      maskSensitiveLogs: true,
    };
  });

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync settings changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trustguard_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to sync settings:', e);
    }
  }, [settings]);

  /**
   * Fetch authenticated user's real scans from the backend
   * Zero fallback to demo data if the API fails
   */
  const fetchScans = useCallback(async () => {
    if (!user.isAuthenticated || !getStoredToken()) {
      setHistory([]);
      return;
    }

    setIsLoadingScans(true);
    setScansError(null);

    try {
      const response = await api.scans.list();
      const rawScans = response.data || [];

      // Normalize scans to match the UI contracts
      const formatted = rawScans.map((scan) => {
        const createdAtDate = scan.created_at ? new Date(scan.created_at) : new Date();
        const score = typeof scan.risk_score === 'number' ? scan.risk_score : 0;
        let riskLevel = 'Safe';
        if (score >= 70) riskLevel = 'High';
        else if (score >= 40) riskLevel = 'Medium';
        else if (score > 10) riskLevel = 'Low';

        const actionTaken = scan.action_taken || 'pending';
        let actionLabel = 'Pending';
        if (actionTaken === 'USE_REDACTED' || actionTaken === 'protected') actionLabel = 'Use Redacted';
        else if (actionTaken === 'SEND_ANYWAY' || actionTaken === 'sent_anyway') actionLabel = 'Send Anyway';
        else if (actionTaken === 'DISCARD' || actionTaken === 'discarded') actionLabel = 'Discarded';
        else if (actionTaken === 'reviewed') actionLabel = 'Reviewed';
        else if (actionTaken === 'safe') actionLabel = 'Safe';

        const textContent = scan.input_text || scan.redacted_text || 'Security Check';
        const title = textContent.slice(0, 32).trim() + (textContent.length > 32 ? '...' : '');
        const snippet = textContent.slice(0, 85).replace(/\n/g, ' ') + (textContent.length > 85 ? '...' : '');

        return {
          id: scan.id,
          title,
          snippet,
          risk: riskLevel,
          riskScore: score,
          findingsCount: Array.isArray(scan.flags) ? scan.flags.length : 0,
          action: actionLabel,
          actionRaw: actionTaken,
          date: createdAtDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: createdAtDate.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          originalText: scan.input_text || '',
          protectedText: scan.redacted_text || '',
          findings: scan.flags || [],
          created_at: scan.created_at,
        };
      });

      setHistory(formatted);
    } catch (err) {
      console.error('Failed to load user scan history:', err);
      // Strictly do not fallback to demo data (Section 24)
      setScansError(err.message || 'Unable to load your security history.');
      setHistory([]);
    } finally {
      setIsLoadingScans(false);
    }
  }, [user.isAuthenticated]);

  // Fetch scans whenever user authenticates or mounts while logged in
  useEffect(() => {
    if (user.isAuthenticated) {
      fetchScans();
    } else {
      setHistory([]);
    }
  }, [user.isAuthenticated, fetchScans]);

  /**
   * Real user signup against POST /api/auth/signup
   */
  const signup = async (email, password) => {
    try {
      const response = await api.auth.signup(email, password);
      const newUser = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.email.split('@')[0],
        avatar: response.user.email[0].toUpperCase(),
        created_at: response.user.created_at || new Date().toISOString(),
        isAuthenticated: true,
      };

      setUser(newUser);
      try {
        localStorage.setItem('trustguard_user', JSON.stringify(newUser));
      } catch {}

      showToast('Account created successfully.', 'success');
      return { success: true };
    } catch (error) {
      showToast(error.message || 'Signup failed. Please try again.', 'error');
      return { success: false, error: error.message };
    }
  };

  /**
   * Real user login against POST /api/auth/login
   */
  const login = async (email, password) => {
    try {
      const response = await api.auth.login(email, password);
      const authenticatedUser = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.email.split('@')[0],
        avatar: response.user.email[0].toUpperCase(),
        created_at: response.user.created_at || new Date().toISOString(),
        isAuthenticated: true,
      };

      setUser(authenticatedUser);
      try {
        localStorage.setItem('trustguard_user', JSON.stringify(authenticatedUser));
      } catch {}

      showToast('Welcome back to TrustGuard.', 'success');
      return { success: true };
    } catch (error) {
      showToast(error.message || 'Invalid email or password.', 'error');
      return { success: false, error: error.message };
    }
  };

  /**
   * Clean user logout clearing all stored state
   */
  const logout = () => {
    api.auth.logout();
    try {
      localStorage.removeItem('trustguard_user');
      localStorage.removeItem('trustguard_token');
    } catch {}

    setUser({
      id: '',
      email: '',
      name: '',
      avatar: '',
      isAuthenticated: false,
    });
    setHistory([]);
    setCurrentAnalysis(null);
    setActiveText('');
    showToast('Signed out of TrustGuard.', 'info');
  };

  /**
   * Real Security Analysis Pipeline integration (Phase 2)
   */
  const performAnalysis = async (text) => {
    const content = text !== undefined ? text : activeText;
    if (!content || !content.trim()) {
      showToast('Please enter or paste text to analyze', 'warning');
      return null;
    }

    setIsAnalyzing(true);
    setCurrentAnalysis(null);

    try {
      const response = await api.analyze.scan(content);
      const scan = response.scan;

      // Calculate category breakdown
      const categories = {
        privacy: { level: 'Safe', count: 0 },
        credential: { level: 'Safe', count: 0 },
        financial: { level: 'Safe', count: 0 },
        socialEngineering: { level: 'Safe', count: 0 },
      };

      const findings = (scan.flags || []).map((f, i) => {
        let catKey = 'privacy';
        let catLabel = 'Privacy';
        if (f.category === 'CREDENTIAL') {
          catKey = 'credential';
          catLabel = 'Credentials';
          categories.credential.count += 1;
          categories.credential.level = 'High';
        } else if (f.category === 'FINANCIAL') {
          catKey = 'financial';
          catLabel = 'Financial';
          categories.financial.count += 1;
          categories.financial.level = 'High';
        } else if (f.category === 'SOCIAL_ENGINEERING') {
          catKey = 'socialEngineering';
          catLabel = 'Social Engineering';
          categories.socialEngineering.count += 1;
          categories.socialEngineering.level = 'High';
        } else {
          categories.privacy.count += 1;
          categories.privacy.level = 'Medium';
        }

        return {
          id: `f-${i + 1}`,
          type: f.category,
          category: catKey,
          categoryLabel: catLabel,
          severity: f.category === 'CREDENTIAL' || f.category === 'FINANCIAL' ? 'High' : 'Medium',
          text: f.span,
          explanation: f.reason,
        };
      });

      const analysisResult = {
        id: scan.id,
        score: scan.riskScore,
        level: scan.riskLevel === 'CRITICAL' ? 'CRITICAL RISK' : `${scan.riskLevel} RISK`,
        issuesCount: findings.length,
        originalText: content,
        protectedText: scan.redactedText || content,
        findings,
        categories,
        actionTaken: scan.actionTaken,
        createdAt: scan.createdAt,
      };

      setCurrentAnalysis(analysisResult);
      // Immediately refresh user history so dashboard & history are updated
      await fetchScans();
      showToast('Security analysis completed successfully.', 'success');
      return analysisResult;
    } catch (err) {
      console.error('Analysis request error:', err);
      showToast(err.message || 'Analysis failed. Please try again.', 'error');
      setCurrentAnalysis(null);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Record scan decision via real PATCH /api/scans/:id/action
   */
  const recordDecision = async (actionType) => {
    if (!currentAnalysis?.id) return;

    try {
      await api.scans.updateAction(currentAnalysis.id, actionType);
      setCurrentAnalysis((prev) => (prev ? { ...prev, actionTaken: actionType } : null));
      if (actionType === 'USE_REDACTED' || actionType === 'protected') {
        showToast('Protected version selected', 'success');
      } else if (actionType === 'SEND_ANYWAY' || actionType === 'sent_anyway') {
        showToast('Marked as Send Anyway', 'warning');
      } else if (actionType === 'DISCARD' || actionType === 'discarded') {
        showToast('Marked as Discarded', 'info');
      }
      await fetchScans();
    } catch (err) {
      showToast(err.message || 'Failed to update scan action.', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        signup,
        login,
        logout,
        history,
        fetchScans,
        isLoadingScans,
        scansError,
        activeText,
        setActiveText,
        currentAnalysis,
        setCurrentAnalysis,
        isAnalyzing,
        performAnalysis,
        recordDecision,
        settings,
        setSettings,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
