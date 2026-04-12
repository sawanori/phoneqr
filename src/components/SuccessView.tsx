'use client';
import { useMockStore } from '@/store/useMockStore';
import type { SuccessPattern } from '@/store/useMockStore';
import type { ComponentType } from 'react';
import { TaxPaymentSuccessView } from './success-views/TaxPaymentSuccessView';
import { AutoDebitSuccessView } from './success-views/AutoDebitSuccessView';

const SUCCESS_VIEW_MAP: Record<SuccessPattern, ComponentType> = {
  tax: TaxPaymentSuccessView,
  autoDebit: AutoDebitSuccessView,
};

export default function SuccessView() {
  const successPattern = useMockStore((s) => s.successPattern);
  const Component = SUCCESS_VIEW_MAP[successPattern] ?? TaxPaymentSuccessView;
  return <Component />;
}
