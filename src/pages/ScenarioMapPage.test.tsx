import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ScenarioMapPage } from './ScenarioMapPage';

describe('ScenarioMapPage', () => {
  it('shows both role flows, event labels and measurement metrics', () => {
    render(
      <MemoryRouter>
        <ScenarioMapPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Продавец' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Покупатель' })).toBeInTheDocument();
    expect(screen.getAllByText('auction_published').length).toBeGreaterThan(1);
    expect(screen.getByRole('heading', { name: 'Метрики после запуска' })).toBeInTheDocument();
    expect(screen.getByText('Продажа после публикации')).toBeInTheDocument();
  });
});
