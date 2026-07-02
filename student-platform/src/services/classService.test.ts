import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { ok, fail, queueFromResults } from '@/test/supabaseMock'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn(), rpc: vi.fn() } }))
vi.mock('@/utils/activityLog', () => ({ logActivity: vi.fn() }))

import { supabase } from './supabase'
import {
  getMentorClasses, createClass, resetClassCode, deactivateClass, getClassRoster, redeemClassCode,
  getStudentClasses,
} from './classService'

const fromMock = supabase.from as Mock
const rpcMock  = supabase.rpc  as Mock

beforeEach(() => {
  fromMock.mockReset()
  rpcMock.mockReset()
})

const CLASS_ROW = {
  id: 'cls1', module_id: 'mod1', mentor_id: 'men1',
  name: 'React Cohort A', join_code: 'ABC12345', is_active: true, created_at: '2025-01-01',
}

describe('getStudentClasses', () => {
  const ENROLLMENT     = { class_id: 'cls1' }
  const CLASS_ACTIVE   = { id: 'cls1', name: 'React Cohort A', module_id: 'mod1', mentor_id: 'men1' }
  const MODULE_ROW     = {
    id: 'mod1', title: 'React 101', description: 'Learn React fundamentals',
    difficulty_level: 'beginner', duration_hours: 4,
    module_image_url: null, module_color: 'indigo',
  }
  const MENTOR_PROFILE = { id: 'men1', full_name: 'Dr. Smith' }
  const PROGRESS_ROW   = { module_id: 'mod1', progress: 42, completed: false }

  it('returns full class rows with module meta, mentor, progress, and classmate count', async () => {
    queueFromResults(fromMock, [
      ok([ENROLLMENT]),
      ok([CLASS_ACTIVE]),
      ok([MODULE_ROW]),
      ok([MENTOR_PROFILE]),
      ok([PROGRESS_ROW]),
      ok([{ class_id: 'cls1' }, { class_id: 'cls1' }]),   // 2 enrollments
    ])
    const result = await getStudentClasses('stu1')
    expect(result).toHaveLength(1)
    expect(result[0].classId).toBe('cls1')
    expect(result[0].className).toBe('React Cohort A')
    expect(result[0].moduleTitle).toBe('React 101')
    expect(result[0].moduleDescription).toBe('Learn React fundamentals')
    expect(result[0].difficultyLevel).toBe('beginner')
    expect(result[0].durationHours).toBe(4)
    expect(result[0].moduleImageUrl).toBeNull()
    expect(result[0].moduleColor).toBe('indigo')
    expect(result[0].mentorName).toBe('Dr. Smith')
    expect(result[0].progress).toBe(42)
    expect(result[0].completed).toBe(false)
    expect(result[0].classmatesCount).toBe(2)
    expect(fromMock).toHaveBeenCalledTimes(6)
  })

  it('returns empty array and skips all further queries when student has no enrollments', async () => {
    queueFromResults(fromMock, [ok([])])
    const result = await getStudentClasses('stu1')
    expect(result).toEqual([])
    expect(fromMock).toHaveBeenCalledTimes(1)
  })

  it('returns empty array when enrolled classes are all inactive', async () => {
    queueFromResults(fromMock, [
      ok([ENROLLMENT]),
      ok([]),
    ])
    const result = await getStudentClasses('stu1')
    expect(result).toEqual([])
    expect(fromMock).toHaveBeenCalledTimes(2)
  })

  it('defaults progress and classmatesCount to 0 when no matching rows exist', async () => {
    queueFromResults(fromMock, [
      ok([ENROLLMENT]),
      ok([CLASS_ACTIVE]),
      ok([MODULE_ROW]),
      ok([MENTOR_PROFILE]),
      ok([]),   // no progress row
      ok([]),   // no enrollment count rows
    ])
    const [row] = await getStudentClasses('stu1')
    expect(row.progress).toBe(0)
    expect(row.completed).toBe(false)
    expect(row.classmatesCount).toBe(0)
    expect(fromMock).toHaveBeenCalledTimes(6)
  })

  it('throws when the enrollments query errors', async () => {
    queueFromResults(fromMock, [fail(new Error('db down'))])
    await expect(getStudentClasses('stu1')).rejects.toThrow('db down')
  })
})

describe('getMentorClasses', () => {
  it('returns classes with module titles and enrollment counts', async () => {
    queueFromResults(fromMock, [
      ok([CLASS_ROW]),
      ok([{ id: 'mod1', title: 'React 101' }]),
      ok([{ class_id: 'cls1' }, { class_id: 'cls1' }]),
    ])
    const result = await getMentorClasses('men1')
    expect(result).toHaveLength(1)
    expect(result[0].module_title).toBe('React 101')
    expect(result[0].enrolled_count).toBe(2)
    expect(result[0].join_code).toBe('ABC12345')
    expect(fromMock).toHaveBeenCalledTimes(3)
  })

  it('returns empty array and skips extra queries when mentor has no classes', async () => {
    queueFromResults(fromMock, [ok([])])
    const result = await getMentorClasses('men1')
    expect(result).toEqual([])
    expect(fromMock).toHaveBeenCalledTimes(1)
  })

  it('defaults enrolled_count to 0 when no enrollments exist for the class', async () => {
    queueFromResults(fromMock, [
      ok([CLASS_ROW]),
      ok([{ id: 'mod1', title: 'React 101' }]),
      ok([]),
    ])
    const [cls] = await getMentorClasses('men1')
    expect(cls.enrolled_count).toBe(0)
  })

  it('throws on query error', async () => {
    queueFromResults(fromMock, [fail(new Error('db down'))])
    await expect(getMentorClasses('men1')).rejects.toThrow('db down')
  })
})

describe('createClass', () => {
  it('calls create_class RPC and returns the new class', async () => {
    rpcMock.mockResolvedValueOnce({ data: CLASS_ROW, error: null })
    const result = await createClass('mod1', 'React Cohort A')
    expect(result).toEqual(CLASS_ROW)
    expect(rpcMock).toHaveBeenCalledWith('create_class', { p_module_id: 'mod1', p_name: 'React Cohort A' })
  })

  it('throws when the RPC returns an error', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: new Error('Only mentors can create classes') })
    await expect(createClass('mod1', 'Test')).rejects.toThrow('Only mentors can create classes')
  })
})

describe('resetClassCode', () => {
  it('calls reset_class_code RPC and returns the new code', async () => {
    rpcMock.mockResolvedValueOnce({ data: 'NEWCODE1', error: null })
    const code = await resetClassCode('cls1')
    expect(code).toBe('NEWCODE1')
    expect(rpcMock).toHaveBeenCalledWith('reset_class_code', { p_class_id: 'cls1' })
  })

  it('throws when the RPC returns an error', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: new Error('Class not found or permission denied') })
    await expect(resetClassCode('cls1')).rejects.toThrow('Class not found or permission denied')
  })
})

describe('deactivateClass', () => {
  it('updates is_active to false', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(deactivateClass('cls1')).resolves.toBeUndefined()
    expect(fromMock).toHaveBeenCalledWith('classes')
  })

  it('throws on update error', async () => {
    queueFromResults(fromMock, [fail(new Error('permission denied'))])
    await expect(deactivateClass('cls1')).rejects.toThrow('permission denied')
  })
})

describe('getClassRoster', () => {
  const ALICE = { id: 'stu1', full_name: 'Alice', role: 'student' }
  const BOB   = { id: 'stu2', full_name: 'Bob',   role: 'student' }

  it('returns roster entries with student profile and module progress', async () => {
    queueFromResults(fromMock, [
      ok([{ module_id: 'mod1' }]),
      ok([{ student_id: 'stu1' }, { student_id: 'stu2' }]),
      ok([ALICE, BOB]),
      ok([{ student_id: 'stu1', progress: 60, completed: false }]),
    ])
    const result = await getClassRoster('cls1')
    expect(result).toHaveLength(2)
    expect(result[0].student.full_name).toBe('Alice')
    expect(result[0].progress).toBe(60)
    expect(result[0].completed).toBe(false)
    expect(fromMock).toHaveBeenCalledTimes(4)
  })

  it('defaults progress to 0 and completed to false when no progress row exists', async () => {
    queueFromResults(fromMock, [
      ok([{ module_id: 'mod1' }]),
      ok([{ student_id: 'stu1' }]),
      ok([ALICE]),
      ok([]),
    ])
    const [entry] = await getClassRoster('cls1')
    expect(entry.progress).toBe(0)
    expect(entry.completed).toBe(false)
  })

  it('shows completed=true for a student who finished the module', async () => {
    queueFromResults(fromMock, [
      ok([{ module_id: 'mod1' }]),
      ok([{ student_id: 'stu1' }]),
      ok([ALICE]),
      ok([{ student_id: 'stu1', progress: 100, completed: true }]),
    ])
    const [entry] = await getClassRoster('cls1')
    expect(entry.progress).toBe(100)
    expect(entry.completed).toBe(true)
  })

  it('returns empty array and skips profile/progress queries when class has no enrollments', async () => {
    queueFromResults(fromMock, [
      ok([{ module_id: 'mod1' }]),
      ok([]),
    ])
    const result = await getClassRoster('cls1')
    expect(result).toEqual([])
    expect(fromMock).toHaveBeenCalledTimes(2)
  })

  it('throws when the class lookup errors', async () => {
    queueFromResults(fromMock, [fail(new Error('class not found'))])
    await expect(getClassRoster('cls1')).rejects.toThrow('class not found')
  })

  it('throws when the enrollments query errors', async () => {
    queueFromResults(fromMock, [
      ok([{ module_id: 'mod1' }]),
      fail(new Error('permission denied')),
    ])
    await expect(getClassRoster('cls1')).rejects.toThrow('permission denied')
  })
})

describe('redeemClassCode', () => {
  const RPC_SUCCESS = {
    class_id: 'cls1', class_name: 'React Cohort A',
    module_id: 'mod1', module_title: 'React 101', mentor_id: 'men1',
  }

  it('calls redeem_class_code RPC and returns structured result', async () => {
    rpcMock.mockResolvedValueOnce({ data: RPC_SUCCESS, error: null })
    const result = await redeemClassCode('ABC12345', 'stu1')
    expect(result.classId).toBe('cls1')
    expect(result.className).toBe('React Cohort A')
    expect(result.moduleId).toBe('mod1')
    expect(result.moduleTitle).toBe('React 101')
    expect(result.mentorId).toBe('men1')
    expect(rpcMock).toHaveBeenCalledWith('redeem_class_code', { p_code: 'ABC12345' })
  })

  it('throws when the code is invalid or inactive', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: new Error('Invalid or inactive class code') })
    await expect(redeemClassCode('BADCODE', 'stu1')).rejects.toThrow('Invalid or inactive class code')
  })

  it('still succeeds when student is already enrolled (DO NOTHING handled by SQL)', async () => {
    rpcMock.mockResolvedValueOnce({ data: RPC_SUCCESS, error: null })
    const result = await redeemClassCode('ABC12345', 'stu1')
    expect(result.classId).toBe('cls1')
  })

  it('still succeeds when student already has an accepted mentorship with that mentor', async () => {
    rpcMock.mockResolvedValueOnce({ data: RPC_SUCCESS, error: null })
    const result = await redeemClassCode('ABC12345', 'stu1')
    expect(result.mentorId).toBe('men1')
  })
})
