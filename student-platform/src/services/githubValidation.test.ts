import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn() } }))

import { validateGitHubUrl } from './challengeService'

function jsonResponse(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) } as Response
}

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

describe('validateGitHubUrl — URL format', () => {
  it('rejects a non-GitHub URL without making any network calls', async () => {
    const result = await validateGitHubUrl('https://gitlab.com/user/repo')
    expect(result.isValid).toBe(false)
    expect(result.steps.urlFormat.status).toBe('error')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a malformed URL', async () => {
    const result = await validateGitHubUrl('not a url')
    expect(result.isValid).toBe(false)
    expect(result.steps.urlFormat.status).toBe('error')
  })

  it('extracts username and repo name from a valid GitHub URL', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ private: false }))
    fetchMock.mockResolvedValueOnce(jsonResponse({}))
    fetchMock.mockResolvedValueOnce(jsonResponse({}))
    fetchMock.mockResolvedValueOnce(jsonResponse(Array(5).fill({})))
    const result = await validateGitHubUrl('https://github.com/octocat/hello-world')
    expect(result.steps.urlFormat.status).toBe('success')
    expect(result.username).toBe('octocat')
    expect(result.repoName).toBe('hello-world')
  })
})

describe('validateGitHubUrl — repo existence and visibility', () => {
  it('errors when the repo does not exist (404)', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 404))
    const result = await validateGitHubUrl('https://github.com/octocat/missing-repo')
    expect(result.isValid).toBe(false)
    expect(result.steps.repoPublic).toEqual({ status: 'error', message: 'Repository not found' })
  })

  it('errors when the repo is private', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ private: true }))
    const result = await validateGitHubUrl('https://github.com/octocat/private-repo')
    expect(result.isValid).toBe(false)
    expect(result.steps.repoPublic).toEqual({ status: 'error', message: 'Repository must be public' })
  })

  it('errors when the GitHub API is unreachable', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 500))
    const result = await validateGitHubUrl('https://github.com/octocat/hello-world')
    expect(result.isValid).toBe(false)
    expect(result.steps.repoPublic.status).toBe('error')
  })

  it('errors when fetch throws (network failure)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'))
    const result = await validateGitHubUrl('https://github.com/octocat/hello-world')
    expect(result.isValid).toBe(false)
    expect(result.steps.repoPublic).toEqual({ status: 'error', message: 'Could not reach GitHub API' })
  })
})

describe('validateGitHubUrl — README check', () => {
  it('errors when README.md is missing', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ private: false }))
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 404))
    const result = await validateGitHubUrl('https://github.com/octocat/hello-world')
    expect(result.isValid).toBe(false)
    expect(result.steps.readme).toEqual({ status: 'error', message: 'README.md not found in repository root' })
  })
})

describe('validateGitHubUrl — privacy file check', () => {
  it('errors when .github/SUBMISSION_PRIVACY.md is missing', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ private: false }))
    fetchMock.mockResolvedValueOnce(jsonResponse({}))
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 404))
    const result = await validateGitHubUrl('https://github.com/octocat/hello-world')
    expect(result.isValid).toBe(false)
    expect(result.steps.privacy).toEqual({ status: 'error', message: '.github/SUBMISSION_PRIVACY.md not found' })
  })
})

describe('validateGitHubUrl — minimum commit count', () => {
  it('errors when there are fewer than 3 commits', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ private: false }))
    fetchMock.mockResolvedValueOnce(jsonResponse({}))
    fetchMock.mockResolvedValueOnce(jsonResponse({}))
    fetchMock.mockResolvedValueOnce(jsonResponse([{}, {}]))
    const result = await validateGitHubUrl('https://github.com/octocat/hello-world')
    expect(result.isValid).toBe(false)
    expect(result.steps.commits).toEqual({ status: 'error', message: 'Minimum 3 commits required (found 2)' })
  })

  it('accepts exactly 3 commits', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ private: false }))
    fetchMock.mockResolvedValueOnce(jsonResponse({}))
    fetchMock.mockResolvedValueOnce(jsonResponse({}))
    fetchMock.mockResolvedValueOnce(jsonResponse([{}, {}, {}]))
    const result = await validateGitHubUrl('https://github.com/octocat/hello-world')
    expect(result.isValid).toBe(true)
    expect(result.commitCount).toBe(3)
  })

  it('labels exactly 100 commits as "100+" (the API page-size cap)', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ private: false }))
    fetchMock.mockResolvedValueOnce(jsonResponse({}))
    fetchMock.mockResolvedValueOnce(jsonResponse({}))
    fetchMock.mockResolvedValueOnce(jsonResponse(Array(100).fill({})))
    const result = await validateGitHubUrl('https://github.com/octocat/hello-world')
    expect(result.steps.commits.message).toBe('100+ commits found')
  })
})

describe('validateGitHubUrl — full success path', () => {
  it('marks the result valid when every step passes', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ private: false }))
    fetchMock.mockResolvedValueOnce(jsonResponse({}))
    fetchMock.mockResolvedValueOnce(jsonResponse({}))
    fetchMock.mockResolvedValueOnce(jsonResponse([{}, {}, {}, {}, {}]))
    const result = await validateGitHubUrl('https://github.com/octocat/hello-world')
    expect(result.isValid).toBe(true)
    expect(result.username).toBe('octocat')
    expect(result.repoName).toBe('hello-world')
    expect(result.readmeExists).toBe(true)
    expect(result.privacyFileExists).toBe(true)
    expect(result.commitCount).toBe(5)
    expect(Object.values(result.steps).every(s => s.status === 'success')).toBe(true)
  })
})
