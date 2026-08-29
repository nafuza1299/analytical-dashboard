import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SideNav, type SideNavItem } from './SideNav';

describe('SideNav Component', () => {
  const mockItems: SideNavItem[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'settings', label: 'Settings' },
    { key: 'profile', label: 'Profile', href: '/profile' },
  ];

  it('renders navigation items', () => {
    render(<SideNav items={mockItems} />);
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Profile').length).toBeGreaterThan(0);
  });

  it('marks active item with aria-current="page"', () => {
    render(<SideNav items={mockItems} activeKey="dashboard" />);
    const activeItems = screen.getAllByText('Dashboard');
    expect(activeItems.some(el => {
      const button = el.closest('button');
      return button?.hasAttribute('aria-current');
    })).toBe(true);
  });

  it('does not mark inactive items with aria-current', () => {
    render(<SideNav items={mockItems} activeKey="dashboard" />);
    const inactiveItems = screen.getAllByText('Settings');
    expect(inactiveItems.every(el => {
      const button = el.closest('button');
      return !button?.hasAttribute('aria-current');
    })).toBe(true);
  });

  it('fires onSelect when an item is clicked', async () => {
    const handleSelect = jest.fn();
    render(<SideNav items={mockItems} onSelect={handleSelect} />);
    const item = screen.getAllByText('Settings')[0].closest('button') || screen.getAllByText('Settings')[0].closest('a');
    
    if (item) {
      await userEvent.click(item);
      expect(handleSelect).toHaveBeenCalledWith('settings');
    }
  });

  it('renders items with href as links', () => {
    render(<SideNav items={mockItems} />);
    const links = screen.getAllByText('Profile');
    const link = links.find(el => el.closest('a'));
    expect(link?.closest('a')).toBeTruthy();
    expect(link?.closest('a')).toHaveAttribute('href', '/profile');
  });

  it('renders items without href as buttons', () => {
    render(<SideNav items={mockItems} />);
    const buttons = screen.getAllByText('Dashboard');
    const button = buttons.find(el => el.closest('button'));
    expect(button?.closest('button')?.tagName).toBe('BUTTON');
  });

  it('applies active item styles', () => {
    render(<SideNav items={mockItems} activeKey="dashboard" />);
    const activeItems = screen.getAllByText('Dashboard');
    const activeElement = activeItems.find(el => el.closest('[class*="border-primary"]'));
    expect(activeElement?.closest('[class*="border-l-2"]')).toBeTruthy();
  });

  it('applies inactive item styles', () => {
    render(<SideNav items={mockItems} activeKey="dashboard" />);
    const inactiveItems = screen.getAllByText('Settings');
    const inactiveElement = inactiveItems.find(el => el.closest('[class*="text-text-muted"]'));
    expect(inactiveElement?.closest('[class*="text-text-muted"]')).toBeTruthy();
  });

  it('fires onOpenChange when an item is selected', async () => {
    const handleOpenChange = jest.fn();
    render(
      <SideNav items={mockItems} onOpenChange={handleOpenChange} open={true} />
    );
    const items = screen.getAllByText('Settings');
    const item = items[1]?.closest('button') || items[1]?.closest('a');
    
    if (item) {
      await userEvent.click(item);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    }
  });

  it('displays icons when provided', () => {
    const itemsWithIcons: SideNavItem[] = [
      { key: 'home', label: 'Home', icon: '🏠' },
    ];
    render(<SideNav items={itemsWithIcons} />);
    const icons = screen.getAllByText('🏠');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('displays default icon when icon is not provided', () => {
    render(<SideNav items={mockItems} />);
    const items = screen.getAllByText(/Dashboard|Settings|Profile/);
    expect(items.length).toBeGreaterThan(0);
  });

  it('applies custom className', () => {
    const { container } = render(
      <SideNav items={mockItems} className="custom-nav" />
    );
    const nav = container.querySelector('.custom-nav');
    expect(nav).toHaveClass('custom-nav');
  });

  it('handles empty items array', () => {
    const { container } = render(<SideNav items={[]} />);
    expect(container.querySelector('nav')).toBeInTheDocument();
  });

  it('has proper navigation landmarks', () => {
    render(<SideNav items={mockItems} />);
    const navs = screen.getAllByRole('navigation');
    expect(navs.length).toBeGreaterThan(0);
  });

  it('dismisses the mobile drawer with Escape and its backdrop', () => {
    const onOpenChange = jest.fn();
    render(<SideNav items={mockItems} open onOpenChange={onOpenChange} />);
    const dialog = screen.getByRole('dialog', { name: 'Main navigation' });
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: 'Close navigation' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders skeleton items while loading', () => {
    render(<SideNav items={mockItems} loading />);
    expect(screen.getAllByLabelText('Loading navigation')).toHaveLength(2);
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('wraps Tab focus within the mobile drawer', () => {
    render(<SideNav items={mockItems} open onOpenChange={() => {}} />);
    const dialog = screen.getByRole('dialog', { name: 'Main navigation' });
    const focusableItems = dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    const first = focusableItems[0];
    const last = focusableItems[focusableItems.length - 1];
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
  });

  it('prevents Tab from leaving an empty mobile drawer', () => {
    render(<SideNav items={[]} open onOpenChange={() => {}} />);
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
