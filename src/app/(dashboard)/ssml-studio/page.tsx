'use client';

import { useState, useRef, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer,
  Mic,
  Heart,
  Languages,
  Music,
  Volume2,
  Play,
  Code,
  Eye,
  Plus,
  Trash2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NodeType = 'pause' | 'voice' | 'emotion' | 'pronunciation' | 'music' | 'soundEffect';

interface SSMLNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  properties: {
    duration?: string;
    voice?: string;
    emotion?: string;
    intensity?: number;
    word?: string;
    phonetic?: string;
    track?: string;
    volume?: number;
    effect?: string;
  };
}

interface Connection {
  from: string;
  to: string;
}

const nodeConfigs = {
  pause: { icon: Timer, color: 'cyan', label: 'Pause', borderColor: 'border-cyan-500' },
  voice: { icon: Mic, color: 'purple', label: 'Voice', borderColor: 'border-purple-500' },
  emotion: { icon: Heart, color: 'pink', label: 'Emotion', borderColor: 'border-pink-500' },
  pronunciation: { icon: Languages, color: 'green', label: 'Pronunciation', borderColor: 'border-green-500' },
  music: { icon: Music, color: 'orange', label: 'Music', borderColor: 'border-orange-500' },
  soundEffect: { icon: Volume2, color: 'yellow', label: 'Sound Effect', borderColor: 'border-yellow-500' },
};

export default function SSMLStudioPage() {
  const [nodes, setNodes] = useState<SSMLNode[]>([
    { id: '1', type: 'voice', x: 100, y: 150, properties: { voice: 'Sarah' } },
    { id: '2', type: 'emotion', x: 300, y: 150, properties: { emotion: 'happy', intensity: 75 } },
    { id: '3', type: 'pause', x: 500, y: 150, properties: { duration: '500ms' } },
    { id: '4', type: 'music', x: 300, y: 300, properties: { track: 'ambient-1', volume: 30 } },
  ]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connections] = useState<Connection[]>([
    { from: '1', to: '2' },
    { from: '2', to: '3' },
  ]);
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showSuggestions, setShowSuggestions] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleNodeMouseDown = (nodeId: string, e: MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDraggedNode(nodeId);
      setSelectedNode(nodeId);
      setDragOffset({
        x: e.clientX - node.x,
        y: e.clientY - node.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggedNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;

      setNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === draggedNode ? { ...node, x: Math.max(0, x), y: Math.max(0, y) } : node
        )
      );
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const addNode = (type: NodeType) => {
    const newNode: SSMLNode = {
      id: Date.now().toString(),
      type,
      x: 200,
      y: 200,
      properties: {},
    };
    setNodes([...nodes, newNode]);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    if (selectedNode === nodeId) {
      setSelectedNode(null);
    }
  };

  const updateNodeProperty = (nodeId: string, key: string, value: any) => {
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === nodeId
          ? { ...node, properties: { ...node.properties, [key]: value } }
          : node
      )
    );
  };

  const generateSSML = () => {
    let ssml = '<speak>\n';
    nodes.forEach(node => {
      switch (node.type) {
        case 'pause':
          ssml += `  <break time="${node.properties.duration || '500ms'}" />\n`;
          break;
        case 'voice':
          ssml += `  <voice name="${node.properties.voice || 'default'}">\n    <!-- Voice content -->\n  </voice>\n`;
          break;
        case 'emotion':
          ssml += `  <prosody emotion="${node.properties.emotion || 'neutral'}" intensity="${node.properties.intensity || 50}%">\n    <!-- Emotional content -->\n  </prosody>\n`;
          break;
        case 'pronunciation':
          ssml += `  <phoneme alphabet="ipa" ph="${node.properties.phonetic || ''}">${node.properties.word || ''}</phoneme>\n`;
          break;
        case 'music':
          ssml += `  <audio src="${node.properties.track || 'music.mp3'}" volume="${node.properties.volume || 50}%" />\n`;
          break;
        case 'soundEffect':
          ssml += `  <audio src="${node.properties.effect || 'effect.mp3'}" />\n`;
          break;
      }
    });
    ssml += '</speak>';
    return ssml;
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  const suggestions = [
    { text: 'Add a 500ms pause after this dramatic line', action: () => addNode('pause') },
    { text: 'Consider adding emphasis to key words', action: () => addNode('emotion') },
    { text: 'Music fade-in would enhance this section', action: () => addNode('music') },
    { text: 'Add pronunciation guide for technical terms', action: () => addNode('pronunciation') },
  ];

  return (
    <div className="h-screen flex flex-col bg-ev-bg">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-ev-outline bg-ev-surface px-6 py-4"
      >
        <h1 className="text-2xl font-bold text-ev-on-surface">SSML Studio</h1>
        <p className="text-sm text-ev-on-surface-variant">Visual SSML Editor</p>
      </motion.div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-ev-surface border-b border-ev-outline px-4 py-3 flex items-center gap-2"
          >
            <span className="text-sm text-ev-on-surface-variant mr-2">Add Node:</span>
            {(Object.keys(nodeConfigs) as NodeType[]).map(type => {
              const config = nodeConfigs[type];
              const Icon = config.icon;
              return (
                <button
                  key={type}
                  onClick={() => addNode(type)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors',
                    'hover:bg-ev-surface-high border-ev-outline text-ev-on-surface'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{config.label}</span>
                </button>
              );
            })}
          </motion.div>

          {/* View Mode Tabs */}
          <div className="bg-ev-surface border-b border-ev-outline px-4 py-2 flex gap-2">
            <button
              onClick={() => setViewMode('visual')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                viewMode === 'visual'
                  ? 'bg-ev-primary text-white'
                  : 'bg-ev-surface-container text-ev-on-surface hover:bg-ev-surface-high'
              )}
            >
              <Eye className="w-4 h-4" />
              Visual
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                viewMode === 'code'
                  ? 'bg-ev-primary text-white'
                  : 'bg-ev-surface-container text-ev-on-surface hover:bg-ev-surface-high'
              )}
            >
              <Code className="w-4 h-4" />
              Code
            </button>
          </div>

          {/* Canvas/Code View */}
          <div className="flex-1 relative overflow-hidden">
            {viewMode === 'visual' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                ref={canvasRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="w-full h-full relative bg-ev-bg"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              >
                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {connections.map((conn, idx) => {
                    const fromNode = nodes.find(n => n.id === conn.from);
                    const toNode = nodes.find(n => n.id === conn.to);
                    if (!fromNode || !toNode) return null;

                    const x1 = fromNode.x + 100;
                    const y1 = fromNode.y + 40;
                    const x2 = toNode.x;
                    const y2 = toNode.y + 40;

                    return (
                      <path
                        key={idx}
                        d={`M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`}
                        stroke="rgb(34, 211, 238)"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.6"
                      />
                    );
                  })}
                </svg>

                {/* Nodes */}
                {nodes.map(node => {
                  const nodeConfig = nodeConfigs[node.type];
                  const NodeIcon = nodeConfig.icon;
                  return (
                    <motion.div
                      key={node.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        position: 'absolute',
                        left: node.x,
                        top: node.y,
                      }}
                      onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                      onClick={() => setSelectedNode(node.id)}
                      className={cn(
                        'w-[200px] bg-ev-surface rounded-lg border-t-4 cursor-move shadow-lg',
                        nodeConfig.borderColor,
                        selectedNode === node.id && 'ring-2 ring-ev-primary'
                      )}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <NodeIcon className="w-5 h-5 text-ev-on-surface" />
                          <span className="font-semibold text-ev-on-surface">{nodeConfig.label}</span>
                        </div>
                        <div className="space-y-1 text-xs text-ev-on-surface-variant">
                          {node.type === 'pause' && (
                            <div>Duration: {node.properties.duration || 'N/A'}</div>
                          )}
                          {node.type === 'voice' && (
                            <div>Voice: {node.properties.voice || 'N/A'}</div>
                          )}
                          {node.type === 'emotion' && (
                            <>
                              <div>Emotion: {node.properties.emotion || 'N/A'}</div>
                              <div>Intensity: {node.properties.intensity || 0}%</div>
                            </>
                          )}
                          {node.type === 'pronunciation' && (
                            <>
                              <div>Word: {node.properties.word || 'N/A'}</div>
                              <div>Phonetic: {node.properties.phonetic || 'N/A'}</div>
                            </>
                          )}
                          {node.type === 'music' && (
                            <>
                              <div>Track: {node.properties.track || 'N/A'}</div>
                              <div>Volume: {node.properties.volume || 0}%</div>
                            </>
                          )}
                          {node.type === 'soundEffect' && (
                            <div>Effect: {node.properties.effect || 'N/A'}</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full p-6 overflow-auto"
              >
                <pre className="bg-ev-surface-container rounded-lg p-6 text-sm font-mono text-ev-on-surface">
                  <code className="language-xml">
                    {generateSSML().split('\n').map((line, idx) => (
                      <div key={idx}>
                        {line.includes('<') ? (
                          <>
                            <span className="text-cyan-400">{line.match(/^(\s*)/)?.[0]}</span>
                            <span className="text-pink-400">{line.match(/<[^>]+>/)?.[0]}</span>
                            <span className="text-green-400">{line.replace(/^\s*/, '').replace(/<[^>]+>/, '')}</span>
                          </>
                        ) : (
                          line
                        )}
                      </div>
                    ))}
                  </code>
                </pre>
              </motion.div>
            )}
          </div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-ev-surface border-t border-ev-outline px-6 py-4 flex items-center justify-between"
          >
            <div className="text-sm text-ev-on-surface-variant">
              {nodes.length} nodes • {connections.length} connections
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-ev-primary hover:bg-ev-primary/90 text-white rounded-lg font-medium transition-colors">
              <Play className="w-4 h-4" />
              Preview Audio
            </button>
          </motion.div>
        </div>

        {/* Right Panel - Node Properties */}
        <AnimatePresence>
          {selectedNodeData && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-80 bg-ev-surface border-l border-ev-outline flex flex-col"
            >
              <div className="p-6 border-b border-ev-outline">
                <h2 className="text-lg font-semibold text-ev-on-surface mb-1">Node Properties</h2>
                <p className="text-sm text-ev-on-surface-variant">
                  {nodeConfigs[selectedNodeData.type].label}
                </p>
              </div>

              <div className="flex-1 overflow-auto p-6 space-y-4">
                {selectedNodeData.type === 'pause' && (
                  <div>
                    <label className="block text-sm font-medium text-ev-on-surface mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={selectedNodeData.properties.duration || ''}
                      onChange={(e) => updateNodeProperty(selectedNodeData.id, 'duration', e.target.value)}
                      placeholder="e.g., 500ms, 2s"
                      className="w-full px-3 py-2 bg-ev-surface-container border border-ev-outline rounded-lg text-ev-on-surface focus:outline-none focus:ring-2 focus:ring-ev-primary"
                    />
                  </div>
                )}

                {selectedNodeData.type === 'voice' && (
                  <div>
                    <label className="block text-sm font-medium text-ev-on-surface mb-2">
                      Voice Name
                    </label>
                    <input
                      type="text"
                      value={selectedNodeData.properties.voice || ''}
                      onChange={(e) => updateNodeProperty(selectedNodeData.id, 'voice', e.target.value)}
                      placeholder="e.g., Sarah, Ali"
                      className="w-full px-3 py-2 bg-ev-surface-container border border-ev-outline rounded-lg text-ev-on-surface focus:outline-none focus:ring-2 focus:ring-ev-primary"
                    />
                  </div>
                )}

                {selectedNodeData.type === 'emotion' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-ev-on-surface mb-2">
                        Emotion Type
                      </label>
                      <select
                        value={selectedNodeData.properties.emotion || ''}
                        onChange={(e) => updateNodeProperty(selectedNodeData.id, 'emotion', e.target.value)}
                        className="w-full px-3 py-2 bg-ev-surface-container border border-ev-outline rounded-lg text-ev-on-surface focus:outline-none focus:ring-2 focus:ring-ev-primary"
                      >
                        <option value="">Select emotion</option>
                        <option value="happy">Happy</option>
                        <option value="sad">Sad</option>
                        <option value="excited">Excited</option>
                        <option value="calm">Calm</option>
                        <option value="angry">Angry</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ev-on-surface mb-2">
                        Intensity: {selectedNodeData.properties.intensity || 50}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedNodeData.properties.intensity || 50}
                        onChange={(e) => updateNodeProperty(selectedNodeData.id, 'intensity', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                {selectedNodeData.type === 'pronunciation' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-ev-on-surface mb-2">
                        Word
                      </label>
                      <input
                        type="text"
                        value={selectedNodeData.properties.word || ''}
                        onChange={(e) => updateNodeProperty(selectedNodeData.id, 'word', e.target.value)}
                        placeholder="e.g., tomato"
                        className="w-full px-3 py-2 bg-ev-surface-container border border-ev-outline rounded-lg text-ev-on-surface focus:outline-none focus:ring-2 focus:ring-ev-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ev-on-surface mb-2">
                        Phonetic (IPA)
                      </label>
                      <input
                        type="text"
                        value={selectedNodeData.properties.phonetic || ''}
                        onChange={(e) => updateNodeProperty(selectedNodeData.id, 'phonetic', e.target.value)}
                        placeholder="e.g., təˈmeɪtoʊ"
                        className="w-full px-3 py-2 bg-ev-surface-container border border-ev-outline rounded-lg text-ev-on-surface focus:outline-none focus:ring-2 focus:ring-ev-primary"
                      />
                    </div>
                  </>
                )}

                {selectedNodeData.type === 'music' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-ev-on-surface mb-2">
                        Track
                      </label>
                      <input
                        type="text"
                        value={selectedNodeData.properties.track || ''}
                        onChange={(e) => updateNodeProperty(selectedNodeData.id, 'track', e.target.value)}
                        placeholder="e.g., ambient-1"
                        className="w-full px-3 py-2 bg-ev-surface-container border border-ev-outline rounded-lg text-ev-on-surface focus:outline-none focus:ring-2 focus:ring-ev-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ev-on-surface mb-2">
                        Volume: {selectedNodeData.properties.volume || 50}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedNodeData.properties.volume || 50}
                        onChange={(e) => updateNodeProperty(selectedNodeData.id, 'volume', parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                {selectedNodeData.type === 'soundEffect' && (
                  <div>
                    <label className="block text-sm font-medium text-ev-on-surface mb-2">
                      Effect Type
                    </label>
                    <input
                      type="text"
                      value={selectedNodeData.properties.effect || ''}
                      onChange={(e) => updateNodeProperty(selectedNodeData.id, 'effect', e.target.value)}
                      placeholder="e.g., applause, thunder"
                      className="w-full px-3 py-2 bg-ev-surface-container border border-ev-outline rounded-lg text-ev-on-surface focus:outline-none focus:ring-2 focus:ring-ev-primary"
                    />
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-ev-outline">
                <button
                  onClick={() => deleteNode(selectedNodeData.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-ev-error hover:bg-ev-error/90 text-white rounded-lg font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Node
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Suggestions Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="border-t border-ev-outline bg-ev-surface"
      >
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="w-full px-6 py-3 flex items-center justify-between text-ev-on-surface hover:bg-ev-surface-high transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-ev-primary" />
            <span className="font-medium">AI Suggestions</span>
          </div>
          {showSuggestions ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>

        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="bg-ev-surface-container rounded-lg p-4 border border-ev-outline"
                  >
                    <p className="text-sm text-ev-on-surface mb-3">{suggestion.text}</p>
                    <button
                      onClick={suggestion.action}
                      className="text-sm px-4 py-1.5 bg-ev-primary-container text-ev-primary rounded-lg hover:bg-ev-primary hover:text-white transition-colors font-medium"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
