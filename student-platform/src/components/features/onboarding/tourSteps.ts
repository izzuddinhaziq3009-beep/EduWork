import type { Step } from 'react-joyride'
import type { UserRole } from '@/types'

// Shared final step that points users to the profile menu where they can replay the tour
const PROFILE_MENU_STEP: Step = {
  target:    '[data-tour="profile-menu"]',
  title:     'Replay this tour anytime',
  content:   'Need a refresher? Open this profile menu and choose "Take a tour" to run this walkthrough again.',
  placement: 'bottom',
}

export function tourStepsForRole(role: UserRole): Step[] {
  switch (role) {
    case 'student':
      return [
        {
          target:     '[data-tour="learning"]',
          title:      'Learning',
          content:    'Browse learning modules, join a mentor\'s class with a code, and view the certificates you\'ve earned — all under Learning.',
          skipBeacon: true,
          placement:  'right',
        },
        {
          target:    '[data-tour="projects"]',
          title:     'Projects',
          content:   'Submit your module work for mentor review, and manage your own independent projects — both live here under Projects.',
          placement: 'right',
        },
        {
          target:    '[data-tour="mentorship"]',
          title:     'Mentorship',
          content:   'Request a mentor or message your current mentor directly from here.',
          placement: 'right',
        },
        {
          target:    '[data-tour="portfolio"]',
          title:     'Portfolio',
          content:   'Showcase your completed work — modules, projects, and challenges — to companies.',
          placement: 'right',
        },
        {
          target:    '[data-tour="challenges"]',
          title:     'Industry Challenges',
          content:   'Browse challenges posted by companies and submit your solutions with a GitHub repository.',
          placement: 'right',
        },
        {
          target:    '[data-tour="messages"]',
          title:     'Messages',
          content:   'Chat with your mentor or company contacts here.',
          placement: 'right',
        },
        PROFILE_MENU_STEP,
      ]

    case 'mentor':
      return [
        {
          target:     '[data-tour="classes"]',
          title:      'My Classes',
          content:    'Create a class and share the join code with your students so they can enroll.',
          skipBeacon: true,
          placement:  'right',
        },
        {
          target:    '[data-tour="submissions"]',
          title:     'Student Submissions',
          content:   'Review, approve, or request revisions on work submitted by your students.',
          placement: 'right',
        },
        {
          target:    '[data-tour="requests"]',
          title:     'Mentorship Requests',
          content:   'Accept or decline incoming mentorship requests from students.',
          placement: 'right',
        },
        {
          target:    '[data-tour="messages"]',
          title:     'Messages',
          content:   'Chat with any of your students directly.',
          placement: 'right',
        },
        PROFILE_MENU_STEP,
      ]

    case 'company':
      return [
        {
          target:     '[data-tour="post-challenge"]',
          title:      'Post a Challenge',
          content:    'Create real-world challenges for students to solve and submit solutions.',
          skipBeacon: true,
          placement:  'right',
        },
        {
          target:    '[data-tour="my-challenges"]',
          title:     'My Challenges',
          content:   'View and manage all the challenges you have posted.',
          placement: 'right',
        },
        {
          target:    '[data-tour="submissions"]',
          title:     'Submissions',
          content:   'Review student submissions and give feedback on their challenge solutions.',
          placement: 'right',
        },
        {
          target:    '[data-tour="showcase"]',
          title:     'Student Showcase',
          content:   'Browse independent projects completed by students and message those whose work interests you.',
          placement: 'right',
        },
        {
          target:    '[data-tour="messages"]',
          title:     'Messages',
          content:   'Chat with students who have submitted to your challenges.',
          placement: 'right',
        },
        PROFILE_MENU_STEP,
      ]

    case 'admin':
      return [
        {
          target:     '[data-tour="users"]',
          title:      'User Management',
          content:    'Approve mentor and company accounts, deactivate users, and manage all profiles.',
          skipBeacon: true,
          placement:  'right',
        },
        {
          target:    '[data-tour="content"]',
          title:     'Content Management',
          content:   'Create, edit, and publish learning modules for students.',
          placement: 'right',
        },
        {
          target:    '[data-tour="moderation"]',
          title:     'Challenge Moderation',
          content:   'Review and approve industry challenges posted by companies before they go live.',
          placement: 'right',
        },
        {
          target:    '[data-tour="monitoring"]',
          title:     'System Monitoring',
          content:   'View system health, recent activity logs, and platform usage metrics.',
          placement: 'right',
        },
        PROFILE_MENU_STEP,
      ]
  }
}
