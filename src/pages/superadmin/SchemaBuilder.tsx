import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { saveEvaluationSchema, recordAuditLog } from '../../services/firestoreService';
import { SchemaCriterion } from '../../types';

export const SchemaBuilderPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'visual' | 'json' | 'preview'>('visual');
  const [doubleBlind, setDoubleBlind] = useState(true);
  const [schemaName, setSchemaName] = useState('Technical Forensics & Architecture Schema');
  const [roundName, setRoundName] = useState('Round 1: Preliminary Code & Prototype Audit');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [criteria, setCriteria] = useState<SchemaCriterion[]>([
    {
      id: 'crit-01',
      label: 'CRIT-01: Code Architecture & Modularity',
      description: 'Clean separation of concerns, concurrency primitives, modular API design.',
      weight: 30,
      maxMarks: 30,
      order: 1,
      type: 'rubric',
      required: true,
      rubricLevels: [
        { label: 'Exceptional', points: 30, description: '27.0 - 30.0 pts' },
        { label: 'Proficient', points: 25, description: '22.0 - 26.5 pts' },
        { label: 'Basic Core', points: 20, description: '15.0 - 21.5 pts' },
        { label: 'Subpar / Flawed', points: 10, description: '< 15.0 pts' },
      ],
    },
    {
      id: 'crit-02',
      label: 'CRIT-02: Repository Forensics & Cadence',
      description: 'Authentic multi-author velocity across timeline. Validated Git SHA signatures with zero late bulk dumps.',
      weight: 40,
      maxMarks: 40,
      order: 2,
      type: 'rubric',
      required: true,
      rubricLevels: [
        { label: 'Continuous Velocity', points: 40, description: '36.0 - 40.0 pts' },
        { label: 'Adequate Cadence', points: 32, description: '28.0 - 35.5 pts' },
        { label: 'Irregular Spikes', points: 22, description: '18.0 - 27.5 pts' },
        { label: 'Plagiarism / Dump', points: 5, description: '< 18.0 pts' },
      ],
    },
    {
      id: 'crit-03',
      label: 'CRIT-03: Functional Deliverable & Benchmark',
      description: 'Throughput benchmarks, latency SLA, end-to-end runnable integration test suite.',
      weight: 30,
      maxMarks: 30,
      order: 3,
      type: 'numeric',
      required: true,
      rubricLevels: [
        { label: 'Production Ready', points: 30, description: '27.0 - 30.0 pts' },
        { label: 'Functional Prototype', points: 24, description: '21.0 - 26.5 pts' },
        { label: 'Partial Execution', points: 15, description: '12.0 - 20.5 pts' },
        { label: 'Non-Functional', points: 0, description: '< 12.0 pts' },
      ],
    },
  ]);

  const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);

  const handleAddCriterion = () => {
    const nextNum = criteria.length + 1;
    const newCrit: SchemaCriterion = {
      id: `crit-0${nextNum}`,
      label: `CRIT-0${nextNum}: New Evaluation Parameter`,
      description: 'Define specific objective measurement benchmarks.',
      weight: 10,
      maxMarks: 10,
      order: nextNum,
      type: 'rubric',
      required: true,
      rubricLevels: [
        { label: 'Exemplary', points: 10, description: '9.0 - 10.0 pts' },
        { label: 'Competent', points: 7, description: '6.0 - 8.5 pts' },
        { label: 'Unsatisfactory', points: 3, description: '< 6.0 pts' },
      ],
    };
    setCriteria([...criteria, newCrit]);
  };

  const handleDeleteCriterion = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveEvaluationSchema('event-hackgrid-2025', {
        id: 'dev-sch-409',
        eventId: 'event-hackgrid-2025',
        roundId: 'round_1',
        name: schemaName,
        version: 1,
        status: 'published',
        totalMaxMarks: totalWeight,
        criteria,
        createdBy: user?.uid || 'superadmin',
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      });
      if (user?.uid) {
        await recordAuditLog({
          actorId: user.uid,
          actorEmail: user.email || 'sysadmin@gittrack.internal',
          action: 'SCHEMA_UPDATE',
          entityType: 'schema',
          entityId: 'dev-sch-409',
          details: JSON.stringify({ name: schemaName, totalWeight }),
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative w-full pt-16 pb-24 bg-surface min-h-screen">
      <div className="flex flex-col w-full px-4 max-w-4xl mx-auto py-3 space-y-4">
        {/* Top Context & Live Score Allocator */}
        <div className="bg-surface-container-low rounded-xl p-4 shadow-md flex flex-col gap-3 border border-surface-container">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-code-sm text-code-sm uppercase tracking-wide">
                  DRAFT v2.5
                </span>
                <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-code-sm text-code-sm">
                  DEV-SCH-409
                </span>
              </div>
              <h1 className="font-headline-sm text-headline-sm text-on-surface mt-1 truncate font-bold">
                Schema Builder: InterCollege HackGrid 2025 (Round 1)
              </h1>
            </div>
            <button
              className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
              title="Audit Revision History"
            >
              <span className="material-symbols-outlined text-[18px]">history</span>
            </button>
          </div>

          {/* Weight Progress Gauge */}
          <div className="bg-surface-container rounded-lg p-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">verified</span>
                Allocated Weight Balance
              </span>
              <span
                className={`font-code-sm text-code-sm font-semibold ${
                  totalWeight === 100 ? 'text-secondary' : 'text-error'
                }`}
                id="weight-label"
              >
                {totalWeight}% ({totalWeight} / 100 PTS)
              </span>
            </div>
            <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden flex">
              {criteria.map((c, i) => (
                <div
                  key={c.id}
                  className={`h-full ${
                    i === 0 ? 'bg-primary' : i === 1 ? 'bg-tertiary ml-0.5' : 'bg-secondary ml-0.5'
                  }`}
                  style={{ width: `${c.weight}%` }}
                  title={`${c.label}: ${c.weight}%`}
                ></div>
              ))}
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-code-sm text-code-sm pt-0.5 flex-wrap gap-2">
              {criteria.map((c, i) => (
                <span key={c.id} className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      i === 0 ? 'bg-primary' : i === 1 ? 'bg-tertiary' : 'bg-secondary'
                    }`}
                  ></span>
                  {c.label.split(':')[0]} {c.weight}%
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Mode Tabs */}
        <div className="grid grid-cols-3 bg-surface-container-lowest p-1 rounded-xl shadow-sm gap-1 border border-surface-container">
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg font-label-md text-label-md shadow-sm transition-all cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-surface-container-high text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
            id="tab-visual"
          >
            <span className="material-symbols-outlined text-[16px]">view_quilt</span>
            <span className="truncate">Visual Builder</span>
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
              activeTab === 'json'
                ? 'bg-surface-container-high text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
            id="tab-json"
          >
            <span className="material-symbols-outlined text-[16px]">code</span>
            <span className="truncate">JSON Spec</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-surface-container-high text-primary font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
            id="tab-preview"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span className="truncate">Live Preview</span>
          </button>
        </div>

        {activeTab === 'visual' && (
          <>
            {/* Schema Metadata Card */}
            <div className="bg-surface-container-low rounded-xl p-4 shadow-md space-y-4 border border-surface-container">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">settings_suggest</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Configuration
                  </span>
                </div>
                <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">
                  Immutable in Eval
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">Schema Name</label>
                  <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2.5 rounded-lg focus-within:bg-surface-container-high transition-colors border border-surface-container">
                    <span className="material-symbols-outlined text-[18px] text-outline">tune</span>
                    <input
                      className="bg-transparent text-on-surface font-body-md text-body-md w-full outline-none focus:outline-none"
                      type="text"
                      value={schemaName}
                      onChange={(e) => setSchemaName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                    Target Round Context
                  </label>
                  <div className="flex items-center justify-between bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-surface-container">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-[18px] text-tertiary">hub</span>
                      <span className="font-body-md text-body-md text-on-surface truncate">{roundName}</span>
                    </div>
                    <span className="material-symbols-outlined text-outline text-[18px]">unfold_more</span>
                  </div>
                </div>

                {/* Toggle: Double-Blind */}
                <div className="flex items-center justify-between bg-surface-container p-4 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center flex-shrink-0 text-primary">
                      <span className="material-symbols-outlined text-[18px]">visibility_off</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-on-surface truncate font-semibold">
                        Double-Blind Evaluation
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        Sanitize author &amp; repository identifiers
                      </span>
                    </div>
                  </div>
                  {/* Switch */}
                  <button
                    onClick={() => setDoubleBlind(!doubleBlind)}
                    className={`w-11 h-6 rounded-full relative p-0.5 transition-colors cursor-pointer ${
                      doubleBlind ? 'bg-primary' : 'bg-surface-container-highest'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full transition-transform duration-200 ${
                        doubleBlind
                          ? 'translate-x-5 bg-on-primary-fixed'
                          : 'translate-x-0 bg-on-surface-variant'
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
            </div>

            {/* Criteria Stack Header */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[20px]">account_tree</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Evaluation Criteria
                </h2>
              </div>
              <span className="font-code-sm text-code-sm text-on-surface-variant">{criteria.length} Criteria Defined</span>
            </div>

            {/* Visual Cards Container */}
            <div className="space-y-4" id="criteria-stack">
              {criteria.map((crit) => (
                <div
                  key={crit.id}
                  className="bg-surface-container-low rounded-xl p-4 shadow-md space-y-3 transition-all hover:bg-surface-container border border-surface-container"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-outline p-1" title="Priority rank">
                        <span className="material-symbols-outlined text-[20px]">drag_indicator</span>
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-code-sm text-code-sm font-semibold text-primary">
                            {crit.label.split(':')[0]}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-surface-container-highest text-on-surface-variant font-code-sm text-code-sm">
                            Weight: {crit.weight}%
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary font-code-sm text-code-sm">
                            Max: {crit.maxMarks} PTS
                          </span>
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface mt-0.5 truncate font-semibold">
                          {crit.label.includes(':') ? crit.label.split(':')[1].trim() : crit.label}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleDeleteCriterion(crit.id)}
                        className="p-1 text-error hover:bg-error-container/30 rounded transition-colors cursor-pointer"
                        title="Delete criterion"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>

                  <p className="font-body-sm text-body-sm text-on-surface-variant pl-7">{crit.description}</p>

                  {/* Input Type Badge & Rubric Breakdown */}
                  <div className="ml-7 bg-surface-container-lowest rounded-lg p-3 space-y-3 border border-surface-container">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-on-surface-variant font-code-sm text-code-sm">
                        <span className="material-symbols-outlined text-[14px] text-tertiary">tune</span>
                        Type: Tiered Rubric + Numeric Stepper
                      </div>
                      <span className="font-code-sm text-code-sm text-secondary">
                        {crit.rubricLevels?.length || 4} Tiers Defined
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-code-sm text-code-sm">
                      {crit.rubricLevels?.map((lvl, lidx) => (
                        <div key={lidx} className="bg-surface-container p-2 rounded flex flex-col">
                          <span
                            className={`font-semibold ${
                              lidx === 0
                                ? 'text-secondary'
                                : lidx === 1
                                ? 'text-tertiary'
                                : lidx === 2
                                ? 'text-primary'
                                : 'text-error'
                            }`}
                          >
                            {lvl.label}
                          </span>
                          <span className="text-on-surface-variant text-[11px] mt-0.5">{lvl.description}</span>
                        </div>
                      ))}
                    </div>

                    {/* Checkbox Row */}
                    <div className="flex items-center gap-4 pt-1 text-on-surface-variant font-body-sm text-body-sm flex-wrap">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <span
                          className="material-symbols-outlined text-[16px] text-primary"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_box
                        </span>
                        <span>Required field</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <span
                          className="material-symbols-outlined text-[16px] text-secondary"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_box
                        </span>
                        <span>Linked Git evidence required</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Criterion Trigger Button */}
              <button
                onClick={handleAddCriterion}
                className="w-full py-3 border-2 border-dashed border-surface-container-highest hover:border-primary/60 rounded-xl text-on-surface-variant hover:text-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                <span>Add Evaluation Criterion</span>
              </button>
            </div>
          </>
        )}

        {/* JSON Spec Tab */}
        {activeTab === 'json' && (
          <div className="bg-surface-container-low rounded-xl p-4 shadow-md border border-surface-container space-y-3">
            <div className="flex items-center justify-between text-xs text-on-surface-variant font-code-sm">
              <span>FORMAT: JSON SPECIFICATION SCHEMA</span>
              <span className="text-secondary">VALIDATED</span>
            </div>
            <pre className="p-4 bg-surface-container-lowest rounded-lg font-code-sm text-code-sm text-primary overflow-x-auto">
              {JSON.stringify(
                {
                  id: 'dev-sch-409',
                  schemaName,
                  roundContext: roundName,
                  doubleBlind,
                  totalWeight,
                  criteria,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}

        {/* Live Preview Tab */}
        {activeTab === 'preview' && (
          <div className="bg-surface-container-low rounded-xl p-5 shadow-md border border-surface-container space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Judge Evaluation Form Preview
              </h3>
              <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-label-sm text-label-sm">
                Double-Blind: {doubleBlind ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {criteria.map((c) => (
              <div key={c.id} className="p-3 bg-surface-container rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-body-md text-on-surface font-semibold">{c.label}</span>
                  <span className="font-code-sm text-code-sm text-primary">{c.weight} PTS MAX</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{c.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {c.rubricLevels?.map((l, i) => (
                    <button
                      key={i}
                      className="p-2 rounded bg-surface-container-high hover:bg-surface-bright text-xs text-center border border-surface-container-highest cursor-pointer"
                    >
                      <div className="font-semibold text-on-surface">{l.label}</div>
                      <div className="text-[10px] text-on-surface-variant">{l.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sticky Validation & Publication Toolbar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-surface-container p-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${totalWeight === 100 ? 'bg-secondary' : 'bg-error animate-ping'}`}
            ></span>
            <span className="font-code-sm text-code-sm text-on-surface">
              Weight: <strong>{totalWeight}%</strong> {totalWeight === 100 ? '(Balanced)' : '(Must equal 100%)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-secondary font-code-sm text-code-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">done</span> Deployed
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || totalWeight !== 100}
              className="h-10 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-semibold flex items-center gap-2 shadow-md hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">
                {saving ? 'sync' : 'published_with_changes'}
              </span>
              <span>{saving ? 'Deploying...' : 'Save Schema & Deploy to Judges'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
