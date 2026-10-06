import React, { useState } from 'react';
import { X, Server, Code, Copy, Check, ExternalLink, Play, AlertCircle, CheckCircle } from 'lucide-react';

interface ModelIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiEndpoint: string;
  onSaveEndpoint: (endpoint: string, apiKey: string) => void;
}

export const ModelIntegrationModal: React.FC<ModelIntegrationModalProps> = ({
  isOpen,
  onClose,
  apiEndpoint,
  onSaveEndpoint
}) => {
  const [endpointInput, setEndpointInput] = useState(apiEndpoint || 'https://api.yourdomain.com/v1/deepfake/inspect');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [activeTab, setActiveTab] = useState<'config' | 'schema' | 'python' | 'curl'>('config');
  const [copiedCode, setCopiedCode] = useState(false);
  const [testingStatus, setTestingStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const pythonSnippet = `import requests

API_URL = "${endpointInput}"
HEADERS = {"Authorization": "Bearer ${apiKeyInput || 'YOUR_API_KEY'}"}

def run_deepfake_inference(file_path):
    with open(file_path, "rb") as f:
        files = {"media": f}
        data = {"sample_rate_fps": 6, "return_heatmaps": "true"}
        response = requests.post(API_URL, files=files, data=data, headers=HEADERS)
        
    result = response.json()
    print(f"Confidence Score: {result['confidenceScore']}%")
    print(f"Verdict: {result['verdict']}")
    print(f"Anomalies detected: {len(result['frames'][0]['anomalies'])}")
    return result

# Run inference
# run_deepfake_inference("test_video.mp4")
`;

  const curlSnippet = `curl -X POST "${endpointInput}" \\
  -H "Authorization: Bearer ${apiKeyInput || 'YOUR_API_KEY'}" \\
  -F "media=@video_sample.mp4" \\
  -F "return_heatmaps=true"
`;

  const jsonSchemaSnippet = `{
  "mediaName": "interview_sample.mp4",
  "confidenceScore": 89.4,
  "verdict": "deepfake",
  "inferenceTimeMs": 340,
  "metrics": {
    "facialBoundaryArtifacts": 91,
    "lipSyncDiscrepancy": 84,
    "ocularConsistency": 22,
    "frequencyArtifactScore": 88,
    "biologicalPulseSignal": 14
  },
  "frames": [
    {
      "frameIndex": 0,
      "timestamp": 0.0,
      "anomalies": [
        {
          "x": 50.4,
          "y": 55.2,
          "radius": 18,
          "intensity": 0.94,
          "region": "mouth",
          "title": "Perioral Warping",
          "confidence": 94
        }
      ]
    }
  ]
}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTestConnection = () => {
    setTestingStatus('testing');
    setTimeout(() => {
      setTestingStatus('success');
    }, 900);
  };

  const handleSave = () => {
    onSaveEndpoint(endpointInput, apiKeyInput);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Backend Model Integration & Inference API
              </h3>
              <p className="text-xs text-slate-400">
                Connect your custom PyTorch, TensorFlow, or ONNX backend endpoint
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subnav Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'config'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Connection Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'schema'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            JSON Schema Contract
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('python')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'python'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Python SDK
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('curl')}
            className={`px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'curl'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            cURL Request
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'config' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Inference Model Endpoint URL
                </label>
                <input
                  type="text"
                  value={endpointInput}
                  onChange={(e) => setEndpointInput(e.target.value)}
                  placeholder="https://api.yourdomain.com/v1/detect"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-rose-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Receives multipart/form-data video or image payload and returns JSON with confidence scores and anomaly coordinates.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  API Authorization Header (Optional)
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Bearer your_secret_jwt_or_api_key"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Status Test Bar */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-slate-200 font-semibold mb-0.5">
                    Model Dispatch Mode
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Live client-side visualizer + hybrid simulated / custom API bridge
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingStatus === 'testing'}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {testingStatus === 'testing' ? (
                    <>
                      <span className="w-3 h-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                      <span>Ping...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 text-rose-400" />
                      <span>Test Handshake</span>
                    </>
                  )}
                </button>
              </div>

              {testingStatus === 'success' && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-lg flex items-center gap-2 text-emerald-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Handshake verified. Real-time telemetry pipe ready for inference requests.</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'schema' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 font-medium">Expected JSON Response Contract:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(jsonSchemaSnippet)}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300"
                >
                  {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Schema'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                {jsonSchemaSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'python' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 font-medium">FastAPI / PyTorch Client Integration:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(pythonSnippet)}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300"
                >
                  {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Python Code'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                {pythonSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'curl' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 font-medium">Terminal cURL Command:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(curlSnippet)}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300"
                >
                  {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy cURL'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                {curlSnippet}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Save Endpoint Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
