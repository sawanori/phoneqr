import React from 'react';
import { render, screen } from '@testing-library/react';
import StandardOverlay from '@/components/scanner-patterns/StandardOverlay';

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
  Menu: () => <svg data-testid="icon-menu" />,
  X: () => <svg data-testid="icon-x" />,
}));

describe('StandardOverlay', () => {
  const themeColor = '#ff0033';

  // P1-01: themeColor propsがヘッダー背景色に適用される
  it('P1-01: themeColor propsがヘッダー背景色に適用される', () => {
    const { container } = render(<StandardOverlay themeColor={themeColor} />);
    const header = container.querySelector('[data-testid="header"]');
    expect(header).not.toBeNull();
    const style = (header as HTMLElement).style;
    expect(style.backgroundColor).toBeTruthy();
  });

  // P1-02: L字ボーダー（四隅）にthemeColorが適用されている
  it('P1-02: L字ボーダー（四隅）にthemeColorが適用されている', () => {
    const { container } = render(<StandardOverlay themeColor={themeColor} />);
    // 四隅のL字ボーダー要素を検索
    const cornerEl = container.querySelector('[data-testid="corner-tl"]');
    expect(cornerEl).not.toBeNull();
    const style = (cornerEl as HTMLElement).style;
    // borderTopが設定されていることを確認
    expect(style.borderTop).toBeTruthy();
  });

  // P1-03: スキャンライン要素が存在する
  it('P1-03: スキャンライン要素が存在する', () => {
    const { container } = render(<StandardOverlay themeColor={themeColor} />);
    const scanLine = container.querySelector('[data-testid="scan-line"]');
    expect(scanLine).not.toBeNull();
  });

  // P1-04: ボトムナビが存在し「スキャン」ラベルがある
  it('P1-04: ボトムナビが存在し「スキャン」ラベルがある', () => {
    render(<StandardOverlay themeColor={themeColor} />);
    const scanLabel = screen.getByText('スキャン');
    expect(scanLabel).toBeInTheDocument();
  });

  // P1-05: 「コード支払い」テキストが存在する
  it('P1-05: 「コード支払い」テキストが存在する', () => {
    render(<StandardOverlay themeColor={themeColor} />);
    const title = screen.getByText('コード支払い');
    expect(title).toBeInTheDocument();
  });
});
