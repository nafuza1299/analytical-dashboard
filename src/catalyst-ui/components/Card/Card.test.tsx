import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card Component', () => {
  it('renders card with default div element', () => {
    const { container } = render(<Card>Card content</Card>);
    const card = container.querySelector('div[class*="rounded-lg"]');
    expect(card?.tagName).toBe('DIV');
  });

  it('renders card as article when as="article"', () => {
    const { container } = render(<Card as="article">Article content</Card>);
    const card = container.querySelector('article');
    expect(card).toBeInTheDocument();
  });

  it('applies base card styles', () => {
    const { container } = render(<Card>Base styles</Card>);
    const card = container.querySelector('div[class*="rounded-lg"]');
    expect(card).toHaveClass('rounded-lg');
    expect(card).toHaveClass('border');
    expect(card).toHaveClass('border-border');
    expect(card).toHaveClass('bg-surface');
    expect(card).toHaveClass('shadow-elevation');
  });

  it('applies default padding (md) when no sections are present', () => {
    const { container } = render(<Card padding="md">Simple content</Card>);
    const card = container.querySelector('div[class*="p-4"]');
    expect(card).toHaveClass('p-4');
    expect(card).toHaveClass('sm:p-6');
  });

  it('applies small padding when padding="sm"', () => {
    const { container } = render(<Card padding="sm">Small padded content</Card>);
    const card = container.querySelector('div[class*="p-3"]');
    expect(card).toHaveClass('p-3');
    expect(card).toHaveClass('sm:p-4');
  });

  it('applies no padding when padding="none"', () => {
    const { container } = render(<Card padding="none">No padding</Card>);
    const card = container.querySelector('div[class*="rounded-lg"]');
    expect(card).not.toHaveClass('p-3');
    expect(card).not.toHaveClass('p-4');
  });

  it('applies interactive styles when interactive is true', () => {
    const { container } = render(<Card interactive>Interactive card</Card>);
    const card = container.querySelector('div[class*="cursor-pointer"]');
    expect(card).toHaveClass('cursor-pointer');
    expect(card).toHaveClass('hover:border-primary');
    expect(card).toHaveClass('hover:bg-surface-hover');
  });

  it('does not apply interactive styles by default', () => {
    const { container } = render(<Card>Non-interactive card</Card>);
    const card = container.querySelector('div[class*="rounded-lg"]');
    expect(card).not.toHaveClass('cursor-pointer');
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-card-class">Custom</Card>);
    const card = container.querySelector('.custom-card-class');
    expect(card).toHaveClass('custom-card-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Card ref={ref}>Ref test</Card>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it('renders children content correctly', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('applies padding only when no structured sections are present', () => {
    const { container } = render(
      <Card padding="md">
        Simple text content
      </Card>
    );
    const card = container.querySelector('div[class*="p-4"]');
    expect(card).toHaveClass('p-4');
  });

  it('replaces content with an accessible skeleton while loading', () => {
    render(<Card loading>Loaded content</Card>);
    expect(screen.getByLabelText('Loading card')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Loaded content')).not.toBeInTheDocument();
  });

  it('renders every structured section without applying root padding', () => {
    const { container } = render(<Card padding="sm">
      <Card.Header><Card.Title>Title</Card.Title><Card.Description>Description</Card.Description></Card.Header>
      <Card.Body>Body</Card.Body><Card.Footer>Footer</Card.Footer>
    </Card>);
    expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
    expect(screen.getByText('Description').tagName).toBe('P');
    expect(screen.getByText('Body')).toHaveClass('px-4');
    expect(screen.getByText('Footer').tagName).toBe('FOOTER');
    expect(container.querySelector('div[class*="rounded-lg"]')).not.toHaveClass('p-3');
  });
});
