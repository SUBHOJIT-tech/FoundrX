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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- IMPORTANT: API Keys (Keep these safe in a real project) ---
const GEMINI_API_KEY = 'AIzaSyAess2ePMCwpC1KMEtWYYRt6wl76H-rM9Y';
const ALPHA_VANTAGE_API_KEY = 'DNZ69Z27C64L5O0F';


// --- SVG Icons ---
const Logo = () => ( <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-400"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const StartupIcon = () => ( <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> );
const InvestmentIcon = () => ( <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> );

// --- Main App Component ---
export default function App() {
  const [activeTool, setActiveTool] = useState('startup');

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <nav className="bg-gray-800 p-4 flex justify-center items-center space-x-2 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center absolute left-4">
           <Logo/>
           <span className="text-xl font-bold ml-2 text-blue-400">FounderX</span>
        </div>
        <button onClick={() => setActiveTool('startup')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition ${activeTool === 'startup' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
          <StartupIcon /> Startup Advisor
        </button>
        <button onClick={() => setActiveTool('investment')} className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition ${activeTool === 'investment' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
          <InvestmentIcon /> Investment Advisor
        </button>
      </nav>
      {activeTool === 'startup' ? <StartupDashboard /> : <InvestmentAdvisor />}
    </div>
  );
}


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
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.note || !data.top_gainers) {
                console.warn("Alpha Vantage stock API limit reached or invalid response.");
                return "Stock data not available at the moment (API limit may be reached).";
            }
            return data.top_gainers.slice(0, 5).map(stock => 
                `Ticker: ${stock.ticker}, Price: ${stock.price}, Change: ${stock.change_percentage}`
            ).join('; ');
        } catch (err) {
            console.error("Alpha Vantage Stock API Error:", err);
            throw new Error("Could not fetch stock data.");
        }
    };
    
    const fetchCryptoData = async () => {
        setLoadingMessage('Fetching latest cryptocurrency data...');
        const majorCryptos = ['BTC', 'ETH', 'SOL'];
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
            } catch (err) {
                 console.error(`Alpha Vantage Crypto API Error for ${crypto}:`, err);
            }
        }
        return cryptoStrings.join('; ');
    };

    const parseAIResponse = (responseText) => {
        const sections = { stocks: [], crypto: [] };
        let currentSection = null;
        responseText.split('\n').forEach(line => {
            if (line.startsWith('**Stocks')) currentSection = 'stocks';
            else if (line.startsWith('**Cryptocurrency')) currentSection = 'crypto';
            else if (line.startsWith('* **') && currentSection) {
                const match = line.match(/\* \*\*(.*?):\*\* (.*)/);
                if (match) sections[currentSection].push({ name: match[1], reason: match[2] });
            }
        });
        return sections;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuggestions(null);

        if (GEMINI_API_KEY === 'PASTE_YOUR_GEMINI_API_KEY_HERE' || ALPHA_VANTAGE_API_KEY === 'PASTE_YOUR_ALPHA_VANTAGE_API_KEY_HERE') {
            setError("Error: One or more API keys are not set. Please add them to the App.jsx file.");
            setIsLoading(false);
            return;
        }

        try {
            const stockData = await fetchStockData();
            const cryptoData = await fetchCryptoData();

            setLoadingMessage('Asking AI to analyze market data...');
            const systemPrompt = "You are an expert financial analyst. Based on the real-time market data provided, and considering the user's profile, suggest the top 2-3 stocks and top 2-3 cryptocurrencies. Provide a brief justification for each choice. Format your response using Markdown with two sections: '**Stocks**' and '**Cryptocurrency**'. List items in the format '* **Ticker/Name:** Justification.'";
            const userQuery = `USER PROFILE: Budget $${budget}, Time Period: ${period}, Risk Tolerance: ${risk}. --- REAL-TIME DATA: Top Gaining Stocks Today: [${stockData}]. Major Cryptocurrencies: [${cryptoData}]. --- Please provide your analysis and recommendations.`;
            
            const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
            const payload = { contents: [{ parts: [{ text: userQuery }] }], systemInstruction: { parts: [{ text: systemPrompt }] } };
            const response = await fetch(geminiApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            
            if (!response.ok) throw new Error(`AI API Error: Status ${response.status}`);
            
            const data = await response.json();
            const responseText = data.candidates[0].content.parts[0].text;
            setSuggestions(parseAIResponse(responseText));

        } catch (err) {
            console.error("Error during investment suggestion process:", err);
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
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Budget (USD)</label>
                        <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Time Period</label>
                        <select value={period} onChange={e => setPeriod(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2">
                            <option>3 months</option><option>6 months</option><option>1 year</option><option>3+ years</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Risk Tolerance</label>
                        <select value={risk} onChange={e => setRisk(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2">
                            <option>Low</option><option>Moderate</option><option>High</option>
                        </select>
                    </div>
                    <button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md h-10 transition disabled:bg-gray-500">
                        {isLoading ? 'Processing...' : 'Get Suggestions'}
                    </button>
                </form>
            </div>

            {error && <div className="bg-red-900 border-red-700 text-red-200 px-4 py-3 rounded-lg mb-8">{error}</div>}
            {isLoading && <div className="text-center"><p className="text-lg text-gray-400 animate-pulse">{loadingMessage}</p></div>}
            
            {suggestions && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-cyan-300">Stock Suggestions</h3>
                        <div className="space-y-4">
                           {suggestions.stocks.map((item, index) => (
                                <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-cyan-500">
                                    <h4 className="font-bold text-lg">{item.name}</h4>
                                    <p className="text-gray-400">{item.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-bold mb-4 text-amber-300">Cryptocurrency Suggestions</h3>
                        <div className="space-y-4">
                            {suggestions.crypto.map((item, index) => (
                                <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-amber-500">
                                    <h4 className="font-bold text-lg">{item.name}</h4>
                                    <p className="text-gray-400">{item.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Startup Dashboard Component (EDITED TO CONNECT TO YOUR BACKEND) ---
const StartupDashboard = () => {
    const [sector, setSector] = useState('AI');
    const [stage, setStage] = useState('Idea');
    const [recommendations, setRecommendations] = useState(null);
    const [trendData, setTrendData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const websocketRef = useRef(null);

    // This is your live backend URL from Render
    const API_URL = 'https://foundrx-backend.onrender.com';

    useEffect(() => {
        return () => { if (websocketRef.current) websocketRef.current.close(); };
    }, []);

    const fetchGraphDataFromAI = async (domain) => {
       if (GEMINI_API_KEY === 'PASTE_YOUR_GEMINI_API_KEY_HERE') {setError("Error: Gemini API key is not set."); return null;}
       const prompt = `Generate a JSON object for a market growth trend for a "${domain}" startup. The JSON must have "labels" (an array of 12 month strings, e.g., "Oct '24") and "values" (an array of 12 numbers between 20-100, showing a generally positive trend). Raw JSON only, no markdown.`;
       const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
       try {
           const response = await fetch(geminiApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
           if (!response.ok) {
               let errorDetails = `Status: ${response.status}.`;
               try {
                   const errorData = await response.json();
                   errorDetails += ` ${errorData.error.message}`;
               } catch (e) { errorDetails += " Could not parse error response."; }
               throw new Error(errorDetails);
           }
           const data = await response.json();
           const rawJson = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
           return JSON.parse(rawJson);
       } catch (err) { setError("Could not generate graph data from AI. " + err.message); return null; }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setRecommendations(null);
        setTrendData(null);
        if (websocketRef.current) websocketRef.current.close();

        try {
            // Fetch Recommendations from YOUR backend
            const recResponse = await fetch(`${API_URL}/predictions/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sector, stage }),
            });

            if (!recResponse.ok) {
                const errorText = await recResponse.text();
                throw new Error(`Failed to fetch recommendations. Server says: ${errorText}`);
            }
            
            const recData = await recResponse.json();
            setRecommendations(recData);

            if (recData && recData.length > 0) {
                const aiGraphData = await fetchGraphDataFromAI(recData[0].domain);
                if (aiGraphData) {
                    setTrendData(aiGraphData);
                }
            }
        } catch (err) {
            setError(err.message);
            console.error("API Error:", err);
        } finally {
            setIsLoading(false);
        }
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
                <div>
                    <h3 className="text-xl font-bold mb-4">Top Recommended Domain</h3>
                    {isLoading && !recommendations && <div className="bg-gray-800 p-4 rounded-lg animate-pulse h-20"></div>}
                    {recommendations && recommendations.map((rec, i) => <div key={i} className="bg-gray-800 p-4 rounded-lg mb-4"><h4 className="font-bold text-lg text-cyan-300">{rec.domain}</h4><p className="text-gray-400">{rec.description}</p></div>)}
                    {!isLoading && !recommendations && <p className="text-gray-500">Your recommendations will appear here.</p>}
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-4">Live Growth Trend</h3>
                    <div className="bg-gray-800 p-4 rounded-lg h-80 flex items-center justify-center">
                        {isLoading && !trendData && <p className="text-gray-500 animate-pulse">Generating AI chart...</p>}
                        {trendData ? <ChartComponent data={trendData} /> : !isLoading && <p className="text-gray-500">AI-generated market trend will appear here.</p>}
                    </div>
                </div>
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
        backgroundColor: (context) => { const ctx = context.chart.ctx; const g = ctx.createLinearGradient(0,0,0,200); g.addColorStop(0, "rgba(34,211,238,0.3)"); g.addColorStop(1, "rgba(34,211,238,0)"); return g; },
        tension: 0.4,
        fill: true,
        pointRadius: 2,
    }]
  };
  const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#9CA3AF'}, grid: {color: '#374151'} }, y: { ticks: { color: '#9CA3AF'}, grid: {color: '#374151'} } } };
  return <Line options={options} data={chartData} />;
};
