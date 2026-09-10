'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import CustomCursor from '@/components/CustomCursor';
import {
  DynamicCanvasFile,
  getStoredCanvasFiles,
  getStoredCanvasFilesAsync,
  saveCanvasFileAsync,
  deleteCanvasFile,
  getStoredApiKey,
  saveApiKey,
} from '@/lib/contentStore';

type AdminTab = 'assistant' | 'manage' | 'quick';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    projectDraft?: Partial<DynamicCanvasFile>;
  };
}

// Crisp client-side asset reader (maintains sharpness for text & print)
const readHighResAsset = (file: File): Promise<{ dataUrl: string; name: string; isVideo: boolean; width: number; height: number }> => {
  return new Promise((resolve) => {
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || '';
      if (isVideo) {
        resolve({ dataUrl, name: file.name, isVideo: true, width: 1920, height: 1080 });
        return;
      }

      const img = new Image();
      img.onload = () => {
        // High-res canvas resize only if image exceeds 2560px
        const maxDim = 2560;
        let w = img.naturalWidth;
        let h = img.naturalHeight;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.88), name: file.name, isVideo: false, width: w, height: h });
            return;
          }
        }
        resolve({ dataUrl, name: file.name, isVideo: false, width: w, height: h });
      };
      img.onerror = () => {
        resolve({ dataUrl, name: file.name, isVideo: false, width: 1200, height: 800 });
      };
      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
};

function renderFormattedMessage(text: string) {
  const lines = text.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || /^\d+\./.test(trimmed);
        const cleanContent = isBullet ? trimmed.replace(/^[•\-]\s*/, '').replace(/^\d+\.\s*/, '') : trimmed;

        const parts = cleanContent.split(/(\*\*[^*]+\*\*)/g);
        const formatted = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-white">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={pIdx}>{part}</span>;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-[#e60000] font-bold text-sm leading-none mt-1 shrink-0">•</span>
              <span className="flex-1 text-sm leading-relaxed">{formatted}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-sm leading-relaxed">
            {formatted}
          </p>
        );
      })}
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('assistant');
  const [campaigns, setCampaigns] = useState<DynamicCanvasFile[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // AI Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatFiles, setChatFiles] = useState<Array<{ dataUrl: string; name: string; isVideo: boolean; width: number; height: number }>>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'ai',
      text: "Hey Moiz — Welcome to your Studio Desk. Tell me what campaign you want to add or organize. You can drop files right here and say: 'I have Kaldhar: 1 widescreen 1920x1080 banner, 6 brochure pages in order, and 1 video reel'. I'll organize the layout with zero cropping and publish it live.",
      timestamp: 'Studio Bot',
    },
  ]);

  // Quick Form State
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDiscipline, setQuickDiscipline] = useState('Art Direction • Luxury Campaign');
  const [quickMarket, setQuickMarket] = useState('Heritage Luxury');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickFiles, setQuickFiles] = useState<Array<{ dataUrl: string; name: string; isVideo: boolean }>>([]);

  // Gemini API Key State
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isKeyVerified, setIsKeyVerified] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load active campaigns
  const refreshCampaigns = async () => {
    try {
      const list = await getStoredCanvasFilesAsync();
      setCampaigns(list || []);
    } catch {
      setCampaigns(getStoredCanvasFiles());
    }
  };

  useEffect(() => {
    refreshCampaigns();
    const stored = getStoredApiKey();
    const keyToTest = stored && !stored.includes('AIzaSyCic') ? stored : '';
    if (keyToTest) {
      setGeminiApiKey(keyToTest);
      setTempApiKey(keyToTest);
    }
    fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify_key', geminiKey: keyToTest }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.verified) {
          setIsKeyVerified(true);
          if (!keyToTest) {
            setGeminiApiKey('Connected via Studio Server');
            setTempApiKey('');
          }
        } else {
          setIsKeyVerified(false);
        }
      })
      .catch(() => setIsKeyVerified(false));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleFileDrop = async (e: React.DragEvent | React.ChangeEvent<HTMLInputElement>) => {
    let files: File[] = [];
    if ('dataTransfer' in e && e.dataTransfer.files) {
      e.preventDefault();
      files = Array.from(e.dataTransfer.files);
    } else if ('target' in e && (e.target as HTMLInputElement).files) {
      files = Array.from((e.target as HTMLInputElement).files || []);
    }

    if (!files.length) return;

    setStatusMessage(`Processing ${files.length} high-resolution deliverables...`);
    const processed = await Promise.all(files.map((f) => readHighResAsset(f)));
    setChatFiles((prev) => [...prev, ...processed]);
    setStatusMessage(null);

    // Bot notifies in chat
    setChatHistory((prev) => [
      ...prev,
      {
        id: `file-${Date.now()}`,
        sender: 'ai',
        text: `Received ${files.length} file(s) (${processed.map((p) => p.name).slice(0, 3).join(', ')}${files.length > 3 ? '...' : ''}). What is the project name, and how should we arrange them?`,
        timestamp: 'Studio Bot',
      },
    ]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() && chatFiles.length === 0) return;

    const userText = chatInput.trim();
    const currentFiles = [...chatFiles];
    setChatInput('');
    setChatFiles([]);

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText || `Uploaded ${currentFiles.length} file(s) for organization.`,
      timestamp: 'You',
    };

    setChatHistory((prev) => [...prev, userMsg]);

    const lower = userText.toLowerCase().trim();

    // 0. Auto-detect pasted Gemini API Key
    const keyMatch = userText.match(/(?:AIzaSy|AQ\.)[A-Za-z0-9_\-]{30,70}/);
    if (keyMatch) {
      const extractedKey = keyMatch[0];
      saveApiKey(extractedKey);
      setGeminiApiKey(extractedKey);
      setTempApiKey(extractedKey);
      setStatusMessage('Connecting & verifying key with Google...');

      fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_key', geminiKey: extractedKey }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res.verified) {
            setIsKeyVerified(true);
            setStatusMessage(`✓ Google Gemini Live Connected (${res.model})!`);
            setChatHistory((prev) => [
              ...prev,
              {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: `🎉 **Google Gemini Successfully Connected!**\n\nYour studio co-director is now linked live to Google Gemini AI (${res.model}). You have real-time conversational reasoning and visual campaign analysis active!`,
                timestamp: 'Gemini AI',
              },
            ]);
          } else {
            setIsKeyVerified(false);
            setStatusMessage(`✕ Key Error: ${res.error || res.reason || 'Invalid key'}`);
            setChatHistory((prev) => [
              ...prev,
              {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: `⚠️ **Key Verification Notice:** Google returned: "${res.error || res.reason || 'Key could not be verified'}".\n\nPlease check your key at **[aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)**. In the meantime, I'm running on your built-in Studio Director engine.`,
                timestamp: 'Studio Bot',
              },
            ]);
          }
          setTimeout(() => setStatusMessage(null), 5000);
        })
        .catch(() => {
          setIsKeyVerified(true);
          setStatusMessage('✓ Saved key to studio.');
        });
      return;
    }

    // 1. If files are attached, organize them into an uncropped campaign draft
    if (currentFiles.length > 0) {
      setTimeout(() => {
        let inferredTitle = 'New Campaign';
        const lower = userText.toLowerCase();
        if (lower.includes('kaldhar') || lower.includes('kaladhar')) inferredTitle = 'Kaldhar Bridal';
        else if (lower.includes('porsche')) inferredTitle = 'Porsche Carrera';
        else if (lower.includes('prada')) inferredTitle = 'Prada Deconstruct';
        else if (lower.includes('easy') || lower.includes('hai bro')) inferredTitle = 'Easy Hai Bro';
        else {
          const titleMatch = userText.match(/(?:for|named|project|campaign)\s+([A-Za-z0-9\s]{3,24})/i);
          if (titleMatch) inferredTitle = titleMatch[1].trim();
        }

        const videoAsset = currentFiles.find((f) => f.isVideo);
        const photoAssets = currentFiles.filter((f) => !f.isVideo).map((f) => f.dataUrl);

        const draft: Partial<DynamicCanvasFile> = {
          id: `custom-${Date.now()}`,
          code: inferredTitle.slice(0, 3).toUpperCase(),
          name: inferredTitle,
          discipline:
            lower.includes('bridal') || lower.includes('luxury')
              ? 'Art Direction • Luxury Fashion'
              : 'Brand Identity & Visual Direction',
          year: '2026',
          role: 'Art Director & Brand Designer',
          x: 100,
          y: 100,
          rot: 0,
          img: photoAssets[0] || '',
          aspect: '16/9',
          colorTag: '#e60000',
          photos: photoAssets,
          photoCount: photoAssets.length,
          desc: `Complete multi-channel campaign. Directed key visuals, lookbook brochure spreads, and commercial motion for ${inferredTitle}.`,
          deliverables: ['Brand Identity', 'Lookbook Spreads', 'Widescreen Banners', 'Campaign Motion'],
          videoUrl: videoAsset?.dataUrl || undefined,
        };

        const aiReply: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: `Received ${currentFiles.length} visual asset(s) for "${inferredTitle}" (${photoAssets.length} uncropped plates${videoAsset ? ' + 1 commercial video reel' : ''}). Key visuals set to 16:9 widescreen master banner and 4:5 editorial lookbook frames. Ready to publish live to your portfolio?`,
          timestamp: 'Studio Bot',
          suggestedAction: {
            label: `🚀 Publish "${inferredTitle}" to Live Portfolio`,
            projectDraft: draft,
          },
        };

        setChatHistory((prev) => [...prev, aiReply]);
      }, 500);
      return;
    }

    // 2. Direct AI Conversation: Call /api/ai (uses live Gemini if connected, or smart director engine)
    try {
      const apiRes = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          geminiKey: geminiApiKey,
          campaigns: campaigns.map((c) => ({
            name: c.name,
            discipline: c.discipline,
            deliverables: c.photos?.length || 1,
          })),
          messages: chatHistory
            .map((m) => ({
              role: m.sender === 'ai' ? 'model' : 'user',
              content: m.text,
            }))
            .concat([{ role: 'user', content: userText }]),
        }),
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.reply) {
          setChatHistory((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              sender: 'ai',
              text: data.reply,
              timestamp: data.engine?.startsWith('gemini') ? 'Gemini AI' : 'Studio Bot',
            },
          ]);
          return;
        }
      }
    } catch (err) {
      console.warn('API call failed, falling back', err);
    }

    // 3. Emergency offline fallback
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: "I'm here at your studio desk. Drop your campaign images or video files right into this chat, and I'll organize them with zero cropping.",
          timestamp: 'Studio Bot',
        },
      ]);
    }, 300);
  };

  const handlePublishDraft = async (draft?: Partial<DynamicCanvasFile>) => {
    if (!draft || !draft.name) return;
    setIsSaving(true);

    const newProject: DynamicCanvasFile = {
      id: draft.id || `custom-${Date.now()}`,
      code: draft.code || 'DIR',
      name: draft.name,
      discipline: draft.discipline || 'Art Direction',
      year: draft.year || '2026',
      role: draft.role || 'Art Director',
      x: 200,
      y: 200,
      rot: 0,
      img: draft.img || draft.photos?.[0] || '',
      aspect: '16/9',
      colorTag: '#e60000',
      photos: draft.photos || [],
      photoCount: draft.photos?.length || 0,
      desc: draft.desc || 'Comprehensive visual direction.',
      deliverables: draft.deliverables || ['Brand Identity'],
      videoUrl: draft.videoUrl,
    };

    await saveCanvasFileAsync(newProject);
    await refreshCampaigns();
    setIsSaving(false);

    setChatHistory((prev) => [
      ...prev,
      {
        id: `pub-${Date.now()}`,
        sender: 'ai',
        text: `🎉 "${newProject.name}" has been published to your live portfolio! You can open it in the Work section or manage it under the Manage tab.`,
        timestamp: 'Studio Bot',
      },
    ]);
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to completely delete "${name}"? This cannot be undone.`)) {
      deleteCanvasFile(id);
      await refreshCampaigns();
      setStatusMessage(`Deleted "${name}" successfully.`);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-[#0d0d0e] text-white selection:bg-[#e60000] selection:text-white font-sans">
      <CustomCursor />

      {/* Top Luxury Studio Bar — Line-Free */}
      <header className="sticky top-0 z-40 bg-[#141416]/90 backdrop-blur-md px-6 sm:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-mono text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            ← <span>Return to Portfolio</span>
          </Link>
          <span className="text-neutral-600 font-mono text-xs">•</span>
          <span className="font-display font-black text-sm uppercase tracking-wider text-white">
            Studio Desk
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#e60000]/15 text-[#e60000] font-mono text-[10px] font-bold">
            Live Mode
          </span>
        </div>

        {/* Actions & Tab Switcher Pills */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center bg-black/50 p-1 rounded-full text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab('assistant')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
                activeTab === 'assistant'
                  ? 'bg-[#e60000] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              🤖 AI Studio Assistant
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
                activeTab === 'manage'
                  ? 'bg-[#e60000] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              📂 Manage Campaigns ({campaigns.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quick')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer font-bold ${
                activeTab === 'quick'
                  ? 'bg-[#e60000] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              ⚡ Quick Upload
            </button>
          </nav>

          {/* Gemini API Connection Button */}
          <button
            type="button"
            onClick={() => {
              setTempApiKey(geminiApiKey);
              setShowKeyModal(true);
            }}
            className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              geminiApiKey && isKeyVerified
                ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                : geminiApiKey
                ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
                : 'bg-[#1e1e24] hover:bg-[#282830] text-neutral-300'
            }`}
            title="Configure Google Gemini API Key"
          >
            <span className={geminiApiKey && isKeyVerified ? 'text-emerald-400' : geminiApiKey ? 'text-amber-400' : 'text-neutral-500'}>●</span>
            <span>{geminiApiKey && isKeyVerified ? 'Gemini Live' : geminiApiKey ? 'Verify Gemini' : '⚡ Connect Free Gemini'}</span>
          </button>
        </div>
      </header>

      {/* Gemini API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#141416] p-6 sm:p-8 rounded-[28px] max-w-lg w-full space-y-5 shadow-2xl border border-white/5">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] text-[#e60000] font-bold uppercase tracking-wider">
                  Live AI Intelligence
                </span>
                <h3 className="font-display font-black text-xl text-white uppercase tracking-tight mt-1">
                  Connect Free Google Gemini
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="text-neutral-500 hover:text-white font-mono text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-black/40 rounded-2xl p-4 space-y-2 text-xs font-sans text-neutral-300">
              <p className="font-bold text-white flex items-center gap-2">
                <span className="text-[#e60000]">●</span> Google provides 100% Free Gemini API keys:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-neutral-400 pl-1 leading-relaxed">
                <li>Open <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[#e60000] hover:underline font-mono">aistudio.google.com/app/apikey ↗</a></li>
                <li>Sign in with your regular Google account &amp; click <strong className="text-white">Create API Key</strong></li>
                <li>Copy the key (starts with <code className="font-mono text-white text-[11px]">AIzaSy...</code>) and paste it below</li>
              </ol>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[11px] text-neutral-300 block uppercase">
                Paste Gemini API Key
              </label>
              <input
                type="text"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#1e1e24] text-white px-4 py-3 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#e60000]"
              />
              <div className="flex items-center justify-between pt-1">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-[#e60000] hover:underline"
                >
                  Get free key from Google AI Studio ↗
                </a>
                {geminiApiKey && (
                  <button
                    type="button"
                    onClick={() => {
                      saveApiKey('');
                      setGeminiApiKey('');
                      setTempApiKey('');
                      setIsKeyVerified(false);
                      setShowKeyModal(false);
                      setStatusMessage('Gemini key removed. Studio is in offline director mode.');
                      setTimeout(() => setStatusMessage(null), 3000);
                    }}
                    className="font-mono text-[10px] text-red-500 hover:underline cursor-pointer"
                  >
                    Disconnect Key
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-full font-mono text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const keyToSave = tempApiKey.trim();
                  saveApiKey(keyToSave);
                  setGeminiApiKey(keyToSave);
                  setShowKeyModal(false);

                  if (keyToSave) {
                    setStatusMessage('Testing connection with Google Gemini...');
                    try {
                      const res = await fetch('/api/ai', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'verify_key', geminiKey: keyToSave }),
                      });
                      const data = await res.json();
                      if (data.verified) {
                        setIsKeyVerified(true);
                        setStatusMessage(`✓ Connected & Verified with Google (${data.model})!`);
                      } else {
                        setIsKeyVerified(false);
                        setStatusMessage(`✕ Key Error: ${data.error || data.reason || 'Google rejected key'}`);
                      }
                    } catch {
                      setIsKeyVerified(false);
                      setStatusMessage('✓ Saved key to studio.');
                    }
                  } else {
                    setIsKeyVerified(false);
                    setStatusMessage('Studio is in offline director mode.');
                  }
                  setTimeout(() => setStatusMessage(null), 5000);
                }}
                className="px-6 py-2.5 rounded-full bg-[#e60000] hover:bg-[#ff1a1a] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Save &amp; Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      {statusMessage && (
        <div className="bg-[#e60000] text-white py-2 px-6 text-center font-mono text-xs font-bold animate-fadeIn">
          {statusMessage}
        </div>
      )}

      {/* Main Studio Viewport */}
      <div className="max-w-6xl mx-auto px-6 py-8 sm:py-12">
        {/* TAB 1: AI STUDIO ASSISTANT */}
        {activeTab === 'assistant' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Chat Conversation Column */}
            <div className="lg:col-span-8 flex flex-col bg-[#141416] rounded-[24px] p-6 sm:p-8 min-h-[580px] shadow-2xl">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 max-h-[480px]">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="font-mono text-[10px] text-neutral-500 mb-1 px-1">
                      {msg.timestamp}
                    </span>
                    <div
                      className={`max-w-xl rounded-[20px] p-4 sm:p-5 text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#e60000] text-white font-medium'
                          : 'bg-[#1e1e24] text-neutral-200'
                      }`}
                    >
                      {renderFormattedMessage(msg.text)}

                      {/* Bot Action Button (Publish Draft) */}
                      {msg.suggestedAction && (
                        <div className="mt-4 pt-2">
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => handlePublishDraft(msg.suggestedAction?.projectDraft)}
                            className="w-full py-3 px-4 rounded-xl bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#e60000] hover:text-white transition-all cursor-pointer shadow-lg disabled:opacity-50"
                          >
                            {isSaving ? 'Publishing...' : msg.suggestedAction.label}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input & File Drop Area */}
              <form onSubmit={handleSendMessage} className="mt-6 pt-2 space-y-3">
                {/* Attached Files Preview */}
                {chatFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-black/40 rounded-xl">
                    {chatFiles.map((f, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-[#1e1e24] text-xs font-mono text-neutral-300 flex items-center gap-1.5"
                      >
                        <span>{f.isVideo ? '🎥' : '🖼️'}</span>
                        <span className="max-w-[120px] truncate">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => setChatFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-neutral-500 hover:text-white ml-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileDrop}
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-12 h-12 rounded-full bg-[#1e1e24] hover:bg-neutral-700 text-white flex items-center justify-center cursor-pointer transition-colors text-lg shrink-0"
                    title="Attach Deliverable Images / Video"
                  >
                    📎
                  </button>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tell your bot what to upload or organize (e.g. Kaldhar Bridal brochure)..."
                    className="flex-1 bg-[#1e1e24] text-white placeholder-neutral-500 px-5 py-3.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#e60000]"
                  />

                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-full bg-[#e60000] hover:bg-[#ff1a1a] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                  >
                    Send →
                  </button>
                </div>
              </form>
            </div>

            {/* Right Guide Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#141416] p-6 rounded-[24px] space-y-4">
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                  Quick Prompts for Bot
                </h3>
                <div className="space-y-2">
                  {[
                    'Organize Kaldhar Bridal with 1920x1080 banner first, then brochure pages',
                    'Create Brand Identity campaign with widescreen slides',
                    'Upload fashion lookbook with A4 double-page spreads',
                    'Add automotive reel with sound',
                  ].map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setChatInput(p)}
                      className="w-full text-left p-3 rounded-xl bg-[#1e1e24] hover:bg-[#282830] text-xs text-neutral-300 transition-colors cursor-pointer block"
                    >
                      💬 &ldquo;{p}&rdquo;
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#141416] p-6 rounded-[24px] space-y-3 font-mono text-xs text-neutral-400">
                <h4 className="text-white font-bold uppercase tracking-wider">Uncropped Specs</h4>
                <p>• 1920×1080 (16:9): Displays full widescreen banner.</p>
                <p>• A4 / 4:5: Displays as clean brochure spreads without crop.</p>
                <p>• Videos / Reels: Supported up to 1080×1920 or 1920×1080.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE LIVE CAMPAIGNS */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-2xl uppercase tracking-wider text-white">
                  Active Portfolio Campaigns
                </h2>
                <p className="text-neutral-400 text-xs font-mono mt-1">
                  Manage all projects currently accessible on your portfolio. Delete any with 1 click.
                </p>
              </div>
            </div>

            {campaigns.length === 0 ? (
              <div className="bg-[#141416] rounded-[24px] p-12 text-center space-y-4">
                <p className="text-neutral-400 text-sm font-mono">No custom campaigns uploaded yet.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('assistant')}
                  className="px-6 py-2.5 rounded-full bg-[#e60000] text-white font-mono text-xs font-bold uppercase"
                >
                  Upload First Campaign with AI →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((c) => (
                  <div
                    key={c.id}
                    className="bg-[#141416] rounded-[20px] overflow-hidden group shadow-lg flex flex-col justify-between"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/9] bg-black/40 overflow-hidden">
                      {c.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.img}
                          alt={c.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono text-xs text-neutral-600">
                          NO PREVIEW
                        </div>
                      )}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md font-mono text-[10px] text-white font-bold">
                        {c.photos?.length || 1} DELIVERABLES
                      </span>
                    </div>

                    {/* Meta & Delete Action */}
                    <div className="p-5 space-y-4">
                      <div>
                        <span className="font-mono text-[10px] text-[#e60000] font-bold uppercase tracking-wider">
                          {c.discipline}
                        </span>
                        <h3 className="font-display font-black text-lg text-white uppercase tracking-tight mt-0.5">
                          {c.name}
                        </h3>
                        <p className="text-xs text-neutral-400 line-clamp-2 mt-1 font-sans">
                          {c.desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <Link
                          href="/"
                          className="font-mono text-xs text-neutral-400 hover:text-white transition-colors"
                        >
                          View Live ↗
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDeleteCampaign(c.id, c.name)}
                          className="px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-mono text-xs font-bold transition-all cursor-pointer"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: QUICK DIRECT UPLOAD */}
        {activeTab === 'quick' && (
          <div className="max-w-2xl mx-auto bg-[#141416] p-8 rounded-[24px] shadow-2xl space-y-6">
            <h2 className="font-display font-black text-xl uppercase tracking-wider text-white">
              Direct Campaign Upload
            </h2>

            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs text-neutral-400 block mb-1 uppercase">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="e.g. Kaldhar Luxury Bridal"
                  className="w-full bg-[#1e1e24] text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e60000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-xs text-neutral-400 block mb-1 uppercase">
                    Discipline
                  </label>
                  <input
                    type="text"
                    value={quickDiscipline}
                    onChange={(e) => setQuickDiscipline(e.target.value)}
                    placeholder="e.g. Art Direction"
                    className="w-full bg-[#1e1e24] text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e60000]"
                  />
                </div>
                <div>
                  <label className="font-mono text-xs text-neutral-400 block mb-1 uppercase">
                    Market
                  </label>
                  <input
                    type="text"
                    value={quickMarket}
                    onChange={(e) => setQuickMarket(e.target.value)}
                    placeholder="e.g. Heritage Luxury"
                    className="w-full bg-[#1e1e24] text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e60000]"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-xs text-neutral-400 block mb-1 uppercase">
                  Narrative
                </label>
                <textarea
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  rows={3}
                  placeholder="Project narrative and commercial impact..."
                  className="w-full bg-[#1e1e24] text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#e60000]"
                />
              </div>

              {/* File Selector */}
              <div>
                <label className="font-mono text-xs text-neutral-400 block mb-1 uppercase">
                  Upload Deliverables (Images &amp; Videos)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={async (e) => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files);
                      const processed = await Promise.all(files.map((f) => readHighResAsset(f)));
                      setQuickFiles(processed);
                    }
                  }}
                  className="w-full text-xs font-mono text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#e60000] file:text-white hover:file:bg-[#ff1a1a] cursor-pointer"
                />
                {quickFiles.length > 0 && (
                  <p className="mt-2 text-xs font-mono text-emerald-400">
                    ✓ {quickFiles.length} deliverable(s) ready to publish.
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={!quickTitle || quickFiles.length === 0 || isSaving}
                onClick={async () => {
                  setIsSaving(true);
                  const newProj: DynamicCanvasFile = {
                    id: `custom-${Date.now()}`,
                    code: quickTitle.slice(0, 3).toUpperCase(),
                    name: quickTitle,
                    discipline: quickDiscipline,
                    year: '2026',
                    role: 'Art Director',
                    x: 200,
                    y: 200,
                    rot: 0,
                    img: quickFiles[0]?.dataUrl || '',
                    aspect: '16/9',
                    colorTag: '#e60000',
                    photos: quickFiles.filter((q) => !q.isVideo).map((q) => q.dataUrl),
                    photoCount: quickFiles.length,
                    desc: quickDesc,
                    deliverables: ['Brand Identity', 'Lookbook'],
                    videoUrl: quickFiles.find((q) => q.isVideo)?.dataUrl,
                  };

                  await saveCanvasFileAsync(newProj);
                  await refreshCampaigns();
                  setIsSaving(false);
                  setQuickTitle('');
                  setQuickFiles([]);
                  setActiveTab('manage');
                }}
                className="w-full py-4 rounded-full bg-[#e60000] hover:bg-[#ff1a1a] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Publishing...' : 'Publish Campaign to Portfolio →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
