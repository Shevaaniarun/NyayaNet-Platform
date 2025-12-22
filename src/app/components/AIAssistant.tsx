/**
 * AIAssistant - Legal Intelligence Assistant Interface
 * AI-powered analysis for consumer law cases with prediction and precedent retrieval
 */

import { Brain, Edit, Scale, FileText, TrendingUp, Search } from 'lucide-react';
import { useState } from 'react';

export function AIAssistant() {
  const [caseInput, setCaseInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const handleAnalyze = () => {
    // Mock analysis - in real app would call AI API
    setAnalysisResult('Analysis in progress...');
    setTimeout(() => {
      setAnalysisResult(
        'Based on the case facts provided, the AI predicts a 72% likelihood of favorable outcome. Relevant precedents: Consumer Protection Act 2019, Section 2(7) - Deficiency in Service.'
      );
    }, 1500);
  };

  const handleClear = () => {
    setCaseInput('');
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-justice-black">
      {/* Hero Section */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c0a068' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px',
            }}
          ></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-8 py-16">
          <div className="text-center">
            {/* Animated Scale Icon */}
            <div className="w-24 h-24 mx-auto mb-8 relative">
              <div className="absolute inset-0 border-2 border-constitution-gold rounded-full animate-ping opacity-20"></div>
              <div className="w-full h-full border-2 border-constitution-gold rounded-full flex items-center justify-center">
                <Brain className="w-12 h-12 text-constitution-gold" />
              </div>
            </div>

            <h1 className="font-heading font-bold text-judge-ivory mb-4" style={{ fontSize: '3rem' }}>
              Legal Intelligence Assistant
            </h1>
            <p className="text-constitution-gold/80 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: '1.25rem' }}>
              AI-powered analysis for consumer law cases. Predict outcomes and retrieve relevant precedents with judicial accuracy.
            </p>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="max-w-4xl mx-auto px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="aged-paper rounded-xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-constitution-gold/10 border border-constitution-gold/30 flex items-center justify-center mr-4">
                <Edit className="w-5 h-5 text-constitution-gold" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-ink-gray">Case Input</h2>
                <p className="text-ink-gray/60" style={{ fontSize: '0.875rem' }}>Describe your consumer law case</p>
              </div>
            </div>

            <textarea
              className="w-full h-64 parchment-bg border border-constitution-gold/30 rounded-lg p-6 text-ink-gray font-body focus:outline-none focus:border-constitution-gold resize-none"
              placeholder="Enter case facts, issues, and relevant details for AI analysis..."
              value={caseInput}
              onChange={(e) => setCaseInput(e.target.value)}
            />

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleClear}
                className="px-6 py-3 border-2 border-constitution-gold text-constitution-gold rounded-lg font-bold tracking-wide hover:bg-constitution-gold/5 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleAnalyze}
                disabled={!caseInput.trim()}
                className="px-6 py-3 bg-constitution-gold text-justice-black rounded-lg font-bold tracking-wide hover:bg-constitution-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analyze Case
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="aged-paper rounded-xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-constitution-gold/10 border border-constitution-gold/30 flex items-center justify-center mr-4">
                <Scale className="w-5 h-5 text-constitution-gold" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-ink-gray">AI Analysis</h2>
                <p className="text-ink-gray/60" style={{ fontSize: '0.875rem' }}>Prediction & Precedent Results</p>
              </div>
            </div>

            {/* Result Display */}
            {analysisResult ? (
              <div className="parchment-bg rounded-lg p-6 border border-constitution-gold/20">
                <div className="flex items-start space-x-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-constitution-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading font-bold text-ink-gray mb-2">Analysis Results</h3>
                    <p className="text-ink-gray/80 leading-relaxed font-body">
                      {analysisResult}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-constitution-gold/20">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-gray/60" style={{ fontSize: '0.875rem' }}>Confidence Score</span>
                    <span className="font-heading font-bold text-constitution-gold">72%</span>
                  </div>
                  <div className="mt-2 h-2 bg-constitution-gold/10 rounded-full overflow-hidden">
                    <div className="h-full bg-constitution-gold rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="parchment-bg rounded-lg p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 border-2 border-dashed border-constitution-gold/30 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-constitution-gold/30" />
                </div>
                <h3 className="font-bold text-ink-gray/50 mb-2">
                  Analysis Results Will Appear Here
                </h3>
                <p className="text-ink-gray/40" style={{ fontSize: '0.875rem' }}>
                  Submit a case description to view AI predictions and relevant precedents
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mt-8">
          <div className="flex justify-center space-x-4">
            <button className="px-8 py-4 bg-constitution-gold text-justice-black rounded-lg font-bold tracking-wide flex items-center space-x-3 hover:bg-constitution-gold/90 transition-colors">
              <TrendingUp className="w-5 h-5" />
              <span>Predict Outcome</span>
            </button>
            <button className="px-8 py-4 border-2 border-constitution-gold text-constitution-gold rounded-lg font-bold tracking-wide flex items-center space-x-3 hover:bg-constitution-gold/5 transition-colors">
              <Search className="w-5 h-5" />
              <span>Find Precedents</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
