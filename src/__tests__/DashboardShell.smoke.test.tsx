import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { render } from '@testing-library/react';
import DashboardShell from '../components/DashboardShell';
import ChartCard from '../components/ChartCard';
import theme from '../theme/index';

declare const describe: any;
declare const it: any;
declare const expect: any;

describe('DashboardShell smoke', () => {
  it('renders shell and chart card', () => {
    const { getByText } = render(
      <ChakraProvider theme={theme}>
        <DashboardShell
          title="Smoke Test"
          navItems={[{ label: 'Dashboard', href: '#/dashboard' }]}
          user={{ name: 'Test User', email: 'test@example.com' }}
        >
          <ChartCard title="Chart" subtitle="Smoke" ariaLabel="Chart card">
            <div>Chart content</div>
          </ChartCard>
        </DashboardShell>
      </ChakraProvider>
    );

    expect(getByText('Smoke Test')).toBeTruthy();
    expect(getByText('Chart')).toBeTruthy();
    expect(getByText('Chart content')).toBeTruthy();
  });
});
