import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock API functions (replace with actual API calls)
const fetchStudentPerformanceAPI = async (studentId, filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockPerformance = {
        studentId,
        overallGPA: calculateOverallGPA(studentId),
        summary: {
          currentAverage: 85.2,
          lastTermAverage: 82.7,
          highestSubject: 'Mathematics',
          highestScore: 95,
          lowestSubject: 'Chemistry',
          lowestScore: 75,
          attendanceCorrelation: 0.85 // Correlation between attendance and grades (0-1)
        },
        examResults: generateExamResults(studentId, filters),
        assignmentResults: generateAssignmentResults(studentId, filters),
        quizResults: generateQuizResults(studentId, filters),
        projectResults: generateProjectResults(studentId, filters),
        skillAssessments: generateSkillAssessments(studentId)
      };
      
      resolve(mockPerformance);
    }, 700);
  });
};

// Helper functions for generating mock data
function calculateOverallGPA(studentId) {
  // Simulate GPA calculation based on student ID
  // In a real app, this would be calculated from actual grades
  const baseGPA = 3.0 + (parseInt(studentId.split('_')[1]) % 10) / 10;
  return Math.min(4.0, baseGPA).toFixed(2);
}

function generateExamResults(studentId, filters = {}) {
  const exams = [
    { name: 'Mid-Term Exam', term: 'Term 1', academicYear: '2024-2025' },
    { name: 'Final Exam', term: 'Term 1', academicYear: '2024-2025' },
    { name: 'Mid-Term Exam', term: 'Term 2', academicYear: '2024-2025' },
    { name: 'Monthly Test - January', term: 'Term 2', academicYear: '2024-2025' },
    { name: 'Monthly Test - February', term: 'Term 2', academicYear: '2024-2025' }
  ];
  
  const results = exams.map(exam => {
    // Generate results for different subjects
    const subjects = [
      { name: 'Mathematics', totalMarks: 100, obtainedMarks: Math.floor(70 + Math.random() * 30) },
      { name: 'Physics', totalMarks: 100, obtainedMarks: Math.floor(65 + Math.random() * 35) },
      { name: 'Chemistry', totalMarks: 100, obtainedMarks: Math.floor(60 + Math.random() * 30) },
      { name: 'English', totalMarks: 100, obtainedMarks: Math.floor(75 + Math.random() * 25) },
      { name: 'Computer Science', totalMarks: 100, obtainedMarks: Math.floor(80 + Math.random() * 20) }
    ];
    
    // Calculate total and percentage
    const totalObtained = subjects.reduce((sum, subject) => sum + subject.obtainedMarks, 0);
    const totalPossible = subjects.reduce((sum, subject) => sum + subject.totalMarks, 0);
    const percentage = (totalObtained / totalPossible) * 100;
    
    // Calculate grade based on percentage
    let grade;
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';
    else grade = 'F';
    
    return {
      id: `exam_${exam.name.replace(/\s/g, '_').toLowerCase()}_${exam.term.replace(/\s/g, '_').toLowerCase()}`,
      name: exam.name,
      term: exam.term,
      academicYear: exam.academicYear,
      date: generateRandomDate(new Date('2024-01-01'), new Date('2024-06-30')),
      subjects,
      totalObtained,
      totalPossible,
      percentage: percentage.toFixed(2),
      grade,
      rank: Math.floor(Math.random() * 10) + 1, // Random rank from 1-10
      remarks: percentage >= 80 ? 'Excellent performance!' : 
              percentage >= 70 ? 'Good performance' : 
              percentage >= 60 ? 'Satisfactory' : 'Needs improvement'
    };
  });
  
  // Apply filters if provided
  let filteredResults = [...results];
  
  if (filters.term) {
    filteredResults = filteredResults.filter(result => result.term === filters.term);
  }
  
  if (filters.academicYear) {
    filteredResults = filteredResults.filter(result => result.academicYear === filters.academicYear);
  }
  
  return filteredResults;
}

function generateAssignmentResults(studentId, filters = {}) {
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'];
  const results = [];
  
  subjects.forEach(subject => {
    // Generate 3 assignments per subject
    for (let i = 1; i <= 3; i++) {
      const totalMarks = 20;
      const obtainedMarks = Math.floor((70 + Math.random() * 30) * totalMarks / 100);
      
      results.push({
        id: `assignment_${subject.toLowerCase()}_${i}`,
        subject,
        name: `Assignment ${i}`,
        description: `${subject} assignment on chapter ${i}`,
        assignedDate: generateRandomDate(new Date('2024-01-01'), new Date('2024-03-30')),
        dueDate: generateRandomDate(new Date('2024-01-15'), new Date('2024-04-15')),
        submissionDate: generateRandomDate(new Date('2024-01-10'), new Date('2024-04-10')),
        totalMarks,
        obtainedMarks,
        percentage: ((obtainedMarks / totalMarks) * 100).toFixed(2),
        status: Math.random() > 0.1 ? 'submitted' : 'late',
        feedback: obtainedMarks > 0.8 * totalMarks ? 'Excellent work!' : 
                 obtainedMarks > 0.6 * totalMarks ? 'Good effort.' : 
                 'Needs improvement.'
      });
    }
  });
  
  // Apply filters if provided
  let filteredResults = [...results];
  
  if (filters.subject) {
    filteredResults = filteredResults.filter(result => result.subject === filters.subject);
  }
  
  if (filters.status) {
    filteredResults = filteredResults.filter(result => result.status === filters.status);
  }
  
  return filteredResults;
}

function generateQuizResults(studentId, filters = {}) {
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'];
  const results = [];
  
  subjects.forEach(subject => {
    // Generate 4 quizzes per subject
    for (let i = 1; i <= 4; i++) {
      const totalMarks = 10;
      const obtainedMarks = Math.floor((70 + Math.random() * 30) * totalMarks / 100);
      
      results.push({
        id: `quiz_${subject.toLowerCase()}_${i}`,
        subject,
        name: `Quiz ${i}`,
        description: `${subject} quiz on chapter ${i}`,
        date: generateRandomDate(new Date('2024-01-01'), new Date('2024-04-30')),
        totalMarks,
        obtainedMarks,
        percentage: ((obtainedMarks / totalMarks) * 100).toFixed(2),
        status: 'completed'
      });
    }
  });
  
  // Apply filters if provided
  let filteredResults = [...results];
  
  if (filters.subject) {
    filteredResults = filteredResults.filter(result => result.subject === filters.subject);
  }
  
  return filteredResults;
}

function generateProjectResults(studentId, filters = {}) {
  return [
    {
      id: 'project_science_fair',
      name: 'Science Fair Project',
      subject: 'Science',
      description: 'Annual science fair project on renewable energy',
      assignedDate: '2024-02-15',
      dueDate: '2024-04-15',
      submissionDate: '2024-04-10',
      totalMarks: 100,
      obtainedMarks: 88,
      percentage: '88.00',
      grade: 'A',
      teammates: ['Ayesha Ahmed', 'Bilal Khan'],
      feedback: 'Excellent research and presentation. Well-documented experiment.',
      status: 'completed'
    },
    {
      id: 'project_literature_review',
      name: 'Literature Review',
      subject: 'English',
      description: 'Critical analysis of "To Kill a Mockingbird"',
      assignedDate: '2024-03-01',
      dueDate: '2024-03-30',
      submissionDate: '2024-03-28',
      totalMarks: 50,
      obtainedMarks: 42,
      percentage: '84.00',
      grade: 'B+',
      teammates: [],
      feedback: 'Good analysis. Could improve on supporting arguments.',
      status: 'completed'
    }
  ];
}

function generateSkillAssessments(studentId) {
  return [
    {
      category: 'Academic',
      skills: [
        { name: 'Critical Thinking', score: 8.5, outOf: 10 },
        { name: 'Problem Solving', score: 9.0, outOf: 10 },
        { name: 'Research Skills', score: 7.5, outOf: 10 },
        { name: 'Written Communication', score: 8.0, outOf: 10 },
        { name: 'Verbal Communication', score: 7.0, outOf: 10 }
      ]
    },
    {
      category: 'Social',
      skills: [
        { name: 'Teamwork', score: 8.0, outOf: 10 },
        { name: 'Leadership', score: 7.5, outOf: 10 },
        { name: 'Conflict Resolution', score: 6.5, outOf: 10 },
        { name: 'Emotional Intelligence', score: 7.0, outOf: 10 }
      ]
    },
    {
      category: 'Technical',
      skills: [
        { name: 'Computer Literacy', score: 9.5, outOf: 10 },
        { name: 'Data Analysis', score: 8.5, outOf: 10 },
        { name: 'Digital Content Creation', score: 8.0, outOf: 10 }
      ]
    }
  ];
}

// Helper to generate random dates within a range
function generateRandomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

// Async thunks
export const fetchStudentPerformance = createAsyncThunk(
  'studentPerformance/fetchPerformance',
  async ({ studentId, filters = {} }, { rejectWithValue }) => {
    try {
      const performance = await fetchStudentPerformanceAPI(studentId, filters);
      return performance;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addExamResult = createAsyncThunk(
  'studentPerformance/addExamResult',
  async ({ studentId, examResult }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate grade based on percentage
      const percentage = (examResult.totalObtained / examResult.totalPossible) * 100;
      let grade;
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';
      else grade = 'F';
      
      const newExamResult = {
        id: `exam_${examResult.name.replace(/\s/g, '_').toLowerCase()}_${Date.now()}`,
        ...examResult,
        percentage: percentage.toFixed(2),
        grade,
        remarks: percentage >= 80 ? 'Excellent performance!' : 
                percentage >= 70 ? 'Good performance' : 
                percentage >= 60 ? 'Satisfactory' : 'Needs improvement'
      };
      
      return { studentId, examResult: newExamResult };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  currentStudentId: null,
  overallGPA: 0,
  summary: {
    currentAverage: 0,
    lastTermAverage: 0,
    highestSubject: '',
    highestScore: 0,
    lowestSubject: '',
    lowestScore: 0,
    attendanceCorrelation: 0
  },
  examResults: [],
  assignmentResults: [],
  quizResults: [],
  projectResults: [],
  skillAssessments: [],
  filters: {
    term: '',
    academicYear: '',
    subject: '',
    dateRange: {
      startDate: '',
      endDate: ''
    },
    resultType: 'all' // all, exam, assignment, quiz, project
  },
  loading: false,
  error: null,
  addingResult: false,
  addingResultError: null
};

const studentPerformanceSlice = createSlice({
  name: 'studentPerformance',
  initialState,
  reducers: {
    setPerformanceFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearPerformanceFilters(state) {
      state.filters = {
        term: '',
        academicYear: '',
        subject: '',
        dateRange: {
          startDate: '',
          endDate: ''
        },
        resultType: 'all'
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch student performance
      .addCase(fetchStudentPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentPerformance.fulfilled, (state, action) => {
        const { 
          studentId, 
          overallGPA, 
          summary, 
          examResults, 
          assignmentResults, 
          quizResults, 
          projectResults, 
          skillAssessments 
        } = action.payload;
        
        state.currentStudentId = studentId;
        state.overallGPA = overallGPA;
        state.summary = summary;
        state.examResults = examResults;
        state.assignmentResults = assignmentResults;
        state.quizResults = quizResults;
        state.projectResults = projectResults;
        state.skillAssessments = skillAssessments;
        state.loading = false;
      })
      .addCase(fetchStudentPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add exam result
      .addCase(addExamResult.pending, (state) => {
        state.addingResult = true;
        state.addingResultError = null;
      })
      .addCase(addExamResult.fulfilled, (state, action) => {
        const { examResult } = action.payload;
        state.examResults.push(examResult);
        state.addingResult = false;
        
        // Update summary statistics based on new result
        // This is a simplified version - in a real app, this would be more comprehensive
        const allResults = [...state.examResults];
        if (allResults.length > 0) {
          // Calculate new average
          const totalPercentage = allResults.reduce((sum, result) => {
            return sum + parseFloat(result.percentage);
          }, 0);
          state.summary.currentAverage = (totalPercentage / allResults.length).toFixed(2);
          
          // Find new highest and lowest subjects
          let highestScore = 0;
          let lowestScore = 100;
          let highestSubject = '';
          let lowestSubject = '';
          
          allResults.forEach(result => {
            result.subjects.forEach(subject => {
              const percentage = (subject.obtainedMarks / subject.totalMarks) * 100;
              if (percentage > highestScore) {
                highestScore = percentage;
                highestSubject = subject.name;
              }
              if (percentage < lowestScore) {
                lowestScore = percentage;
                lowestSubject = subject.name;
              }
            });
          });
          
          state.summary.highestSubject = highestSubject;
          state.summary.highestScore = highestScore;
          state.summary.lowestSubject = lowestSubject;
          state.summary.lowestScore = lowestScore;
        }
      })
      .addCase(addExamResult.rejected, (state, action) => {
        state.addingResult = false;
        state.addingResultError = action.payload;
      });
  }
});

export const { 
  setPerformanceFilters,
  clearPerformanceFilters
} = studentPerformanceSlice.actions;

export default studentPerformanceSlice.reducer;

// Selectors
export const selectPerformanceSummary = (state) => state.studentPerformance.summary;
export const selectOverallGPA = (state) => state.studentPerformance.overallGPA;
export const selectExamResults = (state) => state.studentPerformance.examResults;
export const selectAssignmentResults = (state) => state.studentPerformance.assignmentResults;
export const selectQuizResults = (state) => state.studentPerformance.quizResults;
export const selectProjectResults = (state) => state.studentPerformance.projectResults;
export const selectSkillAssessments = (state) => state.studentPerformance.skillAssessments;
export const selectPerformanceFilters = (state) => state.studentPerformance.filters;
export const selectPerformanceLoading = (state) => state.studentPerformance.loading;

// Filtered results based on current filters
export const selectFilteredResults = (state) => {
  const { term, academicYear, subject, dateRange, resultType } = state.studentPerformance.filters;
  
  // Get results based on type
  let results = [];
  
  switch(resultType) {
    case 'exam':
      results = state.studentPerformance.examResults;
      break;
    case 'assignment':
      results = state.studentPerformance.assignmentResults;
      break;
    case 'quiz':
      results = state.studentPerformance.quizResults;
      break;
    case 'project':
      results = state.studentPerformance.projectResults;
      break;
    case 'all':
    default:
      // Combine all results with a type identifier
      results = [
        ...state.studentPerformance.examResults.map(r => ({ ...r, type: 'exam' })),
        ...state.studentPerformance.assignmentResults.map(r => ({ ...r, type: 'assignment' })),
        ...state.studentPerformance.quizResults.map(r => ({ ...r, type: 'quiz' })),
        ...state.studentPerformance.projectResults.map(r => ({ ...r, type: 'project' }))
      ];
  }
  
  // Apply filters
  return results.filter(result => {
    // Filter by term
    const matchesTerm = !term || result.term === term;
    
    // Filter by academic year
    const matchesYear = !academicYear || result.academicYear === academicYear;
    
    // Filter by subject
    const matchesSubject = !subject || result.subject === subject;
    
    // Filter by date range
    let matchesDateRange = true;
    if (dateRange.startDate && dateRange.endDate) {
      const resultDate = new Date(result.date || result.submissionDate);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      matchesDateRange = resultDate >= startDate && resultDate <= endDate;
    }
    
    return matchesTerm && matchesYear && matchesSubject && matchesDateRange;
  });
};
