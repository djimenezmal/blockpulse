import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecentTransactions from './RecentTransactions';
import { FeeClassification } from '../model/enums';
import { Transaction } from '../model/models';

const createTransaction = (overrides: Partial<Transaction>): Transaction => ({
    id: 'a'.repeat(64),
    feePerVByte: 0,
    totalFee: 0,
    size: 0,
    timestamp: 0,
    patternTypes: new Set(),
    feeClassification: FeeClassification.NORMAL,
    isOutlier: false,
    windowSnapshot: { avgFeePerVByte: 0, medianFeePerVByte: 0, transactionsCount: 0, outliersCount: 0 },
    ...overrides,
});

describe('RecentTransactions', () => {
    it('renders placeholder when no transactions are provided', () => {
        render(<RecentTransactions transactions={[]} />);
        expect(screen.getByText('No transactions yet...')).toBeInTheDocument();
    });

    it('renders transaction list with correct details', () => {
        const timestamp1 = new Date('2024-01-01T10:00:00Z').getTime();
        const timestamp2 = new Date('2024-01-01T11:00:00Z').getTime();
        const timestamp3 = new Date('2024-01-01T12:00:00Z').getTime();

        const transactions: Transaction[] = [
            createTransaction({
                id: '1'.repeat(64),
                size: 123,
                feePerVByte: 10.123,
                timestamp: timestamp1,
                feeClassification: FeeClassification.CHEAP,
            }),
            createTransaction({
                id: '2'.repeat(64),
                size: 456,
                feePerVByte: 20.5,
                timestamp: timestamp2,
                feeClassification: FeeClassification.NORMAL,
            }),
            createTransaction({
                id: '3'.repeat(64),
                size: 789,
                feePerVByte: 30,
                timestamp: timestamp3,
                feeClassification: FeeClassification.EXPENSIVE,
            }),
        ];

        const { container } = render(<RecentTransactions transactions={transactions} />);

        expect(container.querySelectorAll('.transaction-item')).toHaveLength(3);
        const firstId = '1'.repeat(64);
        const expectedId = `${firstId.substring(0, 30)}...`;
        expect(screen.getByText(expectedId)).toBeInTheDocument();
        expect(screen.getByText('123 bytes')).toBeInTheDocument();
        expect(screen.getByText('10.12 sat/byte')).toHaveClass('transaction-item__fee', 'transaction-item__fee--low');
        const expectedTime1 = new Date(timestamp1).toLocaleTimeString();
        expect(screen.getByText(expectedTime1)).toBeInTheDocument();

        expect(screen.getByText('20.50 sat/byte')).toHaveClass('transaction-item__fee', 'transaction-item__fee--medium');
        const expectedTime2 = new Date(timestamp2).toLocaleTimeString();
        expect(screen.getByText(expectedTime2)).toBeInTheDocument();

        expect(screen.getByText('30.00 sat/byte')).toHaveClass('transaction-item__fee', 'transaction-item__fee--high');
        const expectedTime3 = new Date(timestamp3).toLocaleTimeString();
        expect(screen.getByText(expectedTime3)).toBeInTheDocument();

        expect(screen.queryByText('No transactions yet...')).toBeNull();
    });
});

