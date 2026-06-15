// ============================================================
// நினைவு (Ninaivu) — Study Hub Page
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Plus, BookOpen, FileText, Clock, Timer, Calendar, Trash2,
} from 'lucide-react';
import TopBar from '../../components/layout/TopBar';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { formatDate, formatDuration } from '../../utils/helpers';
import { DEFAULT_SUBJECTS } from '../../utils/constants';
import * as Icons from 'lucide-react';

type IconName = keyof typeof Icons;
function getIcon(name: string, size = 20) {
  const Comp = Icons[name as IconName] as React.ComponentType<{ size: number }>;
  return Comp ? <Comp size={size} /> : null;
}

export default function StudyHubPage() {
  const { subjects, notes, exams, studySessions, addItem, deleteItem } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'subjects' | 'notes' | 'exams' | 'timer'>('subjects');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);

  // Forms
  const [subjectForm, setSubjectForm] = useState({ name: '', color: '#6366F1', icon: 'BookOpen' });
  const [noteForm, setNoteForm] = useState({ title: '', content: '', subject_id: '', type: 'note' as const });
  const [examForm, setExamForm] = useState({ title: '', subject_id: '', exam_date: '', notes: '' });

  // Calculate study stats
  const todayMinutes = studySessions
    .filter((s) => new Date(s.started_at).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.duration_minutes, 0);

  const weekMinutes = studySessions
    .filter((s) => {
      const d = new Date(s.started_at);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo;
    })
    .reduce((sum, s) => sum + s.duration_minutes, 0);

  const handleAddSubject = async () => {
    if (!subjectForm.name.trim()) return;
    await addItem('subjects', subjectForm);
    setSubjectForm({ name: '', color: '#6366F1', icon: 'BookOpen' });
    setShowAddSubject(false);
    showToast('Subject added!', 'success');
  };

  const handleAddNote = async () => {
    if (!noteForm.title.trim()) return;
    await addItem('notes', { ...noteForm, subject_id: noteForm.subject_id || null, tags: [] });
    setNoteForm({ title: '', content: '', subject_id: '', type: 'note' });
    setShowAddNote(false);
    showToast('Note added!', 'success');
  };

  const handleAddExam = async () => {
    if (!examForm.title.trim() || !examForm.exam_date) return;
    await addItem('exams', {
      ...examForm,
      subject_id: examForm.subject_id || null,
      exam_date: new Date(examForm.exam_date).toISOString(),
    });
    setExamForm({ title: '', subject_id: '', exam_date: '', notes: '' });
    setShowAddExam(false);
    showToast('Exam added!', 'success');
  };

  const addDefaultSubjects = async () => {
    for (const sub of DEFAULT_SUBJECTS) {
      await addItem('subjects', sub);
    }
    showToast('Default subjects added!', 'success');
  };

  return (
    <>
      <TopBar title="Study Hub" subtitle={`${formatDuration(todayMinutes)} studied today`} />

      <div className="page">
        {/* Study Stats */}
        <div className="grid grid-4 mb-6 animate-fadeInUp">
          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                <Clock size={20} />
              </div>
              <span className="stat-card-value">{formatDuration(todayMinutes)}</span>
              <span className="stat-card-label">Today</span>
            </div>
          </div>
          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                <Timer size={20} />
              </div>
              <span className="stat-card-value">{formatDuration(weekMinutes)}</span>
              <span className="stat-card-label">This Week</span>
            </div>
          </div>
          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
                <FileText size={20} />
              </div>
              <span className="stat-card-value">{notes.length}</span>
              <span className="stat-card-label">Notes</span>
            </div>
          </div>
          <div className="card card-gradient">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>
                <Calendar size={20} />
              </div>
              <span className="stat-card-value">{exams.length}</span>
              <span className="stat-card-label">Exams</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs mb-6">
          {([['subjects', 'Subjects'], ['notes', 'Notes'], ['exams', 'Exams'], ['timer', 'Focus Timer']] as const).map(([key, label]) => (
            <button key={key} className={`tab ${activeTab === key ? 'tab-active' : ''}`} onClick={() => key === 'timer' ? navigate('/study/timer') : setActiveTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* Subjects Tab */}
        {activeTab === 'subjects' && (
          <>
            {subjects.length === 0 ? (
              <EmptyState
                icon={<BookOpen size={32} />}
                title="No subjects yet"
                description="Add your subjects to organize your study materials."
                action={
                  <div className="flex gap-2">
                    <button className="btn btn-secondary" onClick={addDefaultSubjects}>Add Defaults</button>
                    <button className="btn btn-primary" onClick={() => setShowAddSubject(true)}>Add Subject</button>
                  </div>
                }
              />
            ) : (
              <div className="grid grid-2 gap-3">
                {subjects.map((sub) => (
                  <div key={sub.id} className="card card-interactive animate-fadeInUp">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="stat-card-icon" style={{ background: `${sub.color}18`, color: sub.color }}>
                        {getIcon(sub.icon, 20)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{sub.name}</div>
                        <div className="text-xs text-muted">
                          {notes.filter((n) => n.subject_id === sub.id).length} notes
                        </div>
                      </div>
                      <button className="btn btn-icon btn-ghost" onClick={() => { deleteItem('subjects', sub.id); showToast('Subject deleted', 'info'); }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="fab" onClick={() => setShowAddSubject(true)} id="fab-add-subject">
              <Plus size={24} />
            </button>
          </>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <>
            {notes.length === 0 ? (
              <EmptyState
                icon={<FileText size={32} />}
                title="No notes yet"
                description="Start adding notes for your subjects."
                action={<button className="btn btn-primary" onClick={() => setShowAddNote(true)}>Add Note</button>}
              />
            ) : (
              <div className="flex flex-col gap-2">
                {notes.map((note) => (
                  <div key={note.id} className="card card-interactive animate-fadeInUp" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <div className="flex items-center gap-3">
                      <FileText size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <div className="list-item-title">{note.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="badge badge-primary" style={{ fontSize: '10px' }}>{note.type.replace('_', ' ')}</span>
                          <span className="text-xs text-muted">{formatDate(note.created_at)}</span>
                        </div>
                      </div>
                      <button className="btn btn-icon btn-ghost" onClick={() => { deleteItem('notes', note.id); showToast('Note deleted', 'info'); }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                    {note.content && (
                      <p className="text-sm text-secondary mt-2" style={{ marginLeft: 'calc(18px + var(--space-3))', lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {note.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button className="fab" onClick={() => setShowAddNote(true)} id="fab-add-note">
              <Plus size={24} />
            </button>
          </>
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <>
            {exams.length === 0 ? (
              <EmptyState
                icon={<Calendar size={32} />}
                title="No exams scheduled"
                description="Add upcoming exams to stay prepared."
                action={<button className="btn btn-primary" onClick={() => setShowAddExam(true)}>Add Exam</button>}
              />
            ) : (
              <div className="flex flex-col gap-2">
                {exams.map((exam) => (
                  <div key={exam.id} className="card card-interactive animate-fadeInUp" style={{ padding: 'var(--space-3) var(--space-4)' }}>
                    <div className="flex items-center gap-3">
                      <div className="stat-card-icon" style={{ width: 36, height: 36, background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
                        <Calendar size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="list-item-title">{exam.title}</div>
                        <div className="text-xs text-muted mt-1">{formatDate(exam.exam_date)}</div>
                      </div>
                      <button className="btn btn-icon btn-ghost" onClick={() => { deleteItem('exams', exam.id); showToast('Exam deleted', 'info'); }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="fab" onClick={() => setShowAddExam(true)} id="fab-add-exam">
              <Plus size={24} />
            </button>
          </>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={showAddSubject} onClose={() => setShowAddSubject(false)} title="Add Subject"
        footer={<><button className="btn btn-secondary" onClick={() => setShowAddSubject(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddSubject}>Add</button></>}>
        <div className="input-group">
          <label className="input-label">Subject Name</label>
          <input className="input" placeholder="e.g., Data Science" value={subjectForm.name} onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} autoFocus id="subject-name" />
        </div>
        <div className="input-group">
          <label className="input-label">Color</label>
          <input className="input" type="color" value={subjectForm.color} onChange={(e) => setSubjectForm({ ...subjectForm, color: e.target.value })} id="subject-color" />
        </div>
      </Modal>

      <Modal isOpen={showAddNote} onClose={() => setShowAddNote(false)} title="Add Note"
        footer={<><button className="btn btn-secondary" onClick={() => setShowAddNote(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddNote}>Add</button></>}>
        <div className="input-group">
          <label className="input-label">Title</label>
          <input className="input" placeholder="Note title" value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} autoFocus id="note-title" />
        </div>
        {subjects.length > 0 && (
          <div className="input-group">
            <label className="input-label">Subject</label>
            <select className="input select" value={noteForm.subject_id} onChange={(e) => setNoteForm({ ...noteForm, subject_id: e.target.value })} id="note-subject">
              <option value="">General</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        <div className="input-group">
          <label className="input-label">Type</label>
          <select className="input select" value={noteForm.type} onChange={(e) => setNoteForm({ ...noteForm, type: e.target.value as 'note' })} id="note-type">
            <option value="note">Note</option>
            <option value="important_question">Important Question</option>
            <option value="pyq">Previous Year Question</option>
            <option value="assignment">Assignment</option>
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Content</label>
          <textarea className="input textarea" placeholder="Write your note..." value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} id="note-content" />
        </div>
      </Modal>

      <Modal isOpen={showAddExam} onClose={() => setShowAddExam(false)} title="Add Exam"
        footer={<><button className="btn btn-secondary" onClick={() => setShowAddExam(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAddExam}>Add</button></>}>
        <div className="input-group">
          <label className="input-label">Exam Title</label>
          <input className="input" placeholder="e.g., Physics Mid-term" value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} autoFocus id="exam-title" />
        </div>
        {subjects.length > 0 && (
          <div className="input-group">
            <label className="input-label">Subject</label>
            <select className="input select" value={examForm.subject_id} onChange={(e) => setExamForm({ ...examForm, subject_id: e.target.value })} id="exam-subject">
              <option value="">General</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
        <div className="input-group">
          <label className="input-label">Exam Date</label>
          <input className="input" type="date" value={examForm.exam_date} onChange={(e) => setExamForm({ ...examForm, exam_date: e.target.value })} id="exam-date" />
        </div>
        <div className="input-group">
          <label className="input-label">Notes</label>
          <textarea className="input textarea" placeholder="Any notes for this exam..." value={examForm.notes} onChange={(e) => setExamForm({ ...examForm, notes: e.target.value })} id="exam-notes" />
        </div>
      </Modal>
    </>
  );
}
