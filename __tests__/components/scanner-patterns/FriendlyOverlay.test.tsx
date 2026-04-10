import React from 'react';
import { render, screen } from '@testing-library/react';
import FriendlyOverlay from '@/components/scanner-patterns/FriendlyOverlay';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
}));

jest.mock('lucide-react', () => ({
  Home: () => <svg data-testid="icon-home" />,
  QrCode: () => <svg data-testid="icon-qrcode" />,
  Clock: () => <svg data-testid="icon-clock" />,
}));

describe('FriendlyOverlay', () => {
  const themeColor = '#ff6b35';

  // P4-01: ヘッダーにグラデーション背景が適用されている
  it('P4-01: ヘッダーにグラデーション背景が適用されている', () => {
    const { container } = render(<FriendlyOverlay themeColor={themeColor} />);
    const header = container.querySelector('[data-testid="header"]');
    expect(header).not.toBeNull();
    const style = (header as HTMLElement).style;
    expect(style.background).toContain('linear-gradient');
  });

  // P4-02: スキャン枠の角丸が大きい（borderRadius 24px）
  it('P4-02: スキャン枠の角丸が大きい（borderRadius 24px）', () => {
    const { container } = render(<FriendlyOverlay themeColor={themeColor} />);
    const outerFrame = container.querySelector('[data-testid="scan-frame-outer"]');
    expect(outerFrame).not.toBeNull();
    const style = (outerFrame as HTMLElement).style;
    expect(style.borderRadius).toBe('24px');
  });

  // P4-03: グラデーションウェーブ要素が存在する
  it('P4-03: グラデーションウェーブ要素が存在する', () => {
    const { container } = render(<FriendlyOverlay themeColor={themeColor} />);
    const wave = container.querySelector('[data-testid="gradient-wave"]');
    expect(wave).not.toBeNull();
  });

  // P4-04: ボトムナビのアクティブアイコンに丸型背景がある
  it('P4-04: ボトムナビのアクティブアイコンに丸型背景がある', () => {
    const { container } = render(<FriendlyOverlay themeColor={themeColor} />);
    const activeIconBg = container.querySelector('[data-testid="active-icon-bg"]');
    expect(activeIconBg).not.toBeNull();
    const style = (activeIconBg as HTMLElement).style;
    // 丸型背景（borderRadiusが50%または9999px）
    expect(style.borderRadius).toBeTruthy();
  });

  // P4-05: 「コード支払い」テキストが存在する
  it('P4-05: 「コード支払い」テキストが存在する', () => {
    render(<FriendlyOverlay themeColor={themeColor} />);
    const title = screen.getByText('コード支払い');
    expect(title).toBeInTheDocument();
  });
});
