import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MENU_ICONS } from './menuIcons'
import { MENUS } from './menus'

describe('MENU_ICONS', () => {
  it('has one icon per menu', () => {
    for (const menu of MENUS) {
      expect(MENU_ICONS[menu.key]).toBeDefined()
    }
  })

  it('renders as a valid svg element', () => {
    const { container } = render(<>{MENU_ICONS.economy}</>)
    expect(container.querySelector('svg')).not.toBeNull()
  })
})
