import React from 'react';
import { render, screen } from '@testing-library/react';
import MinimalOverlay from '@/components/scanner-patterns/MinimalOverlay';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
}));

describe('MinimalOverlay', () => {
  const themeColor = '#ff0033';

  // P2-01: themeColor背景のヘッダー帯が存在しない
  it('P2-01: themeColor背景のヘッダー帯が存在しない', () => {
    const { container } = render(<MinimalOverlay themeColor={themeColor} />);
    // themeColorを背景に持つヘッダー要素（solid background）がないことを確認
    const solidHeader = container.querySelector('[data-testid="header-band"]');
    expect(solidHeader).toBeNull();
  });

  // P2-02: ボトムナビが存在しない
  it('P2-02: ボトムナビが存在しない', () => {
    const { container } = render(<MinimalOverlay themeColor={themeColor} />);
    const bottomNav = container.querySelector('[data-testid="bottom-nav"]');
    expect(bottomNav).toBeNull();
  });

  // P2-03: スキャンライン要素が存在しない
  it('P2-03: スキャンライン要素が存在しない', () => {
    const { container } = render(<MinimalOverlay themeColor={themeColor} />);
    const scanLine = container.querySelector('[data-testid="scan-line"]');
    expect(scanLine).toBeNull();
  });

  // P2-04: 角丸の枠要素が存在する（borderRadiusが設定）
  it('P2-04: 角丸の枠要素が存在する（borderRadiusが設定）', () => {
    const { container } = render(<MinimalOverlay themeColor={themeColor} />);
    const roundedFrame = container.querySelector('[data-testid="scan-frame"]');
    expect(roundedFrame).not.toBeNull();
    // borderRadiusが設定されていることを確認
    const style = (roundedFrame as HTMLElement).style;
    expect(style.borderRadius).not.toBe('');
  });

  // P2-05: パルスアニメーション用のmotion.divが存在する
  it('P2-05: パルスアニメーション用のmotion.divが存在する', () => {
    const { container } = render(<MinimalOverlay themeColor={themeColor} />);
    const pulseDiv = container.querySelector('[data-testid="pulse-frame"]');
    expect(pulseDiv).not.toBeNull();
  });
});
