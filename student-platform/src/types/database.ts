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

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  email: string
  avatar_url: string | null
  created_at: string
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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'> & { created_at?: string }
        Update: Partial<Omit<Profile, 'id'>>
      }
      learning_modules: {
        Row: LearningModule
        Insert: Omit<LearningModule, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<LearningModule, 'id'>>
      }
      student_module_progress: {
        Row: StudentModuleProgress
        Insert: Omit<StudentModuleProgress, 'id'> & { id?: string }
        Update: Partial<Omit<StudentModuleProgress, 'id'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Project, 'id'>>
      }
      project_submissions: {
        Row: ProjectSubmission
        Insert: Omit<ProjectSubmission, 'id' | 'submitted_at'> & { id?: string; submitted_at?: string }
        Update: Partial<Omit<ProjectSubmission, 'id'>>
      }
      mentorship_requests: {
        Row: MentorshipRequest
        Insert: Omit<MentorshipRequest, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<MentorshipRequest, 'id'>>
      }
      mentor_feedback: {
        Row: MentorFeedback
        Insert: Omit<MentorFeedback, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<MentorFeedback, 'id'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Message, 'id'>>
      }
      digital_portfolio: {
        Row: DigitalPortfolio
        Insert: Omit<DigitalPortfolio, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Omit<DigitalPortfolio, 'id'>>
      }
      portfolio_items: {
        Row: PortfolioItem
        Insert: Omit<PortfolioItem, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<PortfolioItem, 'id'>>
      }
      independent_projects: {
        Row: IndependentProject
        Insert: Omit<IndependentProject, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<IndependentProject, 'id'>>
      }
      industry_challenges: {
        Row: IndustryChallenge
        Insert: Omit<IndustryChallenge, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<IndustryChallenge, 'id'>>
      }
      challenge_submissions: {
        Row: ChallengeSubmission
        Insert: Omit<ChallengeSubmission, 'id' | 'submitted_at'> & { id?: string; submitted_at?: string }
        Update: Partial<Omit<ChallengeSubmission, 'id'>>
      }
      challenge_feedback: {
        Row: ChallengeFeedback
        Insert: Omit<ChallengeFeedback, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<ChallengeFeedback, 'id'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Notification, 'id'>>
      }
      activity_logs: {
        Row: ActivityLog
        Insert: Omit<ActivityLog, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<ActivityLog, 'id'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
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
