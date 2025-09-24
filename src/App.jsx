import React, { useState, useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { initializeApp } from "firebase/app";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from "firebase/auth";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- SECURE: API Keys are now loaded from environment variables ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

// --- Configuration Check ---
const isFirebaseConfigured = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("VITE_");

let auth;
if (isFirebaseConfigured) {
    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
    } catch (e) {
        console.error("Firebase initialization error:", e);
    }
}

// --- Toast Notification Component ---
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return <div className={`fixed bottom-5 right-5 ${bgColor} text-white py-2 px-4 rounded-lg shadow-lg animate-slide-in-right z-50`}>{message}</div>;
};

// --- SVG Icons ---
const Logo = () => ( <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-400"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const StartupIcon = () => ( <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> );
const InvestmentIcon = () => ( <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> );
const EyeOpenIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>);
const EyeClosedIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.9 4.24A9 9 0 0 1 12 3a9.9 9.9 0 0 1 8.4 5.29c-.3.84-.7 1.62-1.2 2.34l-1.6 1.6m-3.4-3.4.9-.9m-3.5 3.5-2 2-1.5 1.5c-1-1.3-1.5-2.8-1.5-4.3A9 9 0 0 1 9.9 4.24Z"/><path d="m2.5 2.5 19 19"/></svg>);

// --- Configuration Error Page ---
const ConfigurationErrorPage = () => (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-white p-4 text-center">
        <Logo />
        <h1 className="text-3xl font-bold text-red-500 mt-4">Configuration Error</h1>
        <p className="mt-2 text-gray-300 max-w-lg">Could not find API keys. Please ensure you have a `.env.local` file in your project's `frontend` directory with the necessary keys.</p>
    </div>
);

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  if (!isFirebaseConfigured) {
    return <ConfigurationErrorPage />;
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><p className="text-white text-xl">Loading FounderX...</p></div>;
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {!user
        ? <AuthPage showToast={showToast} />
        : <MainApp user={user} showToast={showToast} />
      }
    </>
  );
}

// ... (The rest of your components: AuthPage, Login, Signup, ForgotPassword, MainApp, etc. remain exactly the same) ...
// --- Auth Page Component ---
const AuthPage = ({ showToast }) => {
    const [authView, setAuthView] = useState('login');
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="flex items-center mb-6"><Logo /><h1 className="text-4xl font-bold ml-3 text-blue-400">FounderX</h1></div>
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-xl">
                {authView === 'login' && <Login setAuthView={setAuthView} showToast={showToast} />}
                {authView === 'signup' && <Signup setAuthView={setAuthView} showToast={showToast} />}
                {authView === 'forgotPassword' && <ForgotPassword setAuthView={setAuthView} showToast={showToast} />}
            </div>
        </div>
    );
};

// --- Login, Signup, ForgotPassword Components ---
const Login = ({ setAuthView, showToast }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const handleLogin = async (e) => { e.preventDefault(); try { await signInWithEmailAndPassword(auth, email, password); } catch (err) { showToast('Invalid email or password.', 'error'); } };
    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-white mb-6">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-gray-700 rounded text-white" required />
                <div className="relative"><input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-gray-700 rounded text-white" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400">{showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}</button></div>
                <button type="submit" className="w-full p-3 bg-blue-600 rounded text-white font-bold hover:bg-blue-700">Login</button>
            </form>
            <div className="text-center text-sm mt-4"><button onClick={() => setAuthView('forgotPassword')} className="text-blue-400 hover:underline">Forgot Password?</button></div>
            <p className="text-center text-gray-400 mt-4">Don't have an account? <button onClick={() => setAuthView('signup')} className="text-blue-400 hover:underline">Sign up</button></p>
        </div>
    );
};

const Signup = ({ setAuthView, showToast }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const handleSignup = async (e) => { e.preventDefault(); try { await createUserWithEmailAndPassword(auth, email, password); showToast('Account created successfully! Please log in.', 'success'); setAuthView('login'); } catch (err) { if (err.code === 'auth/email-already-in-use') showToast('This email is already in use.', 'error'); else if (err.code === 'auth/weak-password') showToast('Password must be at least 6 characters.', 'error'); else showToast('An error occurred. Please try again.', 'error'); } };
    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-white mb-6">Create Account</h2>
            <form onSubmit={handleSignup} className="space-y-4">
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-gray-700 rounded text-white" required />
                <div className="relative"><input type={showPassword ? "text" : "password"} placeholder="Password (min. 6 characters)" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-gray-700 rounded text-white" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400">{showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}</button></div>
                <button type="submit" className="w-full p-3 bg-blue-600 rounded text-white font-bold hover:bg-blue-700">Sign Up</button>
            </form>
            <p className="text-center text-gray-400 mt-4">Already have an account? <button onClick={() => setAuthView('login')} className="text-blue-400 hover:underline">Login</button></p>
        </div>
    );
};

const ForgotPassword = ({ setAuthView, showToast }) => {
    const [email, setEmail] = useState('');
    const handleReset = async (e) => { e.preventDefault(); try { await sendPasswordResetEmail(auth, email); showToast('Password reset email sent! Check your inbox.', 'success'); setAuthView('login'); } catch (err) { showToast('Could not send reset email. Please check the address.', 'error'); } };
    return (
       <div>
            <h2 className="text-2xl font-bold text-center text-white mb-6">Reset Password</h2>
            <form onSubmit={handleReset} className="space-y-4">
                <p className="text-sm text-gray-400 text-center">Enter your email address and we will send you a link to reset your password.</p>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-gray-700 rounded text-white" required />
                <button type="submit" className="w-full p-3 bg-blue-600 rounded text-white font-bold hover:bg-blue-700">Send Reset Link</button>
            </form>
            <p className="text-center text-gray-400 mt-4"><button onClick={() => setAuthView('login')} className="text-blue-400 hover:underline">Back to Login</button></p>
        </div>
    );
};

// --- Main Application Component (for logged-in users) ---
const MainApp = ({ user, showToast }) => {
  const [activeTool, setActiveTool] = useState('startup');
  const handleLogout = async () => { try { await signOut(auth); showToast('You have been logged out.', 'success'); } catch (error) { showToast('Error logging out.', 'error'); } };
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <nav className="bg-gray-800 p-4 flex justify-center items-center space-x-2 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center absolute left-4"><Logo/><span className="text-xl font-bold ml-2 text-blue-400">FounderX</span></div>
        <button onClick={() => setActiveTool('startup')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition ${activeTool === 'startup' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}><StartupIcon /> Startup Advisor</button>
        <button onClick={() => setActiveTool('investment')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition ${activeTool === 'investment' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}><InvestmentIcon /> Investment Advisor</button>
        <div className="flex items-center absolute right-4">
            <span className="text-gray-300 text-sm mr-4 hidden md:block">{user.email}</span>
            <button onClick={handleLogout} className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">Logout</button>
        </div>
      </nav>
      {activeTool === 'startup' ? <StartupDashboard /> : <InvestmentAdvisor />}
    </div>
  );
};

// --- Investment Advisor Component ---
const InvestmentAdvisor = () => {
    const [budget, setBudget] = useState('10000');
    const [period, setPeriod] = useState('6 months');
    const [risk, setRisk] = useState('Moderate');
    const [suggestions, setSuggestions] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState('');

    const fetchStockData = async () => {
        setLoadingMessage('Fetching real-time stock market data...');
        const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.note || !data.top_gainers) {
            console.warn("Alpha Vantage stock API limit reached or invalid response.");
            return "Stock data not available (API limit may be reached).";
        }
        return data.top_gainers.slice(0, 10).map(stock => `Ticker: ${stock.ticker}, Price: ${stock.price}, Change: ${stock.change_percentage}`).join('; ');
    };

    const fetchCryptoData = async () => {
        setLoadingMessage('Fetching latest cryptocurrency data...');
        const majorCryptos = ['BTC', 'ETH', 'SOL', 'DOGE'];
        let cryptoStrings = [];
        for (const crypto of majorCryptos) {
            const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${crypto}&to_currency=USD&apikey=${ALPHA_VANTAGE_API_KEY}`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                if (data.note || !data['Realtime Currency Exchange Rate']) {
                    console.warn(`Alpha Vantage crypto API limit reached for ${crypto}.`);
                    continue;
                }
                const details = data['Realtime Currency Exchange Rate'];
                cryptoStrings.push(`${details['2. From_Currency Name']}: Price $${parseFloat(details['5. Exchange Rate']).toFixed(2)}`);
            } catch (e) {
                console.error(`Failed to fetch ${crypto}`);
            }
        }
        return cryptoStrings.join('; ');
    };

    const parseAIResponse = (responseText) => {
        const sections = { stocks: [], crypto: [] };
        let currentSection = null;
        responseText.split('\n').forEach(line => {
            if (line.toLowerCase().includes('**stock')) currentSection = 'stocks';
            else if (line.toLowerCase().includes('**crypto')) currentSection = 'crypto';
            else if (line.startsWith('*') && currentSection) {
                let match = line.match(/\* \*\*(.*?):\*\*\s?(.*)/);
                if (match) {
                    sections[currentSection].push({ name: match[1].trim(), reason: match[2].trim() });
                } else {
                    match = line.match(/\*\s(.*?):\s?(.*)/);
                    if (match) {
                        sections[currentSection].push({ name: match[1].replace(/\*\*/g, '').trim(), reason: match[2].trim() });
                    }
                }
            }
        });
        return sections;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuggestions(null);
        try {
            const stockData = await fetchStockData();
            const cryptoData = await fetchCryptoData();
            setLoadingMessage('Asking AI to analyze market data...');
            const systemPrompt = `You are a sharp financial analyst. Your recommendations must be directly influenced by the user's profile and the provided real-time data. YOU MUST FOLLOW THE FORMATTING INSTRUCTIONS EXACTLY. Do not add any introduction or conclusion.

    **FORMATTING RULES:**
    - Create two sections: '**Stocks**' and '**Cryptocurrency**'.
    - Under each section, list 2-3 items.
    - Each item must be a bullet point starting with '*'.
    - The name/ticker MUST be bolded.
    - The final output for each item MUST look like this example:
      * **AAPL:** With your moderate risk tolerance, Apple offers stability...

    FAILURE TO FOLLOW THIS FORMAT WILL RESULT IN AN ERROR.`;
            const userQuery = `**User Profile:** - Budget: $${budget} USD, Time: ${period}, Risk: ${risk}. **Real-Time Data:** - Stocks: [${stockData}], Crypto: [${cryptoData}]. Based only on this, provide a concise, actionable investment plan explicitly referencing the user's profile in your justification.`;
            const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { temperature: 0.8 }
            };
            const response = await fetch(geminiApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`AI API Error: Status ${response.status}`);
            const data = await response.json();
            const responseText = data.candidates[0].content.parts[0].text;
            setSuggestions(parseAIResponse(responseText));
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto animate-fade-in">
             <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-8">
                <h2 className="text-2xl font-bold mb-4 text-blue-300">AI Investment Advisor</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Budget (USD)</label><input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2" /></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Time Period</label><select value={period} onChange={e => setPeriod(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2"><option>3 months</option><option>6 months</option><option>1 year</option><option>3+ years</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Risk Tolerance</label><select value={risk} onChange={e => setRisk(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2"><option>Low</option><option>Moderate</option><option>High</option></select></div>
                    <button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md h-10 transition disabled:bg-gray-500">{isLoading ? 'Processing...' : 'Get Suggestions'}</button>
                </form>
            </div>
            {error && <div className="bg-red-900 border-red-700 text-red-200 px-4 py-3 rounded-lg mb-8">{error}</div>}
            {isLoading && <div className="text-center"><p className="text-lg text-gray-400 animate-pulse">{loadingMessage}</p></div>}
            {suggestions && (<div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in"><div><h3 className="text-xl font-bold mb-4 text-cyan-300">Stock Suggestions</h3><div className="space-y-4">{suggestions.stocks.map((item, index) => (<div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-cyan-500"><h4 className="font-bold text-lg">{item.name}</h4><p className="text-gray-400">{item.reason}</p></div>))}</div></div><div><h3 className="text-xl font-bold mb-4 text-amber-300">Cryptocurrency Suggestions</h3><div className="space-y-4">{suggestions.crypto.map((item, index) => (<div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-amber-500"><h4 className="font-bold text-lg">{item.name}</h4><p className="text-gray-400">{item.reason}</p></div>))}</div></div></div>)}
        </div>
    );
};

// --- Startup Dashboard Component ---
const StartupDashboard = () => {
    const [sector, setSector] = useState('AI');
    const [stage, setStage] = useState('Idea');
    const [recommendations, setRecommendations] = useState(null);
    const [trendData, setTrendData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const simulationIntervalRef = useRef(null);

    useEffect(() => {
        return () => { if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current); };
    }, []);

    const fetchGraphDataFromAI = async (domain) => {
        const prompt = `Generate a plausible JSON object for a market growth trend for a "${domain}" startup. The trend should reflect a recent (hypothetical) market event. The JSON must have "labels" (12 months, e.g., "Oct '25") and "values" (12 numbers between 20-100). The data must be different each time this prompt is run. Raw JSON only.`;
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
        try {
            const response = await fetch(geminiApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.9 }
                })
            });
            if (!response.ok) throw new Error(`AI API Error: Status ${response.status}`);
            const data = await response.json();
            const rawJson = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
            return JSON.parse(rawJson);
        } catch (err) {
            setError("Could not generate graph data from AI. " + err.message);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setRecommendations(null);
        setTrendData(null);
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        const mockRecs = {
            AI: [{ domain: "AI-Powered Logistics", description: "Optimizing supply chains." }],
            Fintech: [{ domain: "DeFi Lending", description: "Peer-to-peer lending." }],
            HealthTech: [{ domain: "Telemedicine", description: "Remote patient care." }],
            Logistics: [{ domain: "Delivery Drones", description: "Automated delivery." }]
        };
        const recData = mockRecs[sector];
        setRecommendations(recData);
        if (recData.length > 0) {
            const aiGraphData = await fetchGraphDataFromAI(recData[0].domain);
            if (aiGraphData) {
                setTrendData(aiGraphData);
                simulationIntervalRef.current = setInterval(() => {
                    setTrendData(currentData => {
                        if (!currentData) return null;
                        const newValues = [...currentData.values];
                        newValues.push(Math.max(0, newValues[newValues.length - 1] + (Math.random() * 4 - 1.8)));
                        const newLabels = [...currentData.labels];
                        newLabels.push(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                        if (newValues.length > 20) {
                            newValues.shift();
                            newLabels.shift();
                        }
                        return { labels: newLabels, values: newValues };
                    });
                }, 2500);
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
             <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-8">
                <h2 className="text-2xl font-bold mb-4 text-cyan-300">Startup Domain Advisor</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Sector</label><select value={sector} onChange={e => setSector(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2"><option>AI</option><option>Fintech</option><option>HealthTech</option><option>Logistics</option></select></div>
                    <div><label className="block text-sm font-medium text-gray-300 mb-1">Stage</label><select value={stage} onChange={e => setStage(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2"><option>Idea</option><option>Pre-Seed</option><option>Seed</option></select></div>
                    <button type="submit" disabled={isLoading} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-md h-10">{isLoading ? 'Analyzing...' : 'Get Recommendations'}</button>
                </form>
            </div>
             {error && <div className="bg-red-900 text-red-200 p-3 rounded-lg mb-8">{error}</div>}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div><h3 className="text-xl font-bold mb-4">Top Recommended Domain</h3>{isLoading && <div className="bg-gray-800 p-4 rounded-lg animate-pulse h-20"></div>}{recommendations && recommendations.map((rec, i) => <div key={i} className="bg-gray-800 p-4 rounded-lg"><h4 className="font-bold text-lg text-cyan-300">{rec.domain}</h4><p className="text-gray-400">{rec.description}</p></div>)}</div>
                <div><h3 className="text-xl font-bold mb-4">Live Growth Trend</h3><div className="bg-gray-800 p-4 rounded-lg h-80 flex items-center justify-center">{isLoading && !trendData && <p className="text-gray-500">Generating AI chart...</p>}{trendData ? <ChartComponent data={trendData} /> : !isLoading && <p className="text-gray-500">AI-generated market trend will appear here.</p>}</div></div>
             </div>
        </div>
    );
};

// --- Chart Component ---
const ChartComponent = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [{
        label: 'Market Growth Index',
        data: data.values,
        borderColor: 'rgb(34, 211, 238)',
        backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const g = ctx.createLinearGradient(0, 0, 0, 200);
            g.addColorStop(0, "rgba(34,211,238,0.3)");
            g.addColorStop(1, "rgba(34,211,238,0)");
            return g;
        },
        tension: 0.4,
        fill: true,
        pointRadius: 2,
    }]
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: { ticks: { color: '#9CA3AF' }, grid: { color: '#374151' } },
        y: { ticks: { color: '#9CA3AF' }, grid: { color: '#374151' } }
    }
  };
  return <Line options={options} data={chartData} />;
};
