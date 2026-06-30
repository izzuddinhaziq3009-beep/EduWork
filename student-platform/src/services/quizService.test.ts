import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { ok, queueFromResults } from '@/test/supabaseMock'

vi.mock('./supabase', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from './supabase'
import { getQuizForItem, getQuizDetail, startQuizAttempt, completeQuizAttempt } from './quizService'

const fromMock = supabase.from as Mock

beforeEach(() => {
  fromMock.mockReset()
})

describe('getQuizForItem', () => {
  it('returns null when no quiz is configured for the item', async () => {
    queueFromResults(fromMock, [ok(null)])
    expect(await getQuizForItem('item1')).toBeNull()
  })

  it('returns the quiz config', async () => {
    queueFromResults(fromMock, [ok({ id: 'quiz1', item_id: 'item1' })])
    expect(await getQuizForItem('item1')).toEqual({ id: 'quiz1', item_id: 'item1' })
  })
})

describe('getQuizDetail', () => {
  it('returns null when there is no quiz config', async () => {
    queueFromResults(fromMock, [ok(null)])
    expect(await getQuizDetail('item1')).toBeNull()
    expect(fromMock).toHaveBeenCalledTimes(1)
  })

  it('attaches questions with their options and answers', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'quiz1', item_id: 'item1' }), // getQuizForItem
      ok({ id: 'quiz1', shuffle_questions: false, passing_score: 70 }), // fetchQuizDetailByConfigId quiz row
      ok([{ id: 'q1', quiz_id: 'quiz1', type: 'multiple_choice', order_index: 0 }]), // questions
      ok([{ id: 'o1', question_id: 'q1', option_text: 'A', is_correct: true, order_index: 0 }]), // options
      ok([]), // answers
    ])
    const result = await getQuizDetail('item1')
    expect(result?.questions).toHaveLength(1)
    expect(result?.questions[0].options).toEqual([{ id: 'o1', question_id: 'q1', option_text: 'A', is_correct: true, order_index: 0 }])
  })

  it('returns no questions when the quiz has none configured yet', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'quiz1', item_id: 'item1' }),
      ok({ id: 'quiz1', shuffle_questions: false, passing_score: 70 }),
      ok([]),
    ])
    const result = await getQuizDetail('item1')
    expect(result?.questions).toEqual([])
  })
})

describe('startQuizAttempt', () => {
  it('throws when the quiz is not configured', async () => {
    queueFromResults(fromMock, [ok(null)])
    await expect(startQuizAttempt('stu1', 'item1')).rejects.toThrow('This quiz is not configured yet.')
  })

  it('throws when attempts are exhausted', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'quiz1', attempts_allowed: 1 }), // getQuizForItem
      ok({ id: 'quiz1', attempts_allowed: 1 }), // getQuizForItem (inside getStudentQuizAttempts)
      ok([{ id: 'attempt1', attempt_number: 1 }]), // previous attempts
    ])
    await expect(startQuizAttempt('stu1', 'item1')).rejects.toThrow('No attempts remaining for this quiz.')
  })

  it('allows unlimited attempts when attempts_allowed is -1', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'quiz1', attempts_allowed: -1 }),
      ok({ id: 'quiz1', attempts_allowed: -1 }),
      ok([{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }]),
      ok({ id: 'attempt4', attempt_number: 4 }), // insert
    ])
    const result = await startQuizAttempt('stu1', 'item1')
    expect(result.attempt_number).toBe(4)
  })

  it('creates the first attempt when none exist yet', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'quiz1', attempts_allowed: 3 }),
      ok({ id: 'quiz1', attempts_allowed: 3 }),
      ok([]),
      ok({ id: 'attempt1', attempt_number: 1 }),
    ])
    const result = await startQuizAttempt('stu1', 'item1')
    expect(result.attempt_number).toBe(1)
  })
})

describe('completeQuizAttempt — grading', () => {
  it('grades multiple-choice questions by matching the selected option id', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'attempt1', quiz_id: 'quiz1' }), // attempt lookup
      ok({ id: 'quiz1', shuffle_questions: false, passing_score: 50 }), // quiz row
      ok([{ id: 'q1', quiz_id: 'quiz1', type: 'multiple_choice', points: 10, order_index: 0 }]), // questions
      ok([
        { id: 'correct-opt', question_id: 'q1', option_text: 'Right', is_correct: true, order_index: 0 },
        { id: 'wrong-opt', question_id: 'q1', option_text: 'Wrong', is_correct: false, order_index: 1 },
      ]), // options
      ok([]), // answers (none for MC)
      ok(null), // insert answer rows
      ok(null), // update attempt
    ])
    const result = await completeQuizAttempt('attempt1', { q1: 'correct-opt' }, 60)
    expect(result.earnedPoints).toBe(10)
    expect(result.totalPoints).toBe(10)
    expect(result.questionResults[0].isCorrect).toBe(true)
  })

  it('marks a wrong multiple-choice answer as incorrect with zero points', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'attempt1', quiz_id: 'quiz1' }),
      ok({ id: 'quiz1', shuffle_questions: false, passing_score: 50 }),
      ok([{ id: 'q1', quiz_id: 'quiz1', type: 'multiple_choice', points: 10, order_index: 0 }]),
      ok([
        { id: 'correct-opt', question_id: 'q1', option_text: 'Right', is_correct: true, order_index: 0 },
        { id: 'wrong-opt', question_id: 'q1', option_text: 'Wrong', is_correct: false, order_index: 1 },
      ]),
      ok([]),
      ok(null),
      ok(null),
    ])
    const result = await completeQuizAttempt('attempt1', { q1: 'wrong-opt' }, 60)
    expect(result.earnedPoints).toBe(0)
    expect(result.questionResults[0].isCorrect).toBe(false)
  })

  it('grades short-answer questions case-insensitively and trims whitespace', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'attempt1', quiz_id: 'quiz1' }),
      ok({ id: 'quiz1', shuffle_questions: false, passing_score: 50 }),
      ok([{ id: 'q1', quiz_id: 'quiz1', type: 'short_answer', points: 5, order_index: 0 }]),
      ok([]),
      ok([{ id: 'a1', question_id: 'q1', answer_text: 'Paris' }]),
      ok(null),
      ok(null),
    ])
    const result = await completeQuizAttempt('attempt1', { q1: '  paris  ' }, 30)
    expect(result.questionResults[0].isCorrect).toBe(true)
    expect(result.earnedPoints).toBe(5)
  })

  it('treats an empty short-answer response as incorrect', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'attempt1', quiz_id: 'quiz1' }),
      ok({ id: 'quiz1', shuffle_questions: false, passing_score: 50 }),
      ok([{ id: 'q1', quiz_id: 'quiz1', type: 'short_answer', points: 5, order_index: 0 }]),
      ok([]),
      ok([{ id: 'a1', question_id: 'q1', answer_text: 'Paris' }]),
      ok(null),
      ok(null),
    ])
    const result = await completeQuizAttempt('attempt1', { q1: '' }, 30)
    expect(result.questionResults[0].isCorrect).toBe(false)
  })

  it('computes score as a rounded percentage and determines pass/fail against passing_score', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'attempt1', quiz_id: 'quiz1' }),
      ok({ id: 'quiz1', shuffle_questions: false, passing_score: 70 }),
      ok([
        { id: 'q1', quiz_id: 'quiz1', type: 'multiple_choice', points: 10, order_index: 0 },
        { id: 'q2', quiz_id: 'quiz1', type: 'multiple_choice', points: 10, order_index: 1 },
        { id: 'q3', quiz_id: 'quiz1', type: 'multiple_choice', points: 10, order_index: 2 },
      ]),
      ok([
        { id: 'q1-correct', question_id: 'q1', option_text: 'A', is_correct: true, order_index: 0 },
        { id: 'q2-correct', question_id: 'q2', option_text: 'A', is_correct: true, order_index: 0 },
        { id: 'q3-correct', question_id: 'q3', option_text: 'A', is_correct: true, order_index: 0 },
      ]),
      ok([]),
      ok(null),
      ok(null),
    ])
    // 2 of 3 correct = 67% — below the 70% passing score
    const result = await completeQuizAttempt('attempt1', { q1: 'q1-correct', q2: 'q2-correct', q3: 'wrong' }, 90)
    expect(result.earnedPoints).toBe(20)
    expect(result.totalPoints).toBe(30)
    expect(result.attempt.score).toBe(67)
    expect(result.attempt.passed).toBe(false)
  })

  it('treats an unanswered question as incorrect rather than throwing', async () => {
    queueFromResults(fromMock, [
      ok({ id: 'attempt1', quiz_id: 'quiz1' }),
      ok({ id: 'quiz1', shuffle_questions: false, passing_score: 50 }),
      ok([{ id: 'q1', quiz_id: 'quiz1', type: 'multiple_choice', points: 10, order_index: 0 }]),
      ok([{ id: 'opt1', question_id: 'q1', option_text: 'A', is_correct: true, order_index: 0 }]),
      ok([]),
      ok(null),
      ok(null),
    ])
    const result = await completeQuizAttempt('attempt1', {}, 10)
    expect(result.questionResults[0].isCorrect).toBe(false)
    expect(result.questionResults[0].studentAnswer).toBeNull()
  })
})
