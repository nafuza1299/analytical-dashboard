import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuBar } from './MenuBar';

describe('MenuBar Component', () => {
  it('renders brand section', () => {
    render(
      <MenuBar>
        <MenuBar.Brand>Logo</MenuBar.Brand>
        <MenuBar.Nav />
        <MenuBar.Actions />
      </MenuBar>
    );

    const logos = screen.getAllByText('Logo');
    expect(logos.length).toBeGreaterThan(0);
  });

  it('renders with brand, nav, and actions', () => {
    render(
      <MenuBar>
        <MenuBar.Brand>Catalyst</MenuBar.Brand>
        <MenuBar.Nav>
          <MenuBar.Link href="#home">Home</MenuBar.Link>
        </MenuBar.Nav>
        <MenuBar.Actions>
          <button>Sign up</button>
        </MenuBar.Actions>
      </MenuBar>
    );

    const signUp = screen.getByRole('button', { name: /sign up/i });
    expect(signUp).toBeInTheDocument();
  });

  it('renders link with active state', () => {
    render(
      <MenuBar.Link href="#home" active>
        Home
      </MenuBar.Link>
    );

    const link = screen.getByRole('link', { name: /home/i });
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('renders dropdown menu', () => {
    render(
      <MenuBar.Dropdown
        label="Menu"
        items={[
          { key: 'item1', label: 'Item 1' },
          { key: 'item2', label: 'Item 2' },
        ]}
      />
    );

    const trigger = screen.getByRole('button', { name: /menu/i });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens dropdown menu on click', async () => {
    const user = userEvent.setup();
    render(
      <MenuBar.Dropdown
        label="Menu"
        items={[
          { key: 'item1', label: 'Item 1' },
          { key: 'item2', label: 'Item 2' },
        ]}
      />
    );

    const trigger = screen.getByRole('button', { name: /menu/i });
    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('selects dropdown items with pointer and keyboard controls', async () => {
    const user = userEvent.setup();
    const onFirstSelect = jest.fn();
    const onSecondSelect = jest.fn();
    render(<MenuBar.Dropdown label="Actions" items={[
      { key: 'first', label: 'First', onSelect: onFirstSelect },
      { key: 'second', label: 'Second', href: '/second', onSelect: onSecondSelect },
    ]} />);
    const trigger = screen.getByRole('button', { name: /actions/i });

    await user.click(trigger);
    const first = screen.getByRole('menuitem', { name: 'First' });
    fireEvent.mouseEnter(first);
    expect(first).toHaveAttribute('tabindex', '0');
    await user.click(within(first).getByRole('button', { name: 'First' }));
    expect(onFirstSelect).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onSecondSelect).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveFocus();
  });

  it('closes dropdowns on Escape and outside press', async () => {
    const user = userEvent.setup();
    render(<MenuBar.Dropdown label="Actions" items={[{ key: 'one', label: 'One' }]} />);
    const trigger = screen.getByRole('button', { name: /actions/i });
    await user.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('supports ArrowUp navigation, mouse-leave reset, and linked item selection', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(<MenuBar.Dropdown label="Actions" items={[
      { key: 'first', label: 'First' },
      { key: 'second', label: 'Second', href: '/second', onSelect },
    ]} />);
    const trigger = screen.getByRole('button', { name: /actions/i });
    await user.click(trigger);
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    const second = screen.getByRole('menuitem', { name: 'Second' });
    expect(second).toHaveAttribute('tabindex', '0');
    fireEvent.mouseLeave(second);
    expect(screen.getByRole('menuitem', { name: 'First' })).toHaveAttribute('tabindex', '0');
    await user.click(within(second).getByRole('link', { name: 'Second' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('renders controlled mobile sheet state', () => {
    render(
      <MenuBar mobileOpen={true} onMobileOpenChange={() => {}}>
        <MenuBar.Brand>Logo</MenuBar.Brand>
        <MenuBar.Nav />
        <MenuBar.Actions />
      </MenuBar>
    );

    // Component renders without error with controlled props
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });

  it('handles drawer dismissal, focus trapping, and loading state', () => {
    const onMobileOpenChange = jest.fn();
    render(<MenuBar mobileOpen onMobileOpenChange={onMobileOpenChange}>
      <button>First action</button><button>Last action</button>
    </MenuBar>);
    const dialog = screen.getByRole('dialog', { name: 'Main navigation' });
    expect(document.body.style.overflow).toBe('hidden');
    const buttons = within(dialog).getAllByRole('button');
    buttons[buttons.length - 1].focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(buttons[0]).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(buttons[buttons.length - 1]).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: 'Close navigation' }));
    expect(onMobileOpenChange).toHaveBeenCalledWith(false);
  });

  it('renders navigation skeletons while loading', () => {
    render(<MenuBar loading><span>Loaded</span></MenuBar>);
    expect(screen.getAllByLabelText('Loading navigation')).toHaveLength(2);
    expect(screen.queryByText('Loaded')).not.toBeInTheDocument();
  });

  it('prevents Tab from escaping an empty mobile drawer', () => {
    render(<MenuBar mobileOpen onMobileOpenChange={() => {}} />);
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('renders nav links as anchors when href is provided', () => {
    const { container } = render(
      <MenuBar.Link href="/about">About</MenuBar.Link>
    );

    const link = container.querySelector('a[href="/about"]');
    expect(link).toBeInTheDocument();
  });

  it('renders nav link as button when no href is provided', () => {
    render(
      <MenuBar.Link>Action</MenuBar.Link>
    );

    const button = screen.getByRole('button', { name: /action/i });
    expect(button).toBeInTheDocument();
  });

  it('renders brand component', () => {
    const { container } = render(
      <MenuBar.Brand>My Brand</MenuBar.Brand>
    );

    expect(container.textContent).toContain('My Brand');
  });

  it('renders nav component', () => {
    const { container } = render(
      <MenuBar.Nav>
        <MenuBar.Link href="#item">Item</MenuBar.Link>
      </MenuBar.Nav>
    );

    expect(container.querySelector('nav')).toBeInTheDocument();
  });

  it('renders actions component', () => {
    render(
      <MenuBar.Actions>
        <button>Action</button>
      </MenuBar.Actions>
    );

    const button = screen.getByRole('button', { name: /action/i });
    expect(button).toBeInTheDocument();
  });
});
