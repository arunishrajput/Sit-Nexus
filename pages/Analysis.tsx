
import React, { useState, useEffect } from 'react';
import { User, BehaviorAnalysisResult, ActivityLog } from '../types';
import { StorageService } from '../services/storage';
import { GeminiService } from '../services/gemini';
import { Button, Card, Badge } from '../components/ui';
import { Brain, Sparkles, TrendingUp, MapPin, Zap, Activity, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnalysisProps {
  currentUser: User;
}

export const Analysis: React.FC<AnalysisProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BehaviorAnalysisResult | null>(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const checkData = async () => {
        const logs = await StorageService.getUserActivityLogs(currentUser.id);
        setHasData(logs.length > 5);
    };
    checkData();
  }, [currentUser.id]);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const logs = await StorageService.getUserActivityLogs(currentUser.id);
      if (logs.length < 5) {
         alert("Not enough data yet! Try using the app more or inject Demo Data in Admin.");
         setLoading(false);
         return;
      }
      const analysis = await GeminiService.analyzeBehavior(currentUser, logs);
      setResult(analysis);
    } catch (e) {
      alert("AI Analysis failed. Please try again.");
    }
    setLoading(false);
  };

  const goToAdmin = () => navigate('/admin');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <Brain className="text-purple-500" /> Behavior Analyzer
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2">
          Let AI analyze your digital footprint on campus and reveal your true persona.
        </p>
      </div>

      {!result && (
        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 transition-all">
           <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 animate-pulse">
             <Activity size={40} />
           </div>
           <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to Decode Your Vibe?</h2>
           <p className="text-gray-500 dark:text-slate-400 mb-6 text-center max-w-md">
             We will analyze your chat patterns, mood swings, location history, and quest data to generate a fun profile.
           </p>
           
           <div className="flex gap-4">
             <Button onClick={handleAnalyze} isLoading={loading} disabled={!hasData && !loading} className="px-8 py-3 bg-purple-600 hover:bg-purple-700">
               {loading ? 'Crunching Data...' : 'Generate Analysis'}
             </Button>
           </div>
           
           {!hasData && (
              <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center gap-3 text-indigo-800 dark:text-indigo-300 max-w-sm">
                <Database className="shrink-0" size={20} />
                <div className="text-left text-sm">
                   <p className="font-bold">Not enough history?</p>
                   <p className="mb-2">Inject dummy data to test this feature instantly.</p>
                   <button onClick={goToAdmin} className="underline font-bold hover:text-indigo-600 dark:hover:text-indigo-200">Go to Admin Tools</button>
                </div>
              </div>
           )}
        </div>
      )}

      {result && (
        <div className="animate-reveal space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white text-center shadow-lg relative overflow-hidden">
             <Sparkles className="absolute top-4 right-4 text-purple-300 opacity-50" size={48} />
             <p className="text-purple-200 font-medium tracking-widest text-sm uppercase mb-2">Your Campus Persona</p>
             <h2 className="text-4xl md:text-5xl font-extrabold mb-4">{result.personalityTitle}</h2>
             <p className="text-lg text-purple-100 max-w-2xl mx-auto leading-relaxed">
               {result.summary}
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Radar Chart Visualizer */}
            <Card className="flex flex-col items-center justify-center min-h-[300px]">
               <h3 className="font-bold text-gray-900 dark:text-white mb-6">Vibe Radar</h3>
               <RadarChart data={result.radarChart} />
            </Card>

            {/* Insights */}
            <Card title="Key Insights">
               <ul className="space-y-4">
                 {result.insights.map((insight, i) => (
                   <li key={i} className="flex gap-3 text-gray-700 dark:text-slate-300">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                        {i + 1}
                      </span>
                      <span>{insight}</span>
                   </li>
                 ))}
               </ul>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Predictions */}
             <Card className="bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800">
                <div className="flex items-center gap-2 mb-4 text-indigo-700 dark:text-indigo-400">
                   <TrendingUp size={20} />
                   <h3 className="font-bold">Future Forecast</h3>
                </div>
                <div className="space-y-4">
                   <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-bold">Predicted Next Mood</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{result.predictions.nextMood}</p>
                   </div>
                   <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 uppercase font-bold">Likely Next Activity</p>
                      <p className="text-lg text-gray-800 dark:text-slate-200">{result.predictions.likelyMeetup}</p>
                   </div>
                </div>
             </Card>

             {/* Recommendations */}
             <Card className="bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800">
                <div className="flex items-center gap-2 mb-4 text-green-700 dark:text-green-400">
                   <MapPin size={20} />
                   <h3 className="font-bold">Recommended Spots</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                   {result.recommendedSpots.map(spot => (
                      <Badge key={spot} color="bg-white dark:bg-slate-800 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900 py-2 px-4 text-sm">
                        {spot}
                      </Badge>
                   ))}
                </div>
                <p className="text-sm text-green-600 dark:text-green-500 mt-4">
                  Based on your current energy levels and past preferences.
                </p>
             </Card>
          </div>
          
          <div className="text-center pb-8">
             <Button variant="outline" onClick={handleAnalyze}>Regenerate Analysis</Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple SVG Radar Chart Component
const RadarChart = ({ data }: { data: BehaviorAnalysisResult['radarChart'] }) => {
  const size = 200;
  const center = size / 2;
  const radius = 80;
  
  // Normalize 0-100 to radius
  const normalize = (val: number) => (val / 100) * radius;

  // 5 points for pentagon
  const keys = ['social', 'stability', 'chaos', 'exploration', 'energy'];
  const angleSlice = (Math.PI * 2) / 5;

  // Calculate points
  const points = keys.map((key, i) => {
    const val = normalize((data as any)[key]);
    const angle = i * angleSlice - Math.PI / 2; // Start from top
    return {
      x: center + val * Math.cos(angle),
      y: center + val * Math.sin(angle)
    };
  });

  const pathData = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x},${p.y}`).join(' ') + 'Z';

  // Background Grid (3 levels)
  const levels = [0.33, 0.66, 1];
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {/* Grid Lines */}
      {levels.map((level, lvlIdx) => (
         <polygon 
           key={lvlIdx}
           points={keys.map((_, i) => {
             const r = radius * level;
             const angle = i * angleSlice - Math.PI / 2;
             return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
           }).join(' ')}
           fill="none"
           stroke="currentColor"
           className="text-gray-200 dark:text-slate-700"
           strokeWidth="1"
         />
      ))}
      
      {/* Axis Lines */}
      {keys.map((_, i) => {
          const angle = i * angleSlice - Math.PI / 2;
          return (
            <line 
              key={i}
              x1={center} y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke="currentColor"
              className="text-gray-200 dark:text-slate-700"
            />
          );
      })}

      {/* Data Shape */}
      <path d={pathData} fill="rgba(147, 51, 234, 0.2)" stroke="#9333ea" strokeWidth="2" />
      
      {/* Labels */}
      {keys.map((key, i) => {
         const angle = i * angleSlice - Math.PI / 2;
         const labelRadius = radius + 20;
         const x = center + labelRadius * Math.cos(angle);
         const y = center + labelRadius * Math.sin(angle);
         return (
           <text 
             key={key} 
             x={x} 
             y={y} 
             textAnchor="middle" 
             dominantBaseline="middle" 
             className="text-[10px] uppercase font-bold fill-gray-500 dark:fill-slate-400"
           >
             {key}
           </text>
         );
      })}
    </svg>
  );
};
