import * as React from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  siblingCount?: number;
}

const ELLIPSIS = '…';

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

function buildPages(
  page: number,
  pageCount: number,
  siblingCount: number,
): Array<number | typeof ELLIPSIS> {
  // boundary pages (1, last) + current +/- siblings + 2 ellipsis slots
  const totalSlots = siblingCount * 2 + 5;
  if (pageCount <= totalSlots) {
    return range(1, pageCount);
  }

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, pageCount);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < pageCount - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + 2 * siblingCount;
    return [...range(1, leftCount), ELLIPSIS, pageCount];
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + 2 * siblingCount;
    return [1, ELLIPSIS, ...range(pageCount - rightCount + 1, pageCount)];
  }
  return [1, ELLIPSIS, ...range(leftSibling, rightSibling), ELLIPSIS, pageCount];
}

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${(p) => p.theme.space[1]};
  font-family: ${(p) => p.theme.font.body};
`;

const PageButton = styled.button<{ $active?: boolean }>`
  min-width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  color: ${(p) => (p.$active ? p.theme.colors.primaryInk : p.theme.colors.text)};
  background: ${(p) => (p.$active ? p.theme.colors.primary : p.theme.colors.surface)};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radii.md};
  box-shadow: ${(p) => (p.$active ? p.theme.shadow.none : p.theme.shadow.stampSm)};
  padding: 0 ${(p) => p.theme.space[2]};
  cursor: pointer;
  transition: transform 80ms ${(p) => p.theme.easing.out},
    box-shadow 80ms ${(p) => p.theme.easing.out};

  &:hover:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: ${(p) => p.theme.shadow.none};
  }
  &:active:not(:disabled) {
    transform: translate(4px, 4px);
    box-shadow: ${(p) => p.theme.shadow.none};
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }
`;

const Ellipsis = styled.span`
  min-width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: ${(p) => p.theme.colors.textSubtle};
`;

export function Pagination({ page, pageCount, onChange, siblingCount = 1 }: PaginationProps) {
  const pages = buildPages(page, pageCount, siblingCount);

  return (
    <Nav aria-label="Pagination">
      <PageButton
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft size={18} />
      </PageButton>
      {pages.map((p, i) =>
        p === ELLIPSIS ? (
          <Ellipsis key={`e-${i}`} aria-hidden="true">
            {ELLIPSIS}
          </Ellipsis>
        ) : (
          <PageButton
            key={p}
            type="button"
            $active={p === page}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </PageButton>
        ),
      )}
      <PageButton
        type="button"
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight size={18} />
      </PageButton>
    </Nav>
  );
}
