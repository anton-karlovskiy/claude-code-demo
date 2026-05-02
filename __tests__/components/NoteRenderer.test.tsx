// @vitest-environment jsdom
/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NoteRenderer from '@/components/NoteRenderer';

const doc = (content: object[]) => JSON.stringify({ type: 'doc', content });

const text = (str: string, marks?: { type: string }[]) => ({
  type: 'text',
  text: str,
  ...(marks ? { marks } : {}),
});

describe('NoteRenderer', () => {
  it('shows an error message for invalid JSON', () => {
    const { container } = render(<NoteRenderer contentJson='not-json' />);
    expect(container.querySelector('p')?.textContent).toContain('Unable to render');
  });

  it('renders nothing when root type is not doc', () => {
    const { container } = render(
      <NoteRenderer contentJson={JSON.stringify({ type: 'paragraph' })} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a paragraph with text content', () => {
    render(<NoteRenderer contentJson={doc([{ type: 'paragraph', content: [text('Hello')] }])} />);
    expect(screen.getByText('Hello').tagName).toBe('P');
  });

  it('renders headings at all three levels', () => {
    render(
      <NoteRenderer
        contentJson={doc([
          { type: 'heading', attrs: { level: 1 }, content: [text('H1')] },
          { type: 'heading', attrs: { level: 2 }, content: [text('H2')] },
          { type: 'heading', attrs: { level: 3 }, content: [text('H3')] },
        ])}
      />,
    );
    expect(screen.getByText('H1').tagName).toBe('H1');
    expect(screen.getByText('H2').tagName).toBe('H2');
    expect(screen.getByText('H3').tagName).toBe('H3');
  });

  it('renders a bullet list with correct number of items', () => {
    const { container } = render(
      <NoteRenderer
        contentJson={doc([
          {
            type: 'bulletList',
            content: [
              { type: 'listItem', content: [{ type: 'paragraph', content: [text('A')] }] },
              { type: 'listItem', content: [{ type: 'paragraph', content: [text('B')] }] },
            ],
          },
        ])}
      />,
    );
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  it('renders a code block as pre > code', () => {
    const { container } = render(
      <NoteRenderer contentJson={doc([{ type: 'codeBlock', content: [text('const x = 1')] }])} />,
    );
    expect(container.querySelector('pre code')).not.toBeNull();
    expect(container.querySelector('pre')?.textContent).toContain('const x = 1');
  });

  it('renders a horizontal rule', () => {
    const { container } = render(<NoteRenderer contentJson={doc([{ type: 'horizontalRule' }])} />);
    expect(container.querySelector('hr')).not.toBeNull();
  });

  it('wraps bold text in <strong>', () => {
    const { container } = render(
      <NoteRenderer
        contentJson={doc([{ type: 'paragraph', content: [text('Bold', [{ type: 'bold' }])] }])}
      />,
    );
    expect(container.querySelector('strong')).not.toBeNull();
  });

  it('wraps italic text in <em>', () => {
    const { container } = render(
      <NoteRenderer
        contentJson={doc([{ type: 'paragraph', content: [text('Italic', [{ type: 'italic' }])] }])}
      />,
    );
    expect(container.querySelector('em')).not.toBeNull();
  });

  it('wraps inline code text in <code>', () => {
    const { container } = render(
      <NoteRenderer
        contentJson={doc([{ type: 'paragraph', content: [text('code', [{ type: 'code' }])] }])}
      />,
    );
    expect(container.querySelector('code')).not.toBeNull();
  });

  it('renders without crashing for unknown node types', () => {
    expect(() => {
      render(<NoteRenderer contentJson={doc([{ type: 'unknownType' }])} />);
    }).not.toThrow();
  });
});
