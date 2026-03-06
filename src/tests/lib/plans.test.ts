import { describe, it, expect } from 'vitest'
import { PLANS } from '@/lib/stripe/plans'
import { PLAN_LIMITS } from '@/lib/utils/constants'

describe('Plan configurations', () => {
  it('has all four plans defined', () => {
    expect(Object.keys(PLANS)).toEqual(['free', 'creator', 'pro', 'agency'])
  })

  it('free plan uses gemini', () => {
    expect(PLANS.free.llmProvider).toBe('gemini')
  })

  it('paid plans use claude', () => {
    expect(PLANS.creator.llmProvider).toBe('claude')
    expect(PLANS.pro.llmProvider).toBe('claude')
    expect(PLANS.agency.llmProvider).toBe('claude')
  })

  it('plan prices are in ascending order', () => {
    expect(PLANS.free.price).toBeLessThan(PLANS.creator.price)
    expect(PLANS.creator.price).toBeLessThan(PLANS.pro.price)
    expect(PLANS.pro.price).toBeLessThan(PLANS.agency.price)
  })

  it('asset limits increase with plan tier', () => {
    expect(PLANS.free.assetsPerMonth).toBeLessThan(PLANS.creator.assetsPerMonth)
    expect(PLANS.creator.assetsPerMonth).toBeLessThan(PLANS.pro.assetsPerMonth)
    expect(PLANS.pro.assetsPerMonth).toBeLessThan(PLANS.agency.assetsPerMonth)
  })
})

describe('PLAN_LIMITS constant', () => {
  it('matches PLANS asset limits', () => {
    expect(PLAN_LIMITS.free.assetsPerMonth).toBe(PLANS.free.assetsPerMonth)
    expect(PLAN_LIMITS.creator.assetsPerMonth).toBe(PLANS.creator.assetsPerMonth)
    expect(PLAN_LIMITS.pro.assetsPerMonth).toBe(PLANS.pro.assetsPerMonth)
    expect(PLAN_LIMITS.agency.assetsPerMonth).toBe(PLANS.agency.assetsPerMonth)
  })
})
