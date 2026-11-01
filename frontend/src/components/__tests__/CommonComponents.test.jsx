import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusChip } from '../common/StatusChip.jsx';
import { PriorityChip } from '../common/PriorityChip.jsx';
import { ProjectProgress } from '../common/ProjectProgress.jsx';
import { StatCard } from '../common/StatCard.jsx';

describe('Common Components Unit Tests', () => {
  it('StatusChip renders status label correctly', () => {
    render(<StatusChip status="In Progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('PriorityChip renders High priority with flag icon', () => {
    render(<PriorityChip priority="High" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('ProjectProgress calculates and displays percentage and count', () => {
    render(
      <ProjectProgress percentage={75} completedTasks={3} totalTasks={4} overdueTasks={1} />
    );
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('3 of 4 tasks completed')).toBeInTheDocument();
    expect(screen.getByText('1 overdue')).toBeInTheDocument();
  });

  it('StatCard displays title, value, and subtitle', () => {
    render(
      <StatCard
        title="Active Projects"
        value={12}
        subtitle="Across departments"
        trend={{ label: '+2 this month', type: 'positive' }}
      />
    );
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Across departments')).toBeInTheDocument();
    expect(screen.getByText('+2 this month')).toBeInTheDocument();
  });
});
