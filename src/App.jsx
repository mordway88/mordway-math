import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, ArrowRight, Undo2 } from 'lucide-react';

// 10 Brand New Problems
const problems = [
  {
    id: 1, a: 2, b: 4, c: 8, op: '>=',
    ansSlope: -0.5, ansSlopeStr: '-1/2', ansYInt: 2, ansFlip: 'no', ansFinalOp: '>=', ansLine: 'solid', ansShade: 'above'
  },
  {
    id: 2, a: 1, b: -3, c: 6, op: '<',
    ansSlope: 1/3, ansSlopeStr: '1/3', ansYInt: -2, ansFlip: 'yes', ansFinalOp: '>', ansLine: 'dashed', ansShade: 'above'
  },
  {
    id: 3, a: -4, b: 2, c: -6, op: '<=',
    ansSlope: 2, ansSlopeStr: '2', ansYInt: -3, ansFlip: 'no', ansFinalOp: '<=', ansLine: 'solid', ansShade: 'below'
  },
  {
    id: 4, a: 5, b: -1, c: -2, op: '>',
    ansSlope: 5, ansSlopeStr: '5', ansYInt: 2, ansFlip: 'yes', ansFinalOp: '<', ansLine: 'dashed', ansShade: 'below'
  },
  {
    id: 5, a: -3, b: -2, c: 4, op: '>=',
    ansSlope: -1.5, ansSlopeStr: '-3/2', ansYInt: -2, ansFlip: 'yes', ansFinalOp: '<=', ansLine: 'solid', ansShade: 'below'
  },
  {
    id: 6, a: 1, b: 1, c: 5, op: '<',
    ansSlope: -1, ansSlopeStr: '-1', ansYInt: 5, ansFlip: 'no', ansFinalOp: '<', ansLine: 'dashed', ansShade: 'below'
  },
  {
    id: 7, a: -2, b: 1, c: -3, op: '>=',
    ansSlope: 2, ansSlopeStr: '2', ansYInt: -3, ansFlip: 'no', ansFinalOp: '>=', ansLine: 'solid', ansShade: 'above'
  },
  {
    id: 8, a: 6, b: -3, c: 9, op: '<',
    ansSlope: 2, ansSlopeStr: '2', ansYInt: -3, ansFlip: 'yes', ansFinalOp: '>', ansLine: 'dashed', ansShade: 'above'
  },
  {
    id: 9, a: -1, b: -4, c: 8, op: '<=',
    ansSlope: -0.25, ansSlopeStr: '-1/4', ansYInt: -2, ansFlip: 'yes', ansFinalOp: '>=', ansLine: 'solid', ansShade: 'above'
  },
  {
    id: 10, a: 3, b: 2, c: 4, op: '>',
    ansSlope: -1.5, ansSlopeStr: '-3/2', ansYInt: 2, ansFlip: 'no', ansFinalOp: '>', ansLine: 'dashed', ansShade: 'above'
  }
];

const parseFraction = (val) => {
  if (!val) return NaN;
  const str = val.toString().trim();
  if (str.includes('/')) {
    const [num, den] = str.split('/');
    return parseFloat(num) / parseFloat(den);
  }
  return parseFloat(str);
};

const formatTerm = (coef, varName, showPlusIfPositive = false) => {
  if (coef === 0) return '';
  let term = '';
  if (coef === 1) term = varName;
  else if (coef === -1) term = '-' + varName;
  else term = coef + varName;

  if (showPlusIfPositive && coef > 0) return '+ ' + term;
  if (showPlusIfPositive && coef < 0) return '- ' + term.substring(1);
  return term;
};

const formatOp = (op) => op === '<=' ? '≤' : op === '>=' ? '≥' : op;

const renderFractionX = (slopeStr) => {
  if (slopeStr === '1') return <span>x</span>;
  if (slopeStr === '-1') return <span>-x</span>;
  if (!slopeStr?.includes('/')) return <span>{slopeStr}x</span>;

  const isNegative = slopeStr.startsWith('-');
  const cleanStr = slopeStr.replace('-', '');
  const [num, den] = cleanStr.split('/');

  return (
    <span className="inline-flex items-center">
      {isNegative && <span className="mr-1">-</span>}
      <span className="inline-flex flex-col items-center justify-center text-[0.8em] mx-[2px]">
        <span className="border-b-[2px] border-gray-800 px-[4px] w-full text-center pb-[2px] leading-none">{num}</span>
        <span className="px-[4px] pt-[2px] leading-none">{den}</span>
      </span>
      <span className="ml-[2px]">x</span>
    </span>
  );
};

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const problem = problems[currentIndex];

  // Phase 1: Algebra State (Updated for Vertical Flow)
  const [algInputs, setAlgInputs] = useState({ 
    step1Left: '', step1Right: '', 
    div1: '', div2: '', div3: '', 
    flip: '', finalOp: '' 
  });
  const [algStep, setAlgStep] = useState(1);
  const [algStatuses, setAlgStatuses] = useState({ step1: 'idle', step2: 'idle', step3: 'idle' });
  
  // Phase 2: Properties State
  const [propInputs, setPropInputs] = useState({ yInt: '', slope: '', line: '', shade: '' });
  const [propStatus, setPropStatus] = useState('idle');

  // Phase 3: Graph State
  const [graphPoints, setGraphPoints] = useState([]);
  const [graphStatus, setGraphStatus] = useState('idle');

  const [phase, setPhase] = useState(1);

  // Reset state when problem changes
  useEffect(() => {
    setAlgInputs({ step1Left: '', step1Right: '', div1: '', div2: '', div3: '', flip: '', finalOp: '' });
    setAlgStep(1);
    setAlgStatuses({ step1: 'idle', step2: 'idle', step3: 'idle' });
    setPropInputs({ yInt: '', slope: '', line: '', shade: '' });
    setPropStatus('idle');
    setGraphPoints([]);
    setGraphStatus('idle');
    setPhase(1);
  }, [currentIndex]);

  const handleAlgChange = (field, value) => {
    setAlgInputs(prev => ({ ...prev, [field]: value }));
    if (algStep === 1) setAlgStatuses(prev => ({...prev, step1: 'idle'}));
    if (algStep === 2) setAlgStatuses(prev => ({...prev, step2: 'idle'}));
    if (algStep === 3) setAlgStatuses(prev => ({...prev, step3: 'idle'}));
  };

  const checkAlgStep1 = () => {
    const normalize = (str) => str.replace(/\s+/g, '').toLowerCase();
    const s1L = normalize(algInputs.step1Left);
    const s1R = normalize(algInputs.step1Right);

    const aInv = -problem.a;
    const expected1 = aInv === 1 ? 'x' : aInv === -1 ? '-x' : `${aInv}x`;
    const expected1Alt = aInv === 1 ? '+1x' : aInv === -1 ? '-1x' : aInv > 0 ? `+${aInv}x` : `${aInv}x`;
    const expected1Alt2 = aInv > 0 ? `${aInv}x` : expected1;
    const expected1Alt3 = `+${expected1}`;

    const validAnswers = [expected1, expected1Alt, expected1Alt2, expected1Alt3];
    const isStep1LCorrect = validAnswers.includes(s1L);
    const isStep1RCorrect = validAnswers.includes(s1R);

    if (isStep1LCorrect && isStep1RCorrect) {
      setAlgStatuses(prev => ({...prev, step1: 'correct'}));
      setAlgStep(problem.b !== 1 ? 2 : 3);
    } else {
      setAlgStatuses(prev => ({...prev, step1: 'error'}));
    }
  };

  const checkAlgStep2 = () => {
    const isDivCorrect = parseFloat(algInputs.div1) === problem.b &&
                         parseFloat(algInputs.div2) === problem.b &&
                         parseFloat(algInputs.div3) === problem.b;
    
    if (isDivCorrect) {
      setAlgStatuses(prev => ({...prev, step2: 'correct'}));
      setAlgStep(3);
    } else {
      setAlgStatuses(prev => ({...prev, step2: 'error'}));
    }
  };

  const checkAlgStep3 = () => {
    const isFlipCorrect = algInputs.flip === problem.ansFlip;
    const isFinalOpCorrect = algInputs.finalOp === problem.ansFinalOp;

    if (isFlipCorrect && isFinalOpCorrect) {
      setAlgStatuses(prev => ({...prev, step3: 'correct'}));
      setPhase(2);
    } else {
      setAlgStatuses(prev => ({...prev, step3: 'error'}));
    }
  };

  const handlePropChange = (field, value) => {
    setPropInputs(prev => ({ ...prev, [field]: value }));
    setPropStatus('idle');
  };

  const checkProperties = () => {
    const isYIntCorrect = parseFloat(propInputs.yInt) === problem.ansYInt;
    const parsedSlope = parseFraction(propInputs.slope);
    const isSlopeCorrect = Math.abs(parsedSlope - problem.ansSlope) < 0.01;
    const isLineCorrect = propInputs.line === problem.ansLine;
    const isShadeCorrect = propInputs.shade === problem.ansShade;

    if (isYIntCorrect && isSlopeCorrect && isLineCorrect && isShadeCorrect) {
      setPropStatus('correct');
      setPhase(3);
    } else {
      setPropStatus('error');
    }
  };

  const handleGraphClick = (e) => {
    if (phase < 3 || graphPoints.length >= 2) return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;
    
    const gridX = Math.round((xPx - 200) / 20);
    const gridY = Math.round((200 - yPx) / 20);

    if (graphPoints.some(p => p.x === gridX && p.y === gridY)) return;

    setGraphPoints([...graphPoints, { x: gridX, y: gridY }]);
    setGraphStatus('idle');
  };

  const undoLastPoint = () => {
    setGraphPoints(prev => prev.slice(0, -1));
    setGraphStatus('idle');
  };

  const checkGraph = () => {
    if (graphPoints.length !== 2) {
      setGraphStatus('error');
      return;
    }

    const [p1, p2] = graphPoints;
    const hasYInt = (p1.x === 0 && p1.y === problem.ansYInt) || (p2.x === 0 && p2.y === problem.ansYInt);
    
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const plottedSlope = dx !== 0 ? dy / dx : NaN;
    const isSlopeCorrect = Math.abs(plottedSlope - problem.ansSlope) < 0.01;

    if (hasYInt && isSlopeCorrect) {
      setGraphStatus('correct');
      setPhase(4);
    } else {
      setGraphStatus('error');
    }
  };

  const renderLineAndShading = () => {
    if (graphPoints.length !== 2) return null;
    const [p1, p2] = graphPoints;
    
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const m = dx !== 0 ? dy / dx : 0;
    const b = p1.y - m * p1.x;

    const yStart = m * (-10) + b;
    const yEnd = m * (10) + b;

    const x1Px = 200 + (-10) * 20;
    const y1Px = 200 - (yStart) * 20;
    const x2Px = 200 + (10) * 20;
    const y2Px = 200 - (yEnd) * 20;

    const lineProps = {
      x1: x1Px, y1: y1Px, x2: x2Px, y2: y2Px,
      stroke: "black",
      strokeWidth: 3,
      strokeDasharray: propInputs.line === 'dashed' ? "8,8" : "none"
    };

    let polygonPoints = "";
    if (propInputs.shade === 'above') {
      polygonPoints = `${x1Px},${y1Px} ${x2Px},${y2Px} ${x2Px},0 ${x1Px},0`;
    } else if (propInputs.shade === 'below') {
      polygonPoints = `${x1Px},${y1Px} ${x2Px},${y2Px} ${x2Px},400 ${x1Px},400`;
    }

    return (
      <>
        {propInputs.shade && (
          <polygon points={polygonPoints} fill="rgba(34, 197, 94, 0.3)" />
        )}
        <line {...lineProps} />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200">
        
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 text-center relative">
          <h1 className="text-3xl font-bold mb-2">Graphing Linear Inequalities</h1>
          <p className="text-blue-100 text-lg">Standard Form Step-by-Step Guide</p>
          
          <div className="mt-4 bg-yellow-300 text-yellow-900 px-4 py-3 rounded-lg shadow-inner inline-flex items-center space-x-3 max-w-2xl mx-auto text-left font-medium border-2 border-yellow-400">
             <Star className="w-8 h-8 text-yellow-600 flex-shrink-0" fill="currentColor" />
             <p><strong>Golden Rule:</strong> When you divide what is in front of <span className="font-bold italic">y</span> by a negative, <span className="underline font-bold uppercase">flip</span> the inequality symbol around!</p>
             <Star className="w-8 h-8 text-yellow-600 flex-shrink-0" fill="currentColor" />
          </div>
        </div>

        {/* Progress Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="text-xl font-bold text-gray-700">
            Problem {currentIndex + 1} of {problems.length}
          </div>
          {phase === 4 && currentIndex < problems.length - 1 && (
            <button 
              onClick={() => setCurrentIndex(c => c + 1)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full flex items-center transition shadow-md"
            >
              Next Problem <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          )}
          {phase === 4 && currentIndex === problems.length - 1 && (
            <div className="text-green-600 font-bold text-xl flex items-center">
              <CheckCircle className="mr-2" /> Worksheet Complete!
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Math Steps */}
          <div className="space-y-6">

            {/* PHASE 1: Algebra (Vertical Layout) */}
            <div className={`p-5 rounded-xl border-2 transition-all ${phase === 1 ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white opacity-80'}`}>
              <h3 className="font-bold text-lg mb-6 text-gray-700 flex items-center">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">1</span>
                Isolate y
              </h3>
              
              <div className="overflow-x-auto pb-4">
                <table className="mx-auto text-xl md:text-2xl font-serif border-separate" style={{ borderSpacing: '12px 6px' }}>
                  <tbody>
                    {/* Row 1: Original Equation */}
                    <tr>
                      <td className="text-right">{formatTerm(problem.a, 'x')}</td>
                      <td className="text-right">{formatTerm(problem.b, 'y', true)}</td>
                      <td className="text-center px-2">{formatOp(problem.op)}</td>
                      <td></td>
                      <td className="text-left">{problem.c}</td>
                    </tr>
                    
                    {/* Row 2: Subtract/Add X Step */}
                    <tr>
                      <td className="text-right pb-2">
                        <input 
                          value={algInputs.step1Left} 
                          onChange={(e) => handleAlgChange('step1Left', e.target.value)} 
                          disabled={algStep > 1} 
                          placeholder="..."
                          className="w-16 md:w-20 px-1 text-center text-lg border-2 border-blue-200 bg-white rounded outline-none focus:border-blue-500" 
                        />
                      </td>
                      <td className="pb-2"></td>
                      <td className="pb-2"></td>
                      <td className="text-right pb-2">
                         <input 
                          value={algInputs.step1Right} 
                          onChange={(e) => handleAlgChange('step1Right', e.target.value)} 
                          disabled={algStep > 1} 
                          placeholder="..."
                          className="w-16 md:w-20 px-1 text-center text-lg border-2 border-blue-200 bg-white rounded outline-none focus:border-blue-500" 
                        />
                      </td>
                      <td className="pb-2"></td>
                    </tr>

                    {/* Continuous Line (shown after step 1) */}
                    {algStep > 1 && (
                      <tr>
                        <td colSpan="5">
                          <hr className="border-t-2 border-gray-800" />
                        </td>
                      </tr>
                    )}

                    {/* Row 3: Result of Step 1 */}
                    {algStep > 1 && (
                    <tr>
                      <td></td>
                      <td className="text-right pt-2">{formatTerm(problem.b, 'y')}</td>
                      <td className="text-center px-2 pt-2">{formatOp(problem.op)}</td>
                      <td className="text-right pt-2">{formatTerm(-problem.a, 'x')}</td>
                      <td className="text-left pt-2 px-2">{problem.c > 0 ? `+ ${problem.c}` : `- ${Math.abs(problem.c)}`}</td>
                    </tr>
                    )}

                    {/* Row 4: Division Step (if b != 1) */}
                    {algStep > 1 && problem.b !== 1 && (
                    <tr>
                      <td></td>
                      <td className="border-t-2 border-black pt-2">
                         <input 
                          type="number" 
                          value={algInputs.div1} 
                          onChange={(e) => handleAlgChange('div1', e.target.value)} 
                          disabled={algStep > 2} 
                          className="w-12 text-center text-lg border-2 border-blue-200 rounded outline-none focus:border-blue-500 mx-auto block" 
                        />
                      </td>
                      <td></td>
                      <td className="border-t-2 border-black pt-2">
                         <input 
                          type="number" 
                          value={algInputs.div2} 
                          onChange={(e) => handleAlgChange('div2', e.target.value)} 
                          disabled={algStep > 2} 
                          className="w-12 text-center text-lg border-2 border-blue-200 rounded outline-none focus:border-blue-500 mx-auto block" 
                        />
                      </td>
                      <td className="border-t-2 border-black pt-2">
                         <input 
                          type="number" 
                          value={algInputs.div3} 
                          onChange={(e) => handleAlgChange('div3', e.target.value)} 
                          disabled={algStep > 2} 
                          className="w-12 text-center text-lg border-2 border-blue-200 rounded outline-none focus:border-blue-500 mx-auto block" 
                        />
                      </td>
                    </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {algStep > 2 && (
                <>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-2 shadow-sm">
                    <p className="mb-2 font-medium">Did you divide by a negative number?</p>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="flip" value="yes" checked={algInputs.flip === 'yes'} onChange={(e) => handleAlgChange('flip', e.target.value)} disabled={phase > 1} className="mr-2" />
                        Yes (Flip it!)
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="flip" value="no" checked={algInputs.flip === 'no'} onChange={(e) => handleAlgChange('flip', e.target.value)} disabled={phase > 1} className="mr-2" />
                        No (Keep it)
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-center items-center gap-2 text-xl font-bold bg-white p-3 rounded-lg border-2 border-gray-300 shadow-sm w-max mx-auto">
                    <span className="font-serif">y</span>
                    <select 
                      value={algInputs.finalOp} 
                      onChange={(e) => handleAlgChange('finalOp', e.target.value)}
                      disabled={phase > 1}
                      className="border-2 border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 bg-gray-50 text-lg mx-2"
                    >
                      <option value="">?</option>
                      <option value="<">&lt;</option>
                      <option value="<=">&le;</option>
                      <option value=">">&gt;</option>
                      <option value=">=">&ge;</option>
                    </select>
                    <span className="font-serif flex items-center">
                      {renderFractionX(problem.ansSlopeStr)} 
                      <span className="ml-2 whitespace-nowrap">
                        {problem.ansYInt > 0 ? `+ ${problem.ansYInt}` : `- ${Math.abs(problem.ansYInt)}`}
                      </span>
                    </span>
                  </div>
                </>
              )}

              {phase === 1 && (
                <div className="pt-6 flex items-center justify-between">
                  {algStep === 1 && (
                    <>
                      <button onClick={checkAlgStep1} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition">
                        Check Step 1
                      </button>
                      {algStatuses.step1 === 'error' && <span className="text-red-500 font-bold flex items-center text-sm"><XCircle className="w-5 h-5 mr-1"/> Check your addition/subtraction. Did you include 'x'?</span>}
                    </>
                  )}
                  {algStep === 2 && (
                    <>
                      <button onClick={checkAlgStep2} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition">
                        Check Step 2
                      </button>
                      {algStatuses.step2 === 'error' && <span className="text-red-500 font-bold flex items-center text-sm"><XCircle className="w-5 h-5 mr-1"/> What do you need to divide by to isolate y?</span>}
                    </>
                  )}
                  {algStep === 3 && (
                    <>
                      <button onClick={checkAlgStep3} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition">
                        Check Final Equation
                      </button>
                      {algStatuses.step3 === 'error' && <span className="text-red-500 font-bold flex items-center text-sm"><XCircle className="w-5 h-5 mr-1"/> Check your flip rule and the final inequality symbol!</span>}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* PHASE 2: Graphing Properties */}
            <div className={`p-5 rounded-xl border-2 transition-all ${phase === 2 ? 'border-purple-400 bg-purple-50' : phase > 2 ? 'border-gray-200 bg-white opacity-80' : 'border-gray-200 bg-gray-50 opacity-50 pointer-events-none'}`}>
              <h3 className="font-bold text-lg mb-4 text-gray-700 flex items-center">
                <span className="bg-purple-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">2</span>
                Graphing Plan
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">y-intercept (b)</label>
                  <input type="number" value={propInputs.yInt} onChange={(e) => handlePropChange('yInt', e.target.value)} disabled={phase > 2} placeholder="e.g. -2" className="w-full px-3 py-2 border-2 border-gray-300 rounded outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Slope (m)</label>
                  <input type="text" value={propInputs.slope} onChange={(e) => handlePropChange('slope', e.target.value)} disabled={phase > 2} placeholder="e.g. -3 or 1/2" className="w-full px-3 py-2 border-2 border-gray-300 rounded outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Line Type</label>
                  <select value={propInputs.line} onChange={(e) => handlePropChange('line', e.target.value)} disabled={phase > 2} className="w-full px-3 py-2 border-2 border-gray-300 rounded outline-none focus:border-purple-500 bg-white">
                    <option value="">Select...</option>
                    <option value="dashed">Dashed</option>
                    <option value="solid">Solid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">Shading</label>
                  <select value={propInputs.shade} onChange={(e) => handlePropChange('shade', e.target.value)} disabled={phase > 2} className="w-full px-3 py-2 border-2 border-gray-300 rounded outline-none focus:border-purple-500 bg-white">
                    <option value="">Select...</option>
                    <option value="above">Above (Greater)</option>
                    <option value="below">Below (Less)</option>
                  </select>
                </div>
              </div>

              {phase === 2 && (
                <div className="pt-4 flex items-center justify-between">
                  <button onClick={checkProperties} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow transition">
                    Check Plan
                  </button>
                  {propStatus === 'error' && <span className="text-red-500 font-bold flex items-center"><XCircle className="w-5 h-5 mr-1"/> Check your slope, intercept, and rules!</span>}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: The Graph */}
          <div className={`transition-all ${phase >= 3 ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm flex flex-col items-center">
              <h3 className="font-bold text-lg mb-2 text-gray-700 flex items-center w-full justify-start">
                <span className="bg-green-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2">3</span>
                Plot the Graph
              </h3>
              
              <p className="text-sm text-gray-500 mb-4 w-full">
                Click the graph to plot your <strong>y-intercept</strong>, then click to plot a <strong>second point</strong> using your slope.
              </p>

              <div className="relative border-4 border-gray-800 rounded shadow-inner bg-white overflow-hidden" style={{ width: '400px', height: '400px' }}>
                <svg 
                  width="400" 
                  height="400" 
                  onClick={handleGraphClick}
                  className={phase === 3 ? "cursor-crosshair" : "cursor-default"}
                >
                  {/* Grid Lines */}
                  {Array.from({ length: 21 }).map((_, i) => (
                    <React.Fragment key={i}>
                      <line x1={i * 20} y1="0" x2={i * 20} y2="400" stroke="#e5e7eb" strokeWidth={i === 10 ? 0 : 1} />
                      <line x1="0" y1={i * 20} x2="400" y2={i * 20} stroke="#e5e7eb" strokeWidth={i === 10 ? 0 : 1} />
                    </React.Fragment>
                  ))}
                  
                  {/* Axes */}
                  <line x1="200" y1="0" x2="200" y2="400" stroke="#000" strokeWidth="2" />
                  <line x1="0" y1="200" x2="400" y2="200" stroke="#000" strokeWidth="2" />

                  {renderLineAndShading()}

                  {/* Plotted Points */}
                  {graphPoints.map((p, i) => (
                    <circle 
                      key={i} 
                      cx={200 + p.x * 20} 
                      cy={200 - p.y * 20} 
                      r="5" 
                      fill={i === 0 ? "blue" : "red"} 
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              </div>

              {/* Graph Controls */}
              <div className="mt-4 w-full flex justify-between items-center px-2">
                <button 
                  onClick={undoLastPoint} 
                  disabled={graphPoints.length === 0 || phase > 3}
                  className="text-gray-600 hover:text-gray-900 flex items-center font-medium disabled:opacity-50 transition"
                >
                  <Undo2 className="w-4 h-4 mr-1" /> Undo Point
                </button>
                
                {phase === 3 && (
                  <div className="flex items-center">
                    {graphStatus === 'error' && <span className="text-red-500 font-bold mr-4 text-sm flex items-center"><XCircle className="w-4 h-4 mr-1"/> Incorrect points!</span>}
                    <button 
                      onClick={checkGraph}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow transition"
                    >
                      Check Graph
                    </button>
                  </div>
                )}
                {phase === 4 && (
                  <span className="text-green-600 font-bold flex items-center"><CheckCircle className="w-5 h-5 mr-1" /> Perfect!</span>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
