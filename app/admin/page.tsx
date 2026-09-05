'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CustomCursor from '@/components/CustomCursor';
import {
  DynamicCanvasFile,
  getStoredCanvasFiles,
  saveCanvasFile,
  getStoredBlogPosts,
  saveBlogPost,
  getStoredApiKey,
  saveApiKey,
} from '@/lib/contentStore';
import { BlogPost } from '@/lib/blogData';

type AdminTab = 'uploads' | 'articles' | 'chat' | 'settings';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('uploads');
  const [apiKey, setApiKey] = useState('');
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  // Upload state
  const [uploadImageUrl, setUploadImageUrl] = useState('');
  const [uploadBrief, setUploadBrief] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<Partial<DynamicCanvasFile> | null>(null);
  const [savedUploadSuccess, setSavedUploadSuccess] = useState(false);
  const [canvasFiles, setCanvasFiles] = useState<DynamicCanvasFile[]>([]);

  // Article state
  const [articleTopic, setArticleTopic] = useState('');
  const [articleCategory, setArticleCategory] = useState<BlogPost['category']>('LIGHTING & ON-SET');
  const [articleNotes, setArticleNotes] = useState('');
  const [articleCover, setArticleCover] = useState('');
  const [isDraftingArticle, setIsDraftingArticle] = useState(false);
  const [draftedArticle, setDraftedArticle] = useState<BlogPost | null>(null);
  const [savedArticleSuccess, setSavedArticleSuccess] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hello Moiz. I am your studio AI Co-Pilot. I can help organize uploads, classify disciplines, generate aspect ratio strategies, and draft technical shoot breakdowns for your journal. What would you like to direct next?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  useEffect(() => {
    setApiKey(getStoredApiKey());
    setCanvasFiles(getStoredCanvasFiles());
    setBlogPosts(getStoredBlogPosts());
  }, []);

  // Save API Key
  const handleSaveApiKey = () => {
    saveApiKey(apiKey);
    setSavedKeySuccess(true);
    setTimeout(() => setSavedKeySuccess(false), 2500);
  };

  // 1. AI Upload Analysis
  const handleAnalyzeUpload = async () => {
    if (!uploadBrief.trim() && !uploadImageUrl.trim()) return;
    setIsAnalyzing(true);
    setAnalyzedData(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_upload',
          brief: uploadBrief,
          fileName: uploadImageUrl.split('/').pop() || 'upload-asset',
          geminiKey: apiKey,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnalyzedData({
          ...json.data,
          id: `custom-${Date.now()}`,
          img: uploadImageUrl || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop',
          x: Math.round(Math.random() * 800 - 400),
          y: Math.round(Math.random() * 800 - 400),
          rot: Math.round(Math.random() * 8 - 4),
        });
      }
    } catch (err) {
      console.error('Failed to analyze upload', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublishUpload = () => {
    if (!analyzedData || !analyzedData.name) return;
    const finalFile: DynamicCanvasFile = {
      id: analyzedData.id || `custom-${Date.now()}`,
      code: analyzedData.code || 'FILE_99.DIR',
      name: analyzedData.name || 'Untitled Project',
      discipline: analyzedData.discipline || 'Art Direction • Lookbook',
      year: analyzedData.year || '2026',
      role: analyzedData.role || 'Lead Art Director',
      x: analyzedData.x ?? 0,
      y: analyzedData.y ?? 0,
      rot: analyzedData.rot ?? 0,
      img: analyzedData.img || uploadImageUrl || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop',
      aspect: analyzedData.aspect || 'aspect-[16/10]',
      colorTag: analyzedData.colorTag || 'bg-[#ff3300]',
      desc: analyzedData.desc || 'Tactile commercial shoot direction.',
      deliverables: analyzedData.deliverables || ['Shoot Direction', 'Lighting Spec'],
    };

    saveCanvasFile(finalFile);
    setCanvasFiles(getStoredCanvasFiles());
    setSavedUploadSuccess(true);
    setTimeout(() => {
      setSavedUploadSuccess(false);
      setAnalyzedData(null);
      setUploadBrief('');
      setUploadImageUrl('');
    }, 2000);
  };

  // 2. AI Blog Drafting
  const handleDraftArticle = async () => {
    if (!articleTopic.trim()) return;
    setIsDraftingArticle(true);
    setDraftedArticle(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'write_article',
          topic: articleTopic,
          category: articleCategory,
          notes: articleNotes,
          geminiKey: apiKey,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const article: BlogPost = {
          ...json.data,
          coverImage: articleCover || 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop',
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase(),
          author: {
            name: 'Moiz Khan',
            role: 'Art Director & Brand Visual Designer',
            avatar: '/assets/logo.png',
          },
        };
        setDraftedArticle(article);
      }
    } catch (err) {
      console.error('Failed to draft article', err);
    } finally {
      setIsDraftingArticle(false);
    }
  };

  const handlePublishArticle = () => {
    if (!draftedArticle) return;
    saveBlogPost(draftedArticle);
    setBlogPosts(getStoredBlogPosts());
    setSavedArticleSuccess(true);
    setTimeout(() => {
      setSavedArticleSuccess(false);
      setDraftedArticle(null);
      setArticleTopic('');
      setArticleNotes('');
      setArticleCover('');
    }, 2000);
  };

  // 3. AI Co-Pilot Chat
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userMsg = { role: 'user' as const, content: chatInput };
    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatInput('');
    setIsChatting(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          messages: updated,
          geminiKey: apiKey,
        }),
      });

      const json = await res.json();
      if (json.success && json.reply) {
        setChatMessages([...updated, { role: 'assistant', content: json.reply }]);
      }
    } catch (err) {
      console.error('Chat error', err);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0f11] text-white select-none selection:bg-[#ff2a2a] selection:text-white">
      <CustomCursor />

      {/* Studio Top Control Bar */}
      <header className="sticky top-0 z-50 px-6 py-4 md:px-12 bg-[#17171a]/95 backdrop-blur-md border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00e575] animate-pulse" />
          <span className="font-mono text-xs tracking-wider uppercase font-bold text-white">
            MOIZ KHAN • STUDIO AI MANAGER
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-white/10 text-[9px] font-mono text-white/70">
            {apiKey ? 'GEMINI 1.5 ACTIVE' : 'DIRECTOR ENGINE ACTIVE'}
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs">
          <Link href="/" className="text-white/70 hover:text-white transition-colors uppercase">
            PORTFOLIO ↗
          </Link>
          <Link href="/blog" className="text-white/70 hover:text-white transition-colors uppercase">
            JOURNAL ↗
          </Link>
          <Link href="/canvas" className="text-[#ff2a2a] font-bold hover:underline transition-colors uppercase">
            CANVAS ↗
          </Link>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'uploads'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            ⚡ AI Upload Manager
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'articles'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            ✍️ AI Article Studio
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'chat'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            💬 AI Studio Co-Pilot
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'settings'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            ⚙️ AI Settings
          </button>
        </div>

        {/* TAB 1: AI UPLOAD & AUTO-TAGGER */}
        {activeTab === 'uploads' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-6 flex flex-col gap-5">
              <div className="bg-[#17171a] border border-white/10 rounded-2xl p-6">
                <span className="font-mono text-xs text-[#ff2a2a] tracking-widest uppercase block mb-1">
                  INGEST NEW ASSET
                </span>
                <h2 className="font-display font-black text-2xl uppercase tracking-tight mb-4">
                  AI Smart Tagger &amp; Classifier
                </h2>
                <p className="font-mono text-xs text-white/60 mb-6 leading-relaxed">
                  Provide an image URL and a brief note about the shoot. The AI analyzes lighting, discipline, and composition, generating production metadata and formatting it for the Limitless Canvas.
                </p>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="font-mono text-[11px] text-white/70 uppercase block mb-1.5">
                      Image URL (Direct link to high-res still)
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or /assets/..."
                      value={uploadImageUrl}
                      onChange={(e) => setUploadImageUrl(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff2a2a]"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[11px] text-white/70 uppercase block mb-1.5">
                      Shoot Brief / Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Flight deck cockpit lookbook shoot at dawn with aviation trainees, hard tungsten highlights on aircraft aluminum."
                      value={uploadBrief}
                      onChange={(e) => setUploadBrief(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff2a2a]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyzeUpload}
                    disabled={isAnalyzing || (!uploadBrief && !uploadImageUrl)}
                    className="w-full py-3 bg-[#ff2a2a] hover:bg-[#ff4444] disabled:opacity-40 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all mt-2"
                  >
                    {isAnalyzing ? '⚡ AI IS ANALYZING ASSET...' : '⚡ AI ANALYZE & AUTO-TAG ASSET'}
                  </button>
                </div>
              </div>

              {/* Uploaded Files Gallery */}
              {canvasFiles.length > 0 && (
                <div className="bg-[#17171a] border border-white/10 rounded-2xl p-6">
                  <span className="font-mono text-xs text-white/50 tracking-widest uppercase block mb-3">
                    CUSTOM ARCHIVED CANVAS ASSETS ({canvasFiles.length})
                  </span>
                  <div className="flex flex-col gap-3">
                    {canvasFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${file.colorTag}`} />
                          <div>
                            <span className="font-mono text-xs font-bold block">{file.name}</span>
                            <span className="font-mono text-[10px] text-white/50">{file.code} • {file.discipline}</span>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-[#00e575]">ACTIVE ON CANVAS</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live Canvas Preview Panel */}
            <div className="lg:col-span-6">
              <div className="bg-[#17171a] border border-white/10 rounded-2xl p-6">
                <span className="font-mono text-xs text-white/50 tracking-widest uppercase block mb-1">
                  LIVE FOLDER PREVIEW
                </span>
                <h3 className="font-display font-bold text-xl uppercase mb-6">
                  Archival Canvas Placement
                </h3>

                {analyzedData ? (
                  <div className="flex flex-col gap-6">
                    {/* Archival Folder Mockup */}
                    <div className="p-8 bg-[#faf9f6] text-[#0d0d0e] rounded-2xl flex items-center justify-center">
                      <div className="relative w-[210px] pt-14 pb-4 px-4 bg-[#ede8df] rounded-[12px] shadow-lg">
                        {/* Folder Tab */}
                        <div className="absolute -top-3 left-4 px-3 py-1 bg-[#ded8cc] rounded-t-[6px] flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${analyzedData.colorTag || 'bg-[#ff3300]'}`} />
                          <span className="font-mono text-[9px] font-bold text-black/70">
                            {analyzedData.code}
                          </span>
                        </div>

                        {/* Peeking Image */}
                        <div className="absolute -top-10 inset-x-3 h-[105px] rounded-[8px] overflow-hidden bg-black/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={analyzedData.img}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="relative z-20 mt-10 pt-2.5">
                          <h4 className="font-bold text-xs leading-tight text-black line-clamp-2">
                            {analyzedData.name}
                          </h4>
                          <p className="font-mono text-[9px] text-black/60 mt-1 truncate">
                            {analyzedData.discipline}
                          </p>
                          <div className="mt-2.5 flex items-center justify-between text-[8px] font-mono text-black/40 pt-1.5 border-t border-black/10">
                            <span>{analyzedData.year || '2026'}</span>
                            <span className="text-[#ff3300] font-bold">PEEK ↗</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Review & Edit */}
                    <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                      <div>
                        <span className="text-white/50 block text-[10px]">PROJECT NAME</span>
                        <input
                          type="text"
                          value={analyzedData.name || ''}
                          onChange={(e) => setAnalyzedData({ ...analyzedData, name: e.target.value })}
                          className="w-full bg-black/40 border border-white/20 rounded px-2.5 py-1 text-white font-bold"
                        />
                      </div>
                      <div>
                        <span className="text-white/50 block text-[10px]">DISCIPLINE</span>
                        <input
                          type="text"
                          value={analyzedData.discipline || ''}
                          onChange={(e) => setAnalyzedData({ ...analyzedData, discipline: e.target.value })}
                          className="w-full bg-black/40 border border-white/20 rounded px-2.5 py-1 text-white font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="font-mono text-[10px] text-white/50 block mb-1">DIRECTOR NARRATIVE</span>
                      <textarea
                        rows={2}
                        value={analyzedData.desc || ''}
                        onChange={(e) => setAnalyzedData({ ...analyzedData, desc: e.target.value })}
                        className="w-full bg-black/40 border border-white/20 rounded px-2.5 py-1 font-mono text-xs text-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handlePublishUpload}
                      className="w-full py-3 bg-[#00e575] hover:bg-[#00c565] text-black font-mono text-xs font-bold tracking-wider uppercase rounded-lg transition-all"
                    >
                      {savedUploadSuccess ? '✓ PUBLISHED TO LIMITLESS CANVAS!' : '🚀 PUBLISH TO LIMITLESS CANVAS ARCHIVE'}
                    </button>
                  </div>
                ) : (
                  <div className="h-64 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center p-6">
                    <span className="font-mono text-xs text-white/40 mb-2">AWAITING ASSET INGESTION</span>
                    <p className="font-mono text-[11px] text-white/30 max-w-xs">
                      Enter an image link or shoot brief on the left, then click Analyze.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI ARTICLE STUDIO */}
        {activeTab === 'articles' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-[#17171a] border border-white/10 rounded-2xl p-6">
                <span className="font-mono text-xs text-[#ff2a2a] tracking-widest uppercase block mb-1">
                  NEW JOURNAL ESSAY
                </span>
                <h2 className="font-display font-black text-2xl uppercase tracking-tight mb-4">
                  AI Editorial Ghostwriter
                </h2>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="font-mono text-[11px] text-white/70 uppercase block mb-1.5">
                      Essay Topic / Concept
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ACES Color Pipelines for Heritage Silk"
                      value={articleTopic}
                      onChange={(e) => setArticleTopic(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff2a2a]"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[11px] text-white/70 uppercase block mb-1.5">
                      Category
                    </label>
                    <select
                      value={articleCategory}
                      onChange={(e) => setArticleCategory(e.target.value as BlogPost['category'])}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white focus:outline-none focus:border-[#ff2a2a]"
                    >
                      <option value="LIGHTING & ON-SET">LIGHTING &amp; ON-SET</option>
                      <option value="TYPOGRAPHY">TYPOGRAPHY</option>
                      <option value="MOTION & EDITORIAL">MOTION &amp; EDITORIAL</option>
                      <option value="CASE STUDY">CASE STUDY</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-mono text-[11px] text-white/70 uppercase block mb-1.5">
                      Cover Image URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={articleCover}
                      onChange={(e) => setArticleCover(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff2a2a]"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[11px] text-white/70 uppercase block mb-1.5">
                      Rough Directorial Notes / Thoughts
                    </label>
                    <textarea
                      rows={4}
                      placeholder="e.g. We avoided digital saturation. Used continuous tungsten lights. Kept highlight rolloff gentle."
                      value={articleNotes}
                      onChange={(e) => setArticleNotes(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff2a2a]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleDraftArticle}
                    disabled={isDraftingArticle || !articleTopic}
                    className="w-full py-3 bg-[#ff2a2a] hover:bg-[#ff4444] disabled:opacity-40 rounded-lg font-mono text-xs font-bold tracking-wider uppercase transition-all mt-2"
                  >
                    {isDraftingArticle ? '✍️ DRAFTING ESSAY WITH AI...' : '✍️ DRAFT ARTICLE WITH AI COPILOT'}
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Article Preview Panel */}
            <div className="lg:col-span-7">
              <div className="bg-[#17171a] border border-white/10 rounded-2xl p-6">
                <span className="font-mono text-xs text-white/50 tracking-widest uppercase block mb-1">
                  ARTICLE PREVIEW
                </span>
                <h3 className="font-display font-bold text-xl uppercase mb-6">
                  Publication Layout
                </h3>

                {draftedArticle ? (
                  <div className="flex flex-col gap-6">
                    <div className="p-6 bg-[#faf9f6] text-[#0d0d0e] rounded-xl">
                      <div className="flex items-center gap-2 font-mono text-[10px] text-black/50 mb-2 uppercase">
                        <span className="px-2 py-0.5 bg-black/10 rounded-full font-bold text-black">{draftedArticle.category}</span>
                        <span>•</span>
                        <span>{draftedArticle.readTime}</span>
                      </div>
                      <h3 className="font-display font-black text-2xl uppercase mb-2">
                        {draftedArticle.title}
                      </h3>
                      <p className="font-mono text-xs text-black/70 mb-4 pb-3 border-b border-black/10">
                        {draftedArticle.subtitle}
                      </p>
                      <div className="flex flex-col gap-3 font-sans text-sm text-black/80 leading-relaxed">
                        {draftedArticle.content.map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handlePublishArticle}
                      className="w-full py-3 bg-[#00e575] hover:bg-[#00c565] text-black font-mono text-xs font-bold tracking-wider uppercase rounded-lg transition-all"
                    >
                      {savedArticleSuccess ? '✓ PUBLISHED TO JOURNAL!' : '🚀 PUBLISH TO STANDALONE JOURNAL'}
                    </button>
                  </div>
                ) : (
                  <div className="h-64 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center p-6">
                    <span className="font-mono text-xs text-white/40 mb-2">AWAITING ARTICLE DRAFT</span>
                    <p className="font-mono text-[11px] text-white/30 max-w-xs">
                      Enter a concept on the left and click Draft to generate an editorial breakdown.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI STUDIO CO-PILOT CHAT */}
        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto bg-[#17171a] border border-white/10 rounded-2xl flex flex-col h-[650px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-black/40 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#00e575]" />
                <span className="font-mono text-xs font-bold tracking-wider uppercase">
                  MOIZ AI STUDIO CO-PILOT
                </span>
              </div>
              <span className="font-mono text-[10px] text-white/50">DIRECTOR LEVEL PROTOCOL</span>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 font-mono text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-xl leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-[#ff2a2a] text-white rounded-br-none'
                        : 'bg-black/60 border border-white/10 text-white/90 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatting && (
                <div className="flex justify-start">
                  <div className="p-4 bg-black/60 border border-white/10 rounded-xl text-white/50 animate-pulse">
                    Moiz Co-Pilot is reasoning...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChatMessage} className="p-4 bg-black/60 border-t border-white/10 flex gap-3">
              <input
                type="text"
                placeholder="Ask about lighting, aspect ratios, typography systems, or asset organization..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff2a2a]"
              />
              <button
                type="submit"
                disabled={isChatting || !chatInput.trim()}
                className="px-6 py-2.5 bg-white text-black hover:bg-[#ff2a2a] hover:text-white disabled:opacity-40 rounded-lg font-mono text-xs font-bold uppercase transition-all"
              >
                SEND
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: SETTINGS & STORAGE */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-[#17171a] border border-white/10 rounded-2xl p-8">
            <span className="font-mono text-xs text-[#ff2a2a] tracking-widest uppercase block mb-1">
              ENGINE CONFIGURATION
            </span>
            <h2 className="font-display font-black text-2xl uppercase tracking-tight mb-4">
              Google Gemini API Integration
            </h2>
            <p className="font-mono text-xs text-white/70 leading-relaxed mb-6">
              Connect your Google Gemini API key to enable live generative intelligence for asset analysis, article ghostwriting, and studio copilot chat. If no key is set, the system seamlessly uses the built-in studio director engine.
            </p>

            <div className="flex flex-col gap-4 mb-8">
              <div>
                <label className="font-mono text-[11px] text-white/70 uppercase block mb-1.5">
                  Gemini API Key (AIzaSy...)
                </label>
                <input
                  type="password"
                  placeholder="Paste your Gemini API key here"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-lg font-mono text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff2a2a]"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveApiKey}
                className="w-full py-2.5 bg-white text-black hover:bg-[#00e575] font-mono text-xs font-bold uppercase rounded-lg transition-colors"
              >
                {savedKeySuccess ? '✓ SAVED TO SECURE BROWSER STORAGE!' : 'SAVE GEMINI API KEY'}
              </button>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-xl font-mono text-xs text-white/60">
              <span className="font-bold text-white uppercase block mb-1">PRO-TIP: CLOUD DEPLOYMENT</span>
              You can also set <code className="text-[#00e575]">GEMINI_API_KEY</code> in your Vercel project environment variables, and the backend API will automatically detect and use it for all requests worldwide.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
