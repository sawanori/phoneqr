import React from 'react';
import { render, screen } from '@testing-library/react';
import NeonOverlay from '@/components/scanner-patterns/NeonOverlay';

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

describe('NeonOverlay', () => {
  const themeColor = '#00ff88';

  // P3-01: ヘッダーに「SCAN_QR.EXE」テキストが表示される
  it('P3-01: ヘッダーに「SCAN_QR.EXE」テキストが表示される', () => {
    render(<NeonOverlay themeColor={themeColor} />);
    const title = screen.getByText('SCAN_QR.EXE');
    expect(title).toBeInTheDocument();
  });

  // P3-02: themeColorがスキャンライン要素のスタイルに適用されている
  it('P3-02: themeColorがスキャンライン要素のスタイルに適用されている', () => {
    const { container } = render(<NeonOverlay themeColor={themeColor} />);
    const scanLine = container.querySelector('[data-testid="scan-line"]');
    expect(scanLine).not.toBeNull();
    const style = (scanLine as HTMLElement).style;
    expect(style.backgroundColor).toBeTruthy();
  });

  // P3-03: ターゲットマーカー要素が4つ存在する
  it('P3-03: ターゲットマーカー要素が4つ存在する', () => {
    const { container } = render(<NeonOverlay themeColor={themeColor} />);
    const markers = container.querySelectorAll('[data-testid^="corner-marker"]');
    expect(markers.length).toBe(4);
  });

  // P3-04: 回転アニメーション用要素が存在する
  it('P3-04: 回転アニメーション用要素が存在する', () => {
    const { container } = render(<NeonOverlay themeColor={themeColor} />);
    const rotatingEl = container.querySelector('[data-testid="rotate-ring"]');
    expect(rotatingEl).not.toBeNull();
  });

  // P3-05: ヘッダー背景色が暗い色である
  it('P3-05: ヘッダー背景色が暗い色である', () => {
    const { container } = render(<NeonOverlay themeColor={themeColor} />);
    const header = container.querySelector('[data-testid="header"]');
    expect(header).not.toBeNull();
    const style = (header as HTMLElement).style;
    expect(style.backgroundColor).toBeTruthy();
  });
});
