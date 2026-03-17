import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('../supabase', () => ({
  supabase: {
    auth: { getUser: mockGetUser },
    from: mockFrom,
  },
}))

function mockChain(data: unknown, error: unknown = null) {
  return {
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data, error }),
      }),
    }),
  }
}

describe('getGymId', () => {
  beforeEach(async () => {
    vi.resetAllMocks()
    // Clear the module-level cache by re-importing
    const mod = await import('../members-api')
    mod.clearGymIdCache()
  })

  it('throws "Not authenticated" when no user session', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { getGymId } = await import('../members-api')
    await expect(getGymId()).rejects.toThrow('Not authenticated')
  })

  it('throws "Account setup incomplete" when profile query returns null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockFrom.mockReturnValue(mockChain(null, { message: 'not found' }))
    const { getGymId } = await import('../members-api')
    await expect(getGymId()).rejects.toThrow('Account setup incomplete')
  })

  it('returns gymId and caches timezone from gym query', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockFrom
      .mockReturnValueOnce(mockChain({ gym_id: 'g1' }))
      .mockReturnValueOnce(mockChain({ timezone: 'America/Chicago' }))

    const { getGymId, getGymTimezone } = await import('../members-api')
    const gymId = await getGymId()
    expect(gymId).toBe('g1')
    expect(await getGymTimezone()).toBe('America/Chicago')
  })

  it('falls back to UTC when gym query fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockFrom
      .mockReturnValueOnce(mockChain({ gym_id: 'g1' }))
      .mockReturnValueOnce(mockChain(null, { message: 'no gym' }))

    const { getGymId, getGymTimezone } = await import('../members-api')
    await getGymId()
    expect(await getGymTimezone()).toBe('UTC')
  })

  it('returns cached gymId on second call without extra queries', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockFrom
      .mockReturnValueOnce(mockChain({ gym_id: 'g1' }))
      .mockReturnValueOnce(mockChain({ timezone: 'America/Chicago' }))

    const { getGymId } = await import('../members-api')
    await getGymId()
    const secondResult = await getGymId()
    expect(secondResult).toBe('g1')
    // auth.getUser called only once (first call), not on the cached second call
    expect(mockGetUser).toHaveBeenCalledTimes(1)
  })
})
