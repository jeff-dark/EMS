import React from 'react'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Button } from '@/components/ui/button'

// Basic a11y smoke test for button variants

describe('Button accessibility', () => {
  const variants = ['default','success','info','warning','critical','destructive','secondary','subtle','ghost','link','outline'] as const

  it('renders variants without accessibility violations (a11y)', async () => {
    const { container } = render(
      <div>
        {variants.map(v => (
          <Button key={v} variant={v as any}>Label {v}</Button>
        ))}
      </div>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
