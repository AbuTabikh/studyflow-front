export type Lang = "en" | "ar";

export const t = {
  // ── Navigation ──────────────────────────────────────────────────────────────
  nav: {
    dashboard:        { en: "Dashboard",         ar: "الرئيسية" },
    academicPlanning: { en: "Academic Planning",  ar: "التخطيط الأكاديمي" },
    courses:          { en: "Courses",            ar: "المقررات" },
    tasks:            { en: "Tasks",              ar: "المهام" },
    calendar:         { en: "Calendar",           ar: "التقويم" },
    selfLearning:     { en: "Self Learning",      ar: "التعلم الذاتي" },
    reflections:      { en: "Reflections",        ar: "التأملات" },
    settings:         { en: "Settings",           ar: "الإعدادات" },
    logout:           { en: "Sign Out",           ar: "تسجيل الخروج" },
    focus:            { en: "Focus Mode",         ar: "وضع التركيز" },
  },

  // ── Breadcrumbs ─────────────────────────────────────────────────────────────
  breadcrumbs: {
    dashboard:        { en: "Dashboard",         ar: "الرئيسية" },
    courses:          { en: "Courses",            ar: "المقررات" },
    tasks:            { en: "Tasks",              ar: "المهام" },
    calendar:         { en: "Calendar",           ar: "التقويم" },
    "self-learning":  { en: "Self Learning",      ar: "التعلم الذاتي" },
    reflections:      { en: "Reflections",        ar: "التأملات" },
    settings:         { en: "Settings",           ar: "الإعدادات" },
    "academic-planning": { en: "Academic Planning", ar: "التخطيط الأكاديمي" },
    focus:            { en: "Focus",              ar: "التركيز" },
  },

  // ── Common actions ──────────────────────────────────────────────────────────
  actions: {
    save:        { en: "Save",          ar: "حفظ" },
    saveChanges: { en: "Save Changes",  ar: "حفظ التغييرات" },
    saveNow:     { en: "Save Now",      ar: "حفظ الآن" },
    saving:      { en: "Saving...",     ar: "جاري الحفظ..." },
    saved:       { en: "Saved!",        ar: "تم الحفظ!" },
    cancel:      { en: "Cancel",        ar: "إلغاء" },
    confirm:     { en: "Confirm",       ar: "تأكيد" },
    delete:      { en: "Delete",        ar: "حذف" },
    edit:        { en: "Edit",          ar: "تعديل" },
    add:         { en: "Add",           ar: "إضافة" },
    reset:       { en: "Reset",         ar: "إعادة تعيين" },
    search:      { en: "Search...",     ar: "بحث..." },
    markDone:    { en: "Mark as done",  ar: "وضع علامة كمنجز" },
    continue:    { en: "Continue",      ar: "متابعة" },
    explore:     { en: "Explore",       ar: "استكشاف" },
    logout:      { en: "Sign Out",      ar: "تسجيل الخروج" },
    close:       { en: "Close",         ar: "إغلاق" },
    view:        { en: "View",          ar: "عرض" },
    back:        { en: "Go Back",       ar: "رجوع" },
  },

  // ── Dashboard ───────────────────────────────────────────────────────────────
  dashboard: {
    greeting: {
      morning:   { en: "Good morning",   ar: "صباح الخير" },
      afternoon: { en: "Good afternoon", ar: "مساء الخير" },
      evening:   { en: "Good evening",   ar: "مساء النور" },
    },
    student:     { en: "Student",        ar: "طالب" },
    stats: {
      activeCourses:   { en: "Active Courses",     ar: "المقررات النشطة" },
      enrolledTerm:    { en: "Enrolled this term", ar: "مسجلة هذا الفصل" },
      pendingTasks:    { en: "Pending Tasks",       ar: "المهام المعلقة" },
      pendingTodo:     { en: "Pending to do",       ar: "في انتظار الإنجاز" },
      completedCredits:{ en: "Completed Credits",  ar: "الساعات المكتملة" },
      academicProgress:{ en: "Academic progress",  ar: "التقدم الأكاديمي" },
      streak:          { en: "Day Streak",          ar: "أيام متتالية" },
      longestStreak:   { en: "Longest",             ar: "الأطول" },
      milestones:      { en: "Milestones",          ar: "الإنجازات" },
      achieved:        { en: "Achieved",            ar: "محقق" },
    },
    quickActions: {
      addTask:        { en: "Add Task",        ar: "إضافة مهمة" },
      addCourse:      { en: "Add Course",      ar: "إضافة مقرر" },
      learningPlan:   { en: "Learning Plan",   ar: "خطة تعلم" },
      writeReflection:{ en: "Write Reflection",ar: "كتابة تأمل" },
    },
    highPriorityTasks: { en: "High Priority Tasks", ar: "المهام ذات الأولوية العالية" },
    noHighPriority:    { en: "No high priority tasks", ar: "لا توجد مهام عالية الأولوية" },
    overdue:           { en: "Overdue",        ar: "متأخر" },
    due:               { en: "Due",            ar: "موعد" },
    allCaughtUp:       { en: "You're all caught up!", ar: "أنجزت كل شيء!" },
    academicProgress:  { en: "Academic Progress",    ar: "التقدم الأكاديمي" },
    selfLearning:      { en: "Self Learning",         ar: "التعلم الذاتي" },
    continueLearning:  { en: "Continue Learning",     ar: "متابعة التعلم" },
    explorePlans:      { en: "Explore Plans",         ar: "استكشاف الخطط" },
    openAcademicPlanner:{ en: "Open Academic Planner", ar: "فتح المخطط الأكاديمي" },
    focusMode:         { en: "Focus Mode",            ar: "وضع التركيز" },
    startFocus:        { en: "Start Focus Session",   ar: "بدء جلسة التركيز" },
  },

  // ── Settings ─────────────────────────────────────────────────────────────────
  settings: {
    title:           { en: "Settings",                    ar: "الإعدادات" },
    subtitle:        { en: "Manage your account",         ar: "إدارة حسابك" },
    unsavedChanges:  { en: "You have unsaved changes",    ar: "لديك تغييرات غير محفوظة" },
    profile: {
      title:          { en: "Profile Information",        ar: "معلومات الملف الشخصي" },
      subtitle:       { en: "Update your personal details", ar: "تحديث بياناتك الشخصية" },
      fullName:       { en: "Full Name",                  ar: "الاسم الكامل" },
      namePlaceholder:{ en: "Enter your name",            ar: "أدخل اسمك" },
      university:     { en: "University",                 ar: "الجامعة" },
      universityPlaceholder: { en: "Enter your university", ar: "أدخل جامعتك" },
      major:          { en: "Major",                      ar: "التخصص" },
      majorPlaceholder:{ en: "Enter your major",          ar: "أدخل تخصصك" },
      noMajor:        { en: "No major set",               ar: "لم يُحدد تخصص" },
      changeAvatar:   { en: "Change Avatar",              ar: "تغيير الصورة" },
    },
    academic: {
      title:          { en: "Academic Settings",          ar: "الإعدادات الأكاديمية" },
      academicYear:   { en: "Academic Year",              ar: "السنة الدراسية" },
      totalCredits:   { en: "Total Credit Hours Required",ar: "مجموع الساعات المطلوبة" },
      completedCredits:{ en: "Credit Hours Completed",   ar: "الساعات المكتملة" },
      currentGPA:     { en: "Current GPA",               ar: "المعدل التراكمي الحالي" },
      invalidCredits: { en: "Invalid Credit Hours",       ar: "ساعات معتمدة غير صالحة" },
      remaining:      { en: "Remaining",                  ar: "متبقية" },
    },
    notifications: {
      title:          { en: "Notification Settings",      ar: "إعدادات الإشعارات" },
      reminders:      { en: "Global Reminders",           ar: "التذكيرات العامة" },
      enableReminders:{ en: "Enable Reminders",           ar: "تفعيل التذكيرات" },
      reminderTiming: { en: "Default Reminder Timing",    ar: "توقيت التذكير الافتراضي" },
      selectTiming:   { en: "Select timing",              ar: "اختر التوقيت" },
      selectUnit:     { en: "Select unit",                ar: "اختر الوحدة" },
      minutes:        { en: "Minutes before",             ar: "دقائق قبل" },
      hours:          { en: "Hours before",               ar: "ساعات قبل" },
      days:           { en: "Days before",                ar: "أيام قبل" },
      timingValue:    { en: "Timing value",               ar: "قيمة التوقيت" },
      unit:           { en: "Unit",                       ar: "الوحدة" },
      emailAlerts:    { en: "Email Alerts",               ar: "تنبيهات البريد الإلكتروني" },
      pushNotif:      { en: "Push Notifications",         ar: "الإشعارات الفورية" },
      dashboardBadge: { en: "Show alerts in the dashboard badge", ar: "إظهار التنبيهات في شارة لوحة التحكم" },
    },
    appearance: {
      title:          { en: "Appearance",                 ar: "المظهر" },
      subtitle:       { en: "Choose a theme and language that feel right for you.", ar: "اختر المظهر واللغة المناسبين لك." },
      theme:          { en: "Theme",                      ar: "الثيم" },
      light:          { en: "Light",                      ar: "فاتح" },
      dark:           { en: "Dark",                       ar: "داكن" },
      system:         { en: "System",                     ar: "النظام" },
      language:       { en: "Language / اللغة",           ar: "Language / اللغة" },
      rtlNote:        { en: "Layout will switch to right-to-left", ar: "سيتم تغيير اتجاه الصفحة إلى اليمين لليسار" },
    },
    dangerZone:  { en: "Danger Zone",                     ar: "منطقة الخطر" },
    signOut:     { en: "Sign Out",                        ar: "تسجيل الخروج" },
    resetData:   { en: "Reset App Data",                  ar: "إعادة تعيين بيانات التطبيق" },
  },

  // ── Tasks ────────────────────────────────────────────────────────────────────
  tasks: {
    title:       { en: "Tasks",         ar: "المهام" },
    addTask:     { en: "Add Task",      ar: "إضافة مهمة" },
    noTasks:     { en: "No tasks yet",  ar: "لا توجد مهام بعد" },
    completed:   { en: "Completed",     ar: "مكتملة" },
    pending:     { en: "Pending",       ar: "معلقة" },
    overdue:     { en: "Overdue",       ar: "متأخرة" },
    high:        { en: "High",          ar: "عالية" },
    medium:      { en: "Medium",        ar: "متوسطة" },
    low:         { en: "Low",           ar: "منخفضة" },
    priority:    { en: "Priority",      ar: "الأولوية" },
    dueDate:     { en: "Due Date",      ar: "تاريخ الاستحقاق" },
    course:      { en: "Course",        ar: "المقرر" },
    noCourse:    { en: "No course",     ar: "بدون مقرر" },
    title_field: { en: "Title",         ar: "العنوان" },
    description: { en: "Description",  ar: "الوصف" },
    status:      { en: "Status",        ar: "الحالة" },
    type:        { en: "Type",          ar: "النوع" },
  },

  // ── Courses ──────────────────────────────────────────────────────────────────
  courses: {
    title:       { en: "Courses",       ar: "المقررات" },
    addCourse:   { en: "Add Course",    ar: "إضافة مقرر" },
    noCourses:   { en: "No courses yet",ar: "لا توجد مقررات بعد" },
    progress:    { en: "Progress",      ar: "التقدم" },
    instructor:  { en: "Instructor",    ar: "المدرس" },
    credits:     { en: "Credits",       ar: "الساعات" },
    completed:   { en: "Completed",     ar: "مكتملة" },
    active:      { en: "Active",        ar: "نشط" },
    weeks:       { en: "Weeks",         ar: "أسابيع" },
    weeklyPlan:  { en: "Weekly Timeline", ar: "الجدول الأسبوعي" },
    resources:   { en: "Resources",     ar: "المصادر" },
  },

  // ── Notifications ────────────────────────────────────────────────────────────
  notifications: {
    title:         { en: "Notifications",      ar: "الإشعارات" },
    markAllRead:   { en: "Mark all as read",   ar: "تعيين الكل كمقروء" },
    clearAll:      { en: "Clear all",          ar: "مسح الكل" },
    noNotifications:{ en: "No notifications",  ar: "لا توجد إشعارات" },
    allCaughtUp:   { en: "You're all caught up!", ar: "لا جديد لديك!" },
  },

  // ── Confirm dialogs ──────────────────────────────────────────────────────────
  confirm: {
    areYouSure:  { en: "Are you sure?",                    ar: "هل أنت متأكد؟" },
    cannotUndo:  { en: "This action cannot be undone.",    ar: "لا يمكن التراجع عن هذا الإجراء." },
    logout:      { en: "You will be signed out of your account.", ar: "سيتم تسجيل خروجك من حسابك." },
    resetData:   { en: "All your data will be permanently deleted.", ar: "سيتم حذف جميع بياناتك بشكل دائم." },
    delete:      { en: "Delete",                           ar: "حذف" },
    confirm:     { en: "Confirm",                          ar: "تأكيد" },
    cancel:      { en: "Cancel",                           ar: "إلغاء" },
  },

  // ── Reflections ──────────────────────────────────────────────────────────────
  reflections: {
    title:      { en: "Reflections",    ar: "التأملات" },
    addNew:     { en: "New Reflection", ar: "تأمل جديد" },
    noEntries:  { en: "No reflections yet", ar: "لا توجد تأملات بعد" },
  },

  // ── Calendar ─────────────────────────────────────────────────────────────────
  calendar: {
    title:      { en: "Calendar",       ar: "التقويم" },
    today:      { en: "Today",          ar: "اليوم" },
    month:      { en: "Month",          ar: "شهر" },
    week:       { en: "Week",           ar: "أسبوع" },
    day:        { en: "Day",            ar: "يوم" },
    agenda:     { en: "Agenda",         ar: "الأجندة" },
    noEvents:   { en: "No events",      ar: "لا توجد أحداث" },
    upcoming:   { en: "Upcoming",       ar: "القادمة" },
    deadlines:  { en: "Deadlines",      ar: "المواعيد النهائية" },
  },

  // ── Self Learning ─────────────────────────────────────────────────────────────
  selfLearning: {
    title:      { en: "Self Learning",  ar: "التعلم الذاتي" },
    addPlan:    { en: "Add Plan",       ar: "إضافة خطة" },
    noPlans:    { en: "No plans yet",   ar: "لا توجد خطط بعد" },
    active:     { en: "Active",         ar: "نشط" },
    planned:    { en: "Planned",        ar: "مخطط" },
    completed:  { en: "Completed",      ar: "مكتمل" },
    paused:     { en: "Paused",         ar: "متوقف" },
    stages:     { en: "Stages",         ar: "المراحل" },
    milestones: { en: "Milestones",     ar: "الإنجازات" },
    resources:  { en: "Resources",      ar: "المصادر" },
  },
} as const;

export function translate(key: { en: string; ar: string }, lang: Lang): string {
  return key[lang];
}
