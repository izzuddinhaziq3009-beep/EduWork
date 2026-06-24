export type UserRole = 'student' | 'mentor' | 'admin' | 'company'
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'
export type SubmissionStatus = 'submitted' | 'reviewing' | 'approved' | 'revision_requested'
export type MentorshipStatus = 'pending' | 'accepted' | 'rejected'
export type FeedbackStatus = 'approved' | 'revision_requested'
export type PortfolioItemType = 'module' | 'project' | 'challenge' | 'independent_project'
export type IndependentProjectStatus = 'in_progress' | 'submitted' | 'completed'
export type ChallengeSubmissionStatus = 'submitted' | 'reviewing' | 'feedback_given' | 'completed'
export type ReviewerType = 'company' | 'mentor' | 'admin'
export type NotificationType = 'feedback' | 'mentorship' | 'challenge' | 'project' | 'system'
export type ModuleType = 'simple' | 'structured'
export type ContentItemType = 'text' | 'video' | 'pdf' | 'image'
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer'
export type ModuleItemType = 'content' | 'quiz'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  email: string
  avatar_url: string | null
  created_at: string
  is_active?: boolean           // added via supabase-admin-migration.sql
  // Company-only fields (added via supabase-company-migration.sql)
  company_description?: string | null
  company_website?:     string | null
  company_industry?:    string | null
}

export interface LearningModule {
  id: string
  title: string
  description: string
  difficulty_level: DifficultyLevel
  duration_hours: number
  content: Record<string, unknown>
  created_by: string
  created_at: string
  is_active: boolean
  module_type: ModuleType            // added via supabase-module-sections-migration.sql
  simple_content?: string | null
}

export interface StudentModuleProgress {
  id: string
  student_id: string
  module_id: string
  progress: number
  completed: boolean
  completed_at: string | null
  last_accessed: string
}

export interface ModuleItem {
  id: string
  module_id: string
  type: ModuleItemType
  title: string
  description: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface ModuleItemContent {
  id: string
  item_id: string
  content_type: ContentItemType
  title: string
  description: string | null
  content_text: string | null
  file_url: string | null
  order_index: number
  created_at: string
}

export interface ModuleItemQuiz {
  id: string
  item_id: string
  passing_score: number
  time_limit_minutes: number | null
  shuffle_questions: boolean
  show_correct_answers: boolean
  attempts_allowed: number      // -1 = unlimited
  created_at: string
  updated_at: string
}

export interface StudentItemProgress {
  id: string
  student_id: string
  item_id: string
  is_completed: boolean
  quiz_passed: boolean
  completed_at: string | null
  created_at: string
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  type: QuestionType
  question_text: string
  description: string | null
  order_index: number
  points: number
  created_at: string
}

export interface QuizQuestionOption {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
  order_index: number
  created_at: string
}

export interface QuizQuestionAnswer {
  id: string
  question_id: string
  answer_text: string
  is_correct: boolean
  created_at: string
}

export interface StudentQuizAttempt {
  id: string
  student_id: string
  quiz_id: string
  started_at: string
  completed_at: string | null
  score: number | null
  passed: boolean | null
  time_spent_seconds: number | null
  attempt_number: number
  created_at: string
}

export interface StudentQuizAnswer {
  id: string
  attempt_id: string
  question_id: string
  student_answer: string | null
  is_correct: boolean | null
  points_earned: number | null
  created_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  requirements: string
  due_date: string
  module_id: string | null
  created_by: string
  created_at: string
  is_active: boolean
}

export interface ProjectSubmission {
  id: string
  project_id: string
  student_id: string
  submission_content: string
  file_url: string | null
  status: SubmissionStatus
  submitted_at: string
}

export interface MentorshipRequest {
  id: string
  student_id: string
  mentor_id: string
  status: MentorshipStatus
  message: string
  created_at: string
}

export interface MentorFeedback {
  id: string
  submission_id: string
  mentor_id: string
  student_id: string
  feedback_text: string
  status: FeedbackStatus
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
}

export interface DigitalPortfolio {
  id: string
  student_id: string
  title: string
  bio: string
  skills: string[]
  is_public: boolean
  public_url: string | null
  created_at: string
  updated_at: string
}

export interface PortfolioItem {
  id: string
  portfolio_id: string
  type: PortfolioItemType
  reference_id: string
  title: string
  description: string
  created_at: string
}

export interface IndependentProject {
  id: string
  title: string
  description: string
  student_id: string
  status: IndependentProjectStatus
  github_url: string | null
  created_at: string
  completed_at: string | null
}

export interface IndustryChallenge {
  id: string
  company_id: string
  title: string
  description: string
  requirements: string
  difficulty_level: DifficultyLevel
  deadline: string
  is_active: boolean
  is_approved: boolean
  created_at: string
  rejection_reason?: string | null   // added via supabase-challenge-rejection-migration.sql
  rejected_at?:      string | null
}

export interface ChallengeSubmission {
  id: string
  challenge_id: string
  student_id: string
  github_url: string
  github_username: string
  github_repo_name: string
  github_verified: boolean
  github_commit_count: number
  readme_exists: boolean
  privacy_file_exists: boolean
  status: ChallengeSubmissionStatus
  submitted_at: string
}

export interface ChallengeFeedback {
  id: string
  submission_id: string
  reviewer_id: string
  reviewer_type: ReviewerType
  feedback_text: string
  rating: number
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  description: string
  created_at: string
}

// ── Database type for the Supabase client ──────────────────────────────────
// Insert/Update types are written as explicit flat types (not Omit<> intersections)
// so Supabase's TypeScript client can resolve them correctly.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: {
          id: string
          full_name: string
          role?: UserRole
          email: string
          avatar_url?: string | null
          created_at?: string
          is_active?: boolean
          company_description?: string | null
          company_website?: string | null
          company_industry?: string | null
        }
        Update: {
          full_name?: string
          role?: UserRole
          email?: string
          avatar_url?: string | null
          created_at?: string
          is_active?: boolean
          company_description?: string | null
          company_website?: string | null
          company_industry?: string | null
        }
      }
      learning_modules: {
        Row: LearningModule
        Insert: {
          id?: string
          title: string
          description: string
          difficulty_level: DifficultyLevel
          duration_hours: number
          content?: Record<string, unknown>
          created_by: string
          created_at?: string
          is_active?: boolean
          module_type?: ModuleType
          simple_content?: string | null
        }
        Update: {
          title?: string
          description?: string
          difficulty_level?: DifficultyLevel
          duration_hours?: number
          content?: Record<string, unknown>
          is_active?: boolean
          simple_content?: string | null
        }
      }
      module_items: {
        Row: ModuleItem
        Insert: {
          id?: string
          module_id: string
          type: ModuleItemType
          title: string
          description?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          order_index?: number
          updated_at?: string
        }
      }
      module_item_content: {
        Row: ModuleItemContent
        Insert: {
          id?: string
          item_id: string
          content_type: ContentItemType
          title?: string
          description?: string | null
          content_text?: string | null
          file_url?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          content_type?: ContentItemType
          title?: string
          description?: string | null
          content_text?: string | null
          file_url?: string | null
          order_index?: number
        }
      }
      module_item_quizzes: {
        Row: ModuleItemQuiz
        Insert: {
          id?: string
          item_id: string
          passing_score?: number
          time_limit_minutes?: number | null
          shuffle_questions?: boolean
          show_correct_answers?: boolean
          attempts_allowed?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          passing_score?: number
          time_limit_minutes?: number | null
          shuffle_questions?: boolean
          show_correct_answers?: boolean
          attempts_allowed?: number
          updated_at?: string
        }
      }
      student_item_progress: {
        Row: StudentItemProgress
        Insert: {
          id?: string
          student_id: string
          item_id: string
          is_completed?: boolean
          quiz_passed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          is_completed?: boolean
          quiz_passed?: boolean
          completed_at?: string | null
        }
      }
      quiz_questions: {
        Row: QuizQuestion
        Insert: {
          id?: string
          quiz_id: string
          type: QuestionType
          question_text: string
          description?: string | null
          order_index?: number
          points?: number
          created_at?: string
        }
        Update: {
          type?: QuestionType
          question_text?: string
          description?: string | null
          order_index?: number
          points?: number
        }
      }
      quiz_question_options: {
        Row: QuizQuestionOption
        Insert: {
          id?: string
          question_id: string
          option_text: string
          is_correct?: boolean
          order_index?: number
          created_at?: string
        }
        Update: {
          option_text?: string
          is_correct?: boolean
          order_index?: number
        }
      }
      quiz_question_answers: {
        Row: QuizQuestionAnswer
        Insert: {
          id?: string
          question_id: string
          answer_text: string
          is_correct?: boolean
          created_at?: string
        }
        Update: {
          answer_text?: string
          is_correct?: boolean
        }
      }
      student_quiz_attempts: {
        Row: StudentQuizAttempt
        Insert: {
          id?: string
          student_id: string
          quiz_id: string
          started_at?: string
          completed_at?: string | null
          score?: number | null
          passed?: boolean | null
          time_spent_seconds?: number | null
          attempt_number?: number
          created_at?: string
        }
        Update: {
          completed_at?: string | null
          score?: number | null
          passed?: boolean | null
          time_spent_seconds?: number | null
        }
      }
      student_quiz_answers: {
        Row: StudentQuizAnswer
        Insert: {
          id?: string
          attempt_id: string
          question_id: string
          student_answer?: string | null
          is_correct?: boolean | null
          points_earned?: number | null
          created_at?: string
        }
        Update: {
          student_answer?: string | null
          is_correct?: boolean | null
          points_earned?: number | null
        }
      }
      student_module_progress: {
        Row: StudentModuleProgress
        Insert: {
          id?: string
          student_id: string
          module_id: string
          progress?: number
          completed?: boolean
          completed_at?: string | null
          last_accessed?: string
        }
        Update: {
          progress?: number
          completed?: boolean
          completed_at?: string | null
          last_accessed?: string
        }
      }
      projects: {
        Row: Project
        Insert: {
          id?: string
          title: string
          description: string
          requirements: string
          due_date: string
          module_id?: string | null
          created_by: string
          created_at?: string
          is_active?: boolean
        }
        Update: {
          title?: string
          description?: string
          requirements?: string
          due_date?: string
          module_id?: string | null
          is_active?: boolean
        }
      }
      project_submissions: {
        Row: ProjectSubmission
        Insert: {
          id?: string
          project_id: string
          student_id: string
          submission_content: string
          file_url?: string | null
          status?: SubmissionStatus
          submitted_at?: string
        }
        Update: {
          submission_content?: string
          file_url?: string | null
          status?: SubmissionStatus
        }
      }
      mentorship_requests: {
        Row: MentorshipRequest
        Insert: {
          id?: string
          student_id: string
          mentor_id: string
          status?: MentorshipStatus
          message: string
          created_at?: string
        }
        Update: {
          status?: MentorshipStatus
          message?: string
        }
      }
      mentor_feedback: {
        Row: MentorFeedback
        Insert: {
          id?: string
          submission_id: string
          mentor_id: string
          student_id: string
          feedback_text: string
          status: FeedbackStatus
          created_at?: string
        }
        Update: {
          feedback_text?: string
          status?: FeedbackStatus
        }
      }
      messages: {
        Row: Message
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          content?: string
          read?: boolean
        }
      }
      digital_portfolio: {
        Row: DigitalPortfolio
        Insert: {
          id?: string
          student_id: string
          title: string
          bio: string
          skills?: string[]
          is_public?: boolean
          public_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          bio?: string
          skills?: string[]
          is_public?: boolean
          public_url?: string | null
          updated_at?: string
        }
      }
      portfolio_items: {
        Row: PortfolioItem
        Insert: {
          id?: string
          portfolio_id: string
          type: PortfolioItemType
          reference_id: string
          title: string
          description: string
          created_at?: string
        }
        Update: {
          title?: string
          description?: string
        }
      }
      independent_projects: {
        Row: IndependentProject
        Insert: {
          id?: string
          title: string
          description: string
          student_id: string
          status?: IndependentProjectStatus
          github_url?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          title?: string
          description?: string
          status?: IndependentProjectStatus
          github_url?: string | null
          completed_at?: string | null
        }
      }
      industry_challenges: {
        Row: IndustryChallenge
        Insert: {
          id?: string
          company_id: string
          title: string
          description: string
          requirements: string
          difficulty_level: DifficultyLevel
          deadline: string
          is_active?: boolean
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          title?: string
          description?: string
          requirements?: string
          difficulty_level?: DifficultyLevel
          deadline?: string
          is_active?: boolean
          is_approved?: boolean
          rejection_reason?: string | null
          rejected_at?: string | null
        }
      }
      challenge_submissions: {
        Row: ChallengeSubmission
        Insert: {
          id?: string
          challenge_id: string
          student_id: string
          github_url: string
          github_username: string
          github_repo_name: string
          github_verified?: boolean
          github_commit_count?: number
          readme_exists?: boolean
          privacy_file_exists?: boolean
          status?: ChallengeSubmissionStatus
          submitted_at?: string
        }
        Update: {
          github_url?: string
          github_username?: string
          github_repo_name?: string
          github_verified?: boolean
          github_commit_count?: number
          readme_exists?: boolean
          privacy_file_exists?: boolean
          status?: ChallengeSubmissionStatus
        }
      }
      challenge_feedback: {
        Row: ChallengeFeedback
        Insert: {
          id?: string
          submission_id: string
          reviewer_id: string
          reviewer_type: ReviewerType
          feedback_text: string
          rating: number
          created_at?: string
        }
        Update: {
          feedback_text?: string
          rating?: number
        }
      }
      notifications: {
        Row: Notification
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: NotificationType
          read?: boolean
          created_at?: string
        }
        Update: {
          title?: string
          message?: string
          read?: boolean
        }
      }
      activity_logs: {
        Row: ActivityLog
        Insert: {
          id?: string
          user_id: string
          action: string
          description: string
          created_at?: string
        }
        Update: {
          action?: string
          description?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      difficulty_level: DifficultyLevel
      submission_status: SubmissionStatus
      mentorship_status: MentorshipStatus
      feedback_status: FeedbackStatus
      portfolio_item_type: PortfolioItemType
      independent_project_status: IndependentProjectStatus
      challenge_submission_status: ChallengeSubmissionStatus
      reviewer_type: ReviewerType
      notification_type: NotificationType
    }
  }
}
