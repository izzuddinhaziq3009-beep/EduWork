import type { Step } from 'react-joyride'
import type { UserRole } from '@/types'

export function tourStepsForRole(role: UserRole): Step[] {
  switch (role) {
    case 'student':
      return [
        {
          target:      '[data-tour="modules"]',
          title:       'Learning Modules',
          content:     'Browse structured modules, enroll, and track your progress step by step.',
          skipBeacon:  true,
          placement:   'right',
        },
        {
          target:    '[data-tour="classes"]',
          title:     'My Classes',
          content:   'Join a class with a code from your mentor — all your enrolled classes show up here.',
          placement: 'right',
        },
        {
          target:    '[data-tour="projects"]',
          title:     'Projects',
          content:   'Submit your module work for mentor review and receive structured feedback.',
          placement: 'right',
        },
        {
          target:    '[data-tour="progress"]',
          title:     'My Progress',
          content:   'See your overall learning progress — modules completed, submissions approved, and more.',
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
          target:    '[data-tour="messages"]',
          title:     'Messages',
          content:   'Chat with your mentor or company contacts here.',
          placement: 'right',
        },
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
          target:    '[data-tour="messages"]',
          title:     'Messages',
          content:   'Chat with students who have submitted to your challenges.',
          placement: 'right',
        },
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
      ]
  }
}
