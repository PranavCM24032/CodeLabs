import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowLeft,
  X,
  FlaskConical,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getEvents, getProblemsForEvent, saveProblem, recordAuditLog } from '../../services/firestoreService';
import { HackathonEvent, ProblemStatement } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const ProblemManagerPage: React.FC = () => {
  const { user } = useAuth();
  const [activeEvent, setActiveEvent] = useState<HackathonEvent | null>(null);
  const [problems, setProblems] = useState<ProblemStatement[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [track, setTrack] = useState('AI & Machine Learning');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'open'>('intermediate');
  const [maxCapacity, setMaxCapacity] = useState(20);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      const evts = await getEvents();
      if (evts && evts.length > 0) {
        const evt = evts[0];
        setActiveEvent(evt);
        const list = await getProblemsForEvent(evt.id);
        setProblems(list || []);
      }
    } catch (err) {
      console.error('Failed to load problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setCode(`TRK-${Math.floor(10 + Math.random() * 90)}`);
    setTrack('Chemical Forensics & AST');
    setSummary('');
    setDescription('');
    setDifficulty('intermediate');
    setMaxCapacity(20);
    setShowModal(true);
  };

  const openEditModal = (prob: ProblemStatement) => {
    setEditingId(prob.id);
    setTitle(prob.title);
    setCode(prob.code);
    setTrack(prob.track);
    setSummary(prob.summary);
    setDescription(prob.description);
    setDifficulty(prob.difficulty);
    setMaxCapacity(prob.maxCapacity);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !user) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const probId = editingId || `prob_${Date.now()}`;
      const payload: ProblemStatement = {
        id: probId,
        eventId: activeEvent.id,
        title: title.trim(),
        code: code.trim().toUpperCase(),
        track: track.trim(),
        summary: summary.trim(),
        description: description.trim(),
        difficulty,
        maxCapacity: Number(maxCapacity),
        currentCount: editingId ? problems.find((p) => p.id === editingId)?.currentCount || 0 : 0,
        status: 'published',
      };

      await saveProblem(activeEvent.id, payload);

      await recordAuditLog({
        actorId: user.uid,
        actorEmail: user.email || '',
        action: editingId ? 'PROBLEM_UPDATED' : 'PROBLEM_CREATED',
        entityType: 'ProblemStatement',
        entityId: probId,
        eventId: activeEvent.id,
        details: `Saved problem statement "${payload.title}" (${payload.code})`,
      });

      setProblems((prev) => {
        if (editingId) return prev.map((p) => (p.id === probId ? payload : p));
        return [...prev, payload];
      });

      setShowModal(false);
      setFeedback({
        type: 'success',
        text: `Problem statement "${payload.title}" successfully saved!`,
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to save problem.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link
          to="/superadmin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Root Director Console
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px] font-bold mb-2 shadow-xs">
              <FlaskConical className="w-3.5 h-3.5 text-amber-700" />
              <span>codeLab Reagent Tracks</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Chemical Challenge Tracks
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Configure track categories, squad limits, and specimen scopes for {activeEvent?.title || 'active event'}.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="clay-btn-primary py-3 px-5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Challenge Track
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold shadow-xs ${
            feedback.type === 'success'
              ? 'clay-card-green text-emerald-950 border-emerald-300'
              : 'clay-card-orange text-orange-950 border-orange-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-orange-700 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Grid of Problems */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {problems.map((p) => (
          <div
            key={p.id}
            className="clay-card p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] uppercase font-mono font-black px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                  {p.code}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                  {p.difficulty}
                </span>
              </div>

              <div className="text-xs text-amber-800 font-bold mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-700" />
                {p.track}
              </div>

              <h3 className="text-base font-black text-stone-900 mb-2 leading-snug">{p.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">{p.summary}</p>
            </div>

            <div className="border-t border-stone-200 pt-3">
              <div className="flex justify-between items-center text-xs text-stone-600 mb-3 font-semibold">
                <span>Enrolled Squads:</span>
                <span className="font-mono text-stone-900 font-bold">{p.currentCount} / {p.maxCapacity}</span>
              </div>

              <button
                onClick={() => openEditModal(p)}
                className="w-full py-2.5 px-4 rounded-xl clay-btn-yellow text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5 text-amber-800" /> Edit Problem Statement
              </button>
            </div>
          </div>
        ))}
        {problems.length === 0 && (
          <div className="col-span-full clay-card p-12 text-center text-stone-500 font-semibold">
            No research tracks defined yet. Click "Add Challenge Track" to initialize the first problem.
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="clay-card p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-stone-200 mb-6">
              <h2 className="text-lg font-black text-stone-900">
                {editingId ? 'Edit Challenge Track' : 'Create New Challenge Track'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Track Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chemical AST Plagiarism Synthesizer"
                  className="clay-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="clay-input uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Track</label>
                  <input
                    type="text"
                    required
                    value={track}
                    onChange={(e) => setTrack(e.target.value)}
                    className="clay-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="clay-input"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="open">Open</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Max Squad Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(parseInt(e.target.value, 10))}
                    className="clay-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Short Summary</label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Core objective of this research track..."
                  className="clay-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">Scope & Benchmarks</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Technical scope, acceptable stacks, evaluation criteria..."
                  className="clay-input"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="clay-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold shadow-md"
                >
                  {submitting ? 'Saving...' : 'Save Problem Statement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
