import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BarChart3, ChevronLeft, ChevronRight, FileText, GraduationCap, Home, LogIn, Menu, Settings, Ship, X } from 'lucide-react';
import type { View } from './data/types';
import { DEMO_SESSION_ID, seedDemoData } from './data/seed';
import { getResult, getResults } from './data/store';
import HomeView from './views/HomeView';
import TeacherSetupView from './views/TeacherSetupView';
import StudentJoinView from './views/StudentJoinView';
import StudentSimView from './views/StudentSimView';
import StudentDebriefView from './views/StudentDebriefView';
import TeacherDashboardView from './views/TeacherDashboardView';
import SettingsView from './views/SettingsView';

type NavItemId = 'home' | 'teacher-setup' | 'student-join' | 'teacher-dashboard' | 'student-debrief' | 'settings';

interface NavItem {
  id: NavItemId;
  label: string;
  icon: LucideIcon;
  target: View;
}

export default function App() {
  const [view, setView] = useState<View>({ kind: 'home' });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [desktopNavCollapsed, setDesktopNavCollapsed] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{ target: View; label: string } | null>(null);

  useEffect(() => {
    seedDemoData();
  }, []);

  function navigate(v: View) {
    setView(v);
    setMobileNavOpen(false);
    setPendingNavigation(null);
    window.scrollTo(0, 0);
  }

  function requestNavigation(target: View, label: string) {
    if (isSameView(view, target)) {
      setMobileNavOpen(false);
      return;
    }

    if (view.kind === 'student-sim' && target.kind !== 'student-sim') {
      setPendingNavigation({ target, label });
      setMobileNavOpen(false);
      return;
    }

    navigate(target);
  }

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home, target: { kind: 'home' } },
    { id: 'teacher-setup', label: 'Teacher', icon: GraduationCap, target: { kind: 'teacher-setup' } },
    { id: 'student-join', label: 'Student', icon: LogIn, target: { kind: 'student-join' } },
    { id: 'teacher-dashboard', label: 'Dashboard', icon: BarChart3, target: resolveTeacherDashboardTarget(view) },
    { id: 'student-debrief', label: 'Results', icon: FileText, target: resolveStudentDebriefTarget(view) },
  ];

  const bottomNavItems: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: Settings, target: { kind: 'settings' } },
  ];

  const activeNavItem = getActiveNavItem(view);

  return (
    <div className="min-h-screen bg-navy-50 flex">
      <aside
        className={`hidden lg:flex lg:flex-col border-r border-navy-200 bg-white transition-all duration-200 ${
          desktopNavCollapsed ? 'lg:w-16' : 'lg:w-44'
        }`}
      >
        <div className="h-14 px-2 border-b border-navy-100 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-navy-800 text-white flex items-center justify-center shrink-0">
            <Ship className="w-5 h-5" />
          </div>
          {!desktopNavCollapsed && (
            <p className="text-xs font-bold text-navy-900 leading-tight">Jamestown</p>
          )}
          <button
            onClick={() => setDesktopNavCollapsed(!desktopNavCollapsed)}
            className="ml-auto p-1.5 rounded-md text-navy-500 hover:bg-navy-50 hover:text-navy-800 transition-colors"
            aria-label={desktopNavCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {desktopNavCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        {/* Main nav items */}
        <div className="px-2 py-3 flex-1">
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeNavItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => requestNavigation(item.target, item.label)}
                  title={item.label}
                  className={`w-full flex items-center px-2 py-2 rounded-lg text-left transition-colors ${
                    desktopNavCollapsed ? 'justify-center' : 'gap-2'
                  } ${
                    active
                      ? 'bg-navy-100 text-navy-900 font-semibold'
                      : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {!desktopNavCollapsed && <span className="text-xs">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
        {/* Bottom nav (Settings) */}
        <div className="px-2 py-3 border-t border-navy-100">
          <nav className="space-y-1">
            {bottomNavItems.map(item => {
              const Icon = item.icon;
              const active = activeNavItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => requestNavigation(item.target, item.label)}
                  title={item.label}
                  className={`w-full flex items-center px-2 py-2 rounded-lg text-left transition-colors ${
                    desktopNavCollapsed ? 'justify-center' : 'gap-2'
                  } ${
                    active
                      ? 'bg-navy-100 text-navy-900 font-semibold'
                      : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {!desktopNavCollapsed && <span className="text-xs">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="lg:hidden h-14 px-4 border-b border-navy-200 bg-white flex items-center justify-between">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-2 rounded-md text-navy-700 hover:bg-navy-50"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="text-sm font-semibold text-navy-800">Jamestown Simulator</p>
          <div className="w-9" />
        </header>

        {renderView(view, navigate)}
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-navy-900/45"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation menu"
          />
          <aside className="relative h-full w-56 max-w-[85vw] bg-white border-r border-navy-200 shadow-2xl">
            <div className="h-14 px-4 border-b border-navy-100 flex items-center justify-between">
              <p className="text-sm font-bold text-navy-900">Navigate</p>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="p-1.5 rounded-md text-navy-600 hover:bg-navy-50"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 py-4">
              <nav className="space-y-1">
                {[...navItems, ...bottomNavItems].map(item => {
                  const Icon = item.icon;
                  const active = activeNavItem === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => requestNavigation(item.target, item.label)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        active
                          ? 'bg-navy-100 text-navy-900 font-semibold'
                          : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {pendingNavigation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/45 px-4">
          <div className="w-full max-w-md rounded-xl border border-navy-200 bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-navy-900 mb-2">Leave current simulation?</h2>
            <p className="text-sm text-navy-600 leading-relaxed">
              You are in an active student simulation. Do you want to leave this screen and open{' '}
              <span className="font-semibold text-navy-800">{pendingNavigation.label}</span>?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPendingNavigation(null)}
                className="btn-secondary"
              >
                Stay here
              </button>
              <button
                onClick={() => navigate(pendingNavigation.target)}
                className="btn-primary"
              >
                Leave simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderView(view: View, navigate: (v: View) => void) {
  switch (view.kind) {
    case 'home':
      return <HomeView onNavigate={navigate} />;

    case 'teacher-setup':
      return <TeacherSetupView onNavigate={navigate} />;

    case 'teacher-dashboard':
      return <TeacherDashboardView sessionId={view.sessionId} onNavigate={navigate} />;

    case 'student-join':
      return (
        <StudentJoinView
          onJoin={(v) => navigate(v)}
          onBack={() => navigate({ kind: 'home' })}
        />
      );

    case 'student-sim':
      return (
        <StudentSimView
          sessionId={view.sessionId}
          studentId={view.studentId}
          studentName={view.studentName}
          onNavigate={navigate}
        />
      );

    case 'student-debrief':
      return <StudentDebriefView sessionId={view.sessionId} studentId={view.studentId} onNavigate={navigate} />;

    case 'settings':
      return <SettingsView />;

    default:
      return <HomeView onNavigate={navigate} />;
  }
}

function resolveTeacherDashboardTarget(view: View): View {
  const sessionId = sessionIdFromView(view);
  if (!sessionId) return { kind: 'teacher-setup' };
  return { kind: 'teacher-dashboard', sessionId };
}

function resolveStudentDebriefTarget(view: View): View {
  if (view.kind === 'student-debrief') {
    const current = getResult(view.studentId);
    if (current?.completedAt && current.completedAt > 0) {
      return view;
    }
  }

  if (view.kind === 'student-sim') {
    const current = getResult(view.studentId);
    if (current?.completedAt && current.completedAt > 0) {
      return { kind: 'student-debrief', sessionId: view.sessionId, studentId: view.studentId };
    }
  }

  const activeSessionId = sessionIdFromView(view);
  if (activeSessionId) {
    const sessionResult = mostRecentCompletedResult(activeSessionId);
    if (sessionResult) {
      return { kind: 'student-debrief', sessionId: sessionResult.sessionId, studentId: sessionResult.id };
    }
  }

  const anyCompleted = mostRecentCompletedResult();
  if (anyCompleted) {
    return { kind: 'student-debrief', sessionId: anyCompleted.sessionId, studentId: anyCompleted.id };
  }

  const demoSample = getResults(DEMO_SESSION_ID)[0];
  if (demoSample) {
    return { kind: 'student-debrief', sessionId: demoSample.sessionId, studentId: demoSample.id };
  }

  return { kind: 'home' };
}

function mostRecentCompletedResult(sessionId?: string) {
  return getResults(sessionId)
    .filter(r => r.completedAt > 0)
    .sort((a, b) => b.completedAt - a.completedAt)[0];
}

function sessionIdFromView(view: View): string | null {
  if (view.kind === 'teacher-dashboard' || view.kind === 'student-sim' || view.kind === 'student-debrief') {
    return view.sessionId;
  }
  return null;
}

function getActiveNavItem(view: View): NavItemId | null {
  switch (view.kind) {
    case 'home':
      return 'home';
    case 'teacher-setup':
      return 'teacher-setup';
    case 'student-join':
      return 'student-join';
    case 'teacher-dashboard':
      return 'teacher-dashboard';
    case 'student-debrief':
      return 'student-debrief';
    case 'settings':
      return 'settings';
    default:
      return null;
  }
}

function isSameView(current: View, target: View): boolean {
  if (current.kind !== target.kind) return false;

  switch (current.kind) {
    case 'teacher-dashboard':
      return target.kind === 'teacher-dashboard' && current.sessionId === target.sessionId;
    case 'student-sim':
      return (
        target.kind === 'student-sim'
        && current.sessionId === target.sessionId
        && current.studentId === target.studentId
        && current.studentName === target.studentName
      );
    case 'student-debrief':
      return target.kind === 'student-debrief' && current.sessionId === target.sessionId && current.studentId === target.studentId;
    default:
      return true;
  }
}
