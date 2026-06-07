import { useState, useEffect } from 'react';
import type { View } from './data/types';
import { seedDemoData } from './data/seed';
import HomeView from './views/HomeView';
import TeacherSetupView from './views/TeacherSetupView';
import StudentJoinView from './views/StudentJoinView';
import StudentSimView from './views/StudentSimView';
import StudentDebriefView from './views/StudentDebriefView';
import TeacherDashboardView from './views/TeacherDashboardView';

export default function App() {
  const [view, setView] = useState<View>({ kind: 'home' });

  useEffect(() => {
    seedDemoData();
  }, []);

  function navigate(v: View) {
    setView(v);
    window.scrollTo(0, 0);
  }

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

    default:
      return <HomeView onNavigate={navigate} />;
  }
}
