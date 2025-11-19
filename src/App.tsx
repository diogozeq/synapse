import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Courses from './components/Courses';
import CourseCreator from './components/CourseCreator';
import CoursePlayer from './components/CoursePlayer';
import CollaboratorList from './components/CollaboratorList';
import CollaboratorDetail from './components/CollaboratorDetail';
import TeamRoleManager from './components/TeamRoleManager';
import AnalyticsPanel from './components/AnalyticsPanel';
import Lab3D from './components/Lab3D';
import CheckInBio from './components/CheckInBio';
import CourseAssignmentModal from './components/CourseAssignmentModal';
import { View, Course, UserStats, ActivityType, UserRole, Team, Collaborator, Enrollment, Role, CollaboratorInput, TeamInput, RoleInput, EnrollmentStatus, EnrollmentInput } from './types';
import { checkBadgeUnlocks, calculateLevel, getRankTitle, calculateXPReward } from './utils/badgeSystem';
import { calculateNextReview, scoreToQuality } from './utils/spacedRepetition';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.MANAGER);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [primaryCollaboratorId, setPrimaryCollaboratorId] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 2450,
    level: calculateLevel(2450),
    streakDays: 14,
    coursesCompleted: 0,
    rank: getRankTitle(2450),
    avatarUrl: 'https://i.pravatar.cc/150?u=synapse-admin',
    badges: [],
    lastAccessDate: new Date().toISOString(),
    themeMode: 'light'
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [appError, setAppError] = useState<string | null>(null);
  const [isSyncingCourse, setIsSyncingCourse] = useState(false);
  const [courseToAssign, setCourseToAssign] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Track additional data for badge unlocks
  const [perfectSimulations, setPerfectSimulations] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [lastActivityDate, setLastActivityDate] = useState<string | null>(null);

  const primaryCollaborator = useMemo(() => {
    if (primaryCollaboratorId) {
      return collaborators.find(c => c.id === primaryCollaboratorId) ?? null;
    }
    return collaborators[0] ?? null;
  }, [primaryCollaboratorId, collaborators]);

  const loadWorkspaceData = useCallback(async () => {
    try {
      setAppError(null);
      setIsBootstrapping(true);
      const [coursesData, collaboratorsData, enrollmentsData, teamsData, rolesData] = await Promise.all([
        apiService.getCourses(),
        apiService.getUsers(),
        apiService.getEnrollments(),
        apiService.getTeams(),
        apiService.getRoles()
      ]);

      setCourses(coursesData);
      setCollaborators(collaboratorsData);
      setEnrollments(enrollmentsData);
      setTeams(teamsData);
      setRoles(rolesData);
      setPrimaryCollaboratorId(collaboratorsData[0]?.id ?? null);

      if (collaboratorsData.length > 0) {
        const primaryProfile = collaboratorsData[0];
        const totalPoints = primaryProfile.totalXP;
        setUserStats((prev) => ({
          ...prev,
          totalPoints,
          level: calculateLevel(totalPoints),
          rank: getRankTitle(totalPoints),
          streakDays: primaryProfile.streakDays,
          coursesCompleted: primaryProfile.coursesCompleted,
          avatarUrl: primaryProfile.avatarUrl
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais', error);
      setAppError(error instanceof Error ? error.message : 'Falha ao carregar dados do Synapse.');
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);


  const handleNavigate = (view: View) => {
    setCurrentView(view);
    if (view !== View.COURSE_DETAILS) {
      setActiveCourseId(null);
    }
    if (view !== View.COLLABORATOR_DETAIL) {
      setSelectedCollaboratorId(null);
    }
    switch (view) {
      case View.DASHBOARD:
        navigate('/');
        break;
      case View.COURSES:
      case View.LEARN:
        navigate('/courses');
        break;
      case View.CREATE_COURSE:
        navigate('/create');
        break;
      case View.TEAM_LIST:
        navigate('/teams');
        break;
      case View.COLLABORATOR_DETAIL:
        navigate('/collaborators');
        break;
      case View.COURSE_DETAILS:
        navigate(`/courses/${activeCourseId ?? ''}`);
        break;
      case View.CHECKIN:
        navigate('/checkin');
        break;
      default:
        navigate('/');
    }
  };

  const handleToggleRole = () => {
    setUserRole(prev => prev === UserRole.MANAGER ? UserRole.COLLABORATOR : UserRole.MANAGER);
    setCurrentView(View.DASHBOARD);
    setSelectedCollaboratorId(null);
    setActiveCourseId(null);
  };

  const handleSelectCollaborator = (id: string) => {
    setSelectedCollaboratorId(id);
    setCurrentView(View.COLLABORATOR_DETAIL);
  };

  const handleBackToTeam = () => {
    setCurrentView(View.TEAM_LIST);
    setSelectedCollaboratorId(null);
  };

  const handleAddCollaborator = async (data: CollaboratorInput & { cpf?: string }) => {
    try {
      const created = await apiService.createUser(data);
      setCollaborators(prev => [created, ...prev]);
      setPrimaryCollaboratorId(prev => prev ?? created.id);
    } catch (error) {
      console.error('Erro ao adicionar colaborador', error);
      setAppError(error instanceof Error ? error.message : 'Falha ao criar colaborador.');
      throw error;
    }
  };

  const handleUpdateCollaborator = async (id: string, updates: Partial<CollaboratorInput>) => {
    try {
      const updated = await apiService.updateUser(id, updates);
      setCollaborators(prev => prev.map(c => c.id === id ? updated : c));
    } catch (error) {
      console.error('Erro ao atualizar colaborador', error);
      setAppError(error instanceof Error ? error.message : 'Falha ao atualizar colaborador.');
      throw error;
    }
  };

  const handleAddTeam = async (data: TeamInput) => {
    try {
      const created = await apiService.createTeam(data);
      setTeams(prev => [created, ...prev]);
    } catch (error) {
      console.error('Erro ao criar time', error);
      setAppError(error instanceof Error ? error.message : 'Falha ao criar time.');
      throw error;
    }
  };

  const handleAddRole = async (data: RoleInput) => {
    try {
      const created = await apiService.createRole(data);
      setRoles(prev => [created, ...prev]);
    } catch (error) {
      console.error('Erro ao criar cargo', error);
      setAppError(error instanceof Error ? error.message : 'Falha ao criar cargo.');
      throw error;
    }
  };

  const getEnrollmentForCourse = useCallback(
    (courseId: string) => {
      if (!primaryCollaborator) return null;
      return enrollments.find(
        (enrollment) =>
          enrollment.courseId === courseId && enrollment.collaboratorId === primaryCollaborator.id
      ) || null;
    },
    [enrollments, primaryCollaborator]
  );

  const ensureEnrollmentForCourse = useCallback(
    async (course: Course) => {
      if (!primaryCollaborator) return null;
      const existing = getEnrollmentForCourse(course.id);
      if (existing) {
        return existing;
      }
      const payload = {
        courseId: course.id,
        collaboratorId: primaryCollaborator.id,
        isRequired: (course.category || '').toLowerCase().includes('obrig'),
      };
      const created = await apiService.createEnrollment(payload);
      setEnrollments(prev => [created, ...prev]);
      return created;
    },
    [getEnrollmentForCourse, primaryCollaborator]
  );

  const handleCourseCreated = async (newCourse: Course) => {
    try {
      setIsSyncingCourse(true);
      const created = await apiService.createCourse(newCourse);
      setCourses(prev => [created, ...prev]);
      setActiveCourseId(created.id);
      setCurrentView(View.COURSE_DETAILS);
    } catch (error) {
      console.error('Erro ao criar curso', error);
      const message = error instanceof Error ? error.message : 'Falha ao criar curso.';
      setAppError(message);
      throw error;
    } finally {
      setIsSyncingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      await apiService.deleteCourse(courseId);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      // Remover matrículas associadas
      setEnrollments(prev => prev.filter(e => e.courseId !== courseId));
    } catch (error) {
      console.error('Erro ao excluir curso', error);
      setAppError(error instanceof Error ? error.message : 'Falha ao excluir curso.');
      throw error;
    }
  };

  const handleCreateEnrollment = async (data: EnrollmentInput) => {
    try {
      const created = await apiService.createEnrollment(data);
      setEnrollments(prev => [created, ...prev]);
    } catch (error) {
      console.error('Erro ao criar matrícula', error);
      setAppError(error instanceof Error ? error.message : 'Falha ao criar matrícula.');
      throw error;
    }
  };

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    try {
      await apiService.deleteEnrollment(enrollmentId);
      setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
    } catch (error) {
      console.error('Erro ao remover matrícula', error);
      setAppError(error instanceof Error ? error.message : 'Falha ao remover matrícula.');
      throw error;
    }
  };

  const handleContinueCourse = async (course: Course) => {
    try {
      if (userRole === UserRole.COLLABORATOR) {
        await ensureEnrollmentForCourse(course);
      }
      setActiveCourseId(course.id);
      setCurrentView(View.COURSE_DETAILS);
    } catch (error) {
      console.error('Erro ao preparar curso', error);
      setAppError(error instanceof Error ? error.message : 'Falha ao continuar o curso.');
    }
  };

  const handleModuleComplete = async (moduleId: string, score?: number, isReview: boolean = false) => {
    if (!activeCourseId) return;

    const today = new Date().toISOString().split('T')[0];
    const isFirstActivityToday = lastActivityDate !== today;
    let syncedCourse: Course | null = null;

    setCourses(prev => prev.map(course => {
      if (course.id !== activeCourseId) return course;

      const module = course.modules.find(m => m.id === moduleId);
      if (!module) return course;

      let updatedModule = { ...module, isCompleted: true, score: score || 0 };

      if (score !== undefined && isReview) {
        const quality = scoreToQuality(score);
        const { nextDate, newMetadata } = calculateNextReview(
          quality,
          module.srMetadata
        );
        updatedModule = {
          ...updatedModule,
          nextReviewDate: nextDate,
          srMetadata: newMetadata
        };
        setTotalReviews(prev => prev + 1);
      }

      const updatedModules = course.modules.map(m =>
        m.id === moduleId ? updatedModule : m
      );

      const completedCount = updatedModules.filter(m => m.isCompleted).length;
      const progress = Math.round((completedCount / updatedModules.length) * 100);

      const justCompleted = !module.isCompleted && !isReview;
      if (justCompleted) {
        const moduleXP = module.xpReward || 0;
        const finalXP = calculateXPReward(
          moduleXP,
          score || 0,
          userStats.streakDays,
          isFirstActivityToday
        );

        if (module.type === ActivityType.SIMULATION && score === 100) {
          setPerfectSimulations(prev => prev + 1);
        }

        setUserStats(prev => {
          const newTotalPoints = prev.totalPoints + finalXP;
          const newLevel = calculateLevel(newTotalPoints);
          const newRank = getRankTitle(newTotalPoints);

          return {
            ...prev,
            totalPoints: newTotalPoints,
            level: newLevel,
            rank: newRank
          };
        });

        setLastActivityDate(today);

        if (progress === 100) {
          setUserStats(prev => ({
            ...prev,
            coursesCompleted: prev.coursesCompleted + 1
          }));
        }
      }

      const nextCourse = {
        ...course,
        modules: updatedModules,
        progress
      };
      syncedCourse = nextCourse;
      return nextCourse;
    }));

    const enrollmentTarget = primaryCollaborator ? getEnrollmentForCourse(activeCourseId) : null;
    if (syncedCourse && enrollmentTarget) {
      try {
        const statusUpdate =
          syncedCourse.progress >= 100 ? EnrollmentStatus.COMPLETED : EnrollmentStatus.IN_PROGRESS;
        const updatedEnrollment = await apiService.updateEnrollment(enrollmentTarget.id, {
          progress: syncedCourse.progress,
          status: statusUpdate,
          lastAccessAt: new Date().toISOString()
        });
        setEnrollments(prev => prev.map(enrollment => enrollment.id === updatedEnrollment.id ? updatedEnrollment : enrollment));
      } catch (error) {
        console.error('Erro ao sincronizar matrícula', error);
        setAppError(error instanceof Error ? error.message : 'Falha ao atualizar a matrícula do curso.');
      }
    }
  };

  // Check for badge unlocks whenever relevant stats change
  useEffect(() => {
    const newBadges = checkBadgeUnlocks(userStats, courses, {
      perfectSimulations,
      totalReviews
    });

    if (newBadges.length > 0) {
      setUserStats(prev => ({
        ...prev,
        badges: [...prev.badges, ...newBadges]
      }));
    }
  }, [userStats.totalPoints, userStats.streakDays, userStats.coursesCompleted, perfectSimulations, totalReviews]);

  // Update streak based on last access
  useEffect(() => {
    const checkStreak = () => {
      const today = new Date();
      const lastAccess = new Date(userStats.lastAccessDate);

      const daysDiff = Math.floor(
        (today.getTime() - lastAccess.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0) {
        // Same day, no change
        return;
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        setUserStats(prev => ({
          ...prev,
          streakDays: prev.streakDays + 1,
          lastAccessDate: today.toISOString()
        }));
      } else if (daysDiff > 1) {
        // Streak broken, reset to 1
        setUserStats(prev => ({
          ...prev,
          streakDays: 1,
          lastAccessDate: today.toISOString()
        }));
      }
    };

    // Check streak on mount and when returning to the app
    checkStreak();
  }, []);

  // Toggle dark mode
  const handleToggleTheme = () => {
    setUserStats(prev => ({
      ...prev,
      themeMode: prev.themeMode === 'light' ? 'dark' : 'light'
    }));
  };

  // Sync view with URL on initial load and navigation
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/courses/')) {
      setCurrentView(View.COURSE_DETAILS);
    } else if (path === '/courses') {
      setCurrentView(View.COURSES);
    } else if (path === '/create') {
      setCurrentView(View.CREATE_COURSE);
    } else if (path === '/teams') {
      setCurrentView(View.TEAM_LIST);
    } else if (path === '/collaborators') {
      setCurrentView(View.COLLABORATOR_DETAIL);
    } else if (path === '/checkin') {
      setCurrentView(View.CHECKIN);
    } else {
      setCurrentView(View.DASHBOARD);
    }
  }, [location.pathname]);

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        <p className="text-base font-semibold">Carregando dados do Synapse...</p>
      </div>
    );
  }

  const activeCourse = courses.find(c => c.id === activeCourseId);
  const selectedCollaborator = collaborators.find(c => c.id === selectedCollaboratorId);
  const selectedTeam = selectedCollaborator ? teams.find(t => t.id === selectedCollaborator.teamId) : undefined;
  const collaboratorEnrollments = selectedCollaboratorId
    ? enrollments.filter(e => e.collaboratorId === selectedCollaboratorId)
    : [];

  return (
    <div className={userStats.themeMode === 'dark' ? 'dark' : ''}>
      <Layout
        currentView={currentView}
        userRole={userRole}
        onNavigate={handleNavigate}
        onToggleRole={handleToggleRole}
        onToggleTheme={handleToggleTheme}
        themeMode={userStats.themeMode}
      >
        {appError && (
          <div className="mx-8 my-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-center justify-between">
            <span className="text-sm font-medium">{appError}</span>
            <button
              onClick={loadWorkspaceData}
              className="text-xs font-bold uppercase tracking-wide"
            >
              Tentar novamente
            </button>
          </div>
        )}
        {currentView === View.DASHBOARD && (
          <Dashboard
            stats={userStats}
            courses={courses}
            onContinueCourse={handleContinueCourse}
          />
        )}

        {currentView === View.COURSES && (
          <>
            <Courses
              courses={courses}
              onCreate={() => handleNavigate(View.CREATE_COURSE)}
              onOpenCourse={(courseId) => {
                setActiveCourseId(courseId);
                handleNavigate(View.COURSE_DETAILS);
              }}
              onEditAssignments={(courseId) => setCourseToAssign(courseId)}
              onDeleteCourse={handleDeleteCourse}
            />
            {courseToAssign && (
              <CourseAssignmentModal
                course={courses.find(c => c.id === courseToAssign)!}
                collaborators={collaborators}
                teams={teams}
                roles={roles}
                enrollments={enrollments}
                onClose={() => setCourseToAssign(null)}
                onCreateEnrollment={handleCreateEnrollment}
                onDeleteEnrollment={handleDeleteEnrollment}
              />
            )}
          </>
        )}

        {currentView === View.CREATE_COURSE && (
          <CourseCreator onCourseCreated={handleCourseCreated} isSaving={isSyncingCourse} />
        )}

        {currentView === View.TEAM_LIST && (
          <CollaboratorList
            collaborators={collaborators}
            teams={teams}
            roles={roles}
            onSelectCollaborator={handleSelectCollaborator}
            onAddCollaborator={handleAddCollaborator}
          />
        )}

        {currentView === View.COLLABORATOR_DETAIL && selectedCollaborator && (
          <CollaboratorDetail
            collaborator={selectedCollaborator}
            team={selectedTeam}
            teams={teams}
            roles={roles}
            enrollments={collaboratorEnrollments}
            courses={courses}
            onBack={handleBackToTeam}
            onUpdateCollaborator={handleUpdateCollaborator}
          />
        )}

        {currentView === View.LEARN && (
          <div className="p-8">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Meus Cursos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map(course => (
                <div key={course.id} onClick={() => handleContinueCourse(course)} className="bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer group">
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    <img src={course.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg">
                      {course.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
                    <div className="w-full bg-gray-100 h-2 rounded-full mb-3">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-500">{course.progress}% Concluído</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === View.COURSE_DETAILS && activeCourse && (
          <CoursePlayer
            course={activeCourse}
            onBack={() => handleNavigate(View.DASHBOARD)}
            onCompleteModule={handleModuleComplete}
          />
        )}
        {currentView === View.TEAMS_ROLES && (
          <TeamRoleManager
            teams={teams}
            roles={roles}
            onAddTeam={handleAddTeam}
            onAddRole={handleAddRole}
          />
        )}
        {currentView === View.CHECKIN && primaryCollaboratorId && (
          <CheckInBio
            userId={primaryCollaboratorId}
            onComplete={() => handleNavigate(View.DASHBOARD)}
          />
        )}
        {/* Rotas auxiliares via caminho direto */}
        {location.pathname === '/analytics' && (
          <AnalyticsPanel />
        )}
        {location.pathname === '/lab' && (
          <Lab3D />
        )}
      </Layout>
    </div>
  );
};

export default App;
