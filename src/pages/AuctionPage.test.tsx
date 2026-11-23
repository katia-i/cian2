import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AuctionPage } from './AuctionPage';

describe('AuctionPage', () => {
  it('does not allow a reserve price below the starting price', async () => {
    const user = userEvent.setup();
    render(<AuctionPage />);

    await user.click(screen.getByRole('button', { name: /Я продаю квартиру/ }));
    await user.click(screen.getByRole('button', { name: 'Задать условия аукциона' }));
    const reserve = screen.getByLabelText('Резервная цена, ₽');
    await user.clear(reserve);
    await user.type(reserve, '14000000');
    await user.click(screen.getByRole('button', { name: 'Проверить условия' }));

    expect(screen.getByText('Резерв не может быть ниже стартовой цены')).toBeInTheDocument();
    expect(screen.queryByText('Всё готово к аукциону')).not.toBeInTheDocument();
  });

  it('runs a buyer bid lifecycle after choosing the buyer role', async () => {
    const user = userEvent.setup();
    render(<AuctionPage />);

    await user.click(screen.getByRole('button', { name: /Я хочу купить/ }));
    expect(
      screen.getByRole('heading', { name: 'Ваша ставка может стать лучшей' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Я продаю квартиру/ })).not.toBeInTheDocument();

    const bid = screen.getByLabelText('Ваша ставка, ₽');
    await user.type(bid, '14550000');
    await user.click(screen.getByRole('button', { name: 'Сделать ставку' }));
    expect(screen.getByText(/Минимальная ставка — 14\s*600\s*000\s*₽/)).toBeInTheDocument();

    await user.clear(bid);
    await user.type(bid, '14600000');
    await user.click(screen.getByRole('button', { name: 'Сделать ставку' }));
    expect(screen.getByRole('button', { name: /Сделать ставку/ })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    await waitFor(() => expect(screen.getByText('Ставка принята')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Завершить: продан' }));
    expect(screen.getByRole('heading', { name: 'Вы выиграли аукцион' })).toBeInTheDocument();
  });

  it('shows an unsold ending for the buyer', async () => {
    const user = userEvent.setup();
    render(<AuctionPage />);

    await user.click(screen.getByRole('button', { name: /Я хочу купить/ }));
    await user.click(screen.getByRole('button', { name: 'Завершить: без продажи' }));

    expect(screen.getByRole('heading', { name: 'Аукцион завершён' })).toBeInTheDocument();
    expect(screen.getByText(/Резервная цена не была достигнута/)).toBeInTheDocument();
  });

  it('lets a buyer retry after a simulated response error', async () => {
    const user = userEvent.setup();
    render(<AuctionPage />);

    await user.click(screen.getByRole('button', { name: /Я хочу купить/ }));
    await user.click(screen.getByRole('button', { name: 'Ошибка ответа' }));
    await user.type(screen.getByLabelText('Ваша ставка, ₽'), '14600000');
    await user.click(screen.getByRole('button', { name: 'Сделать ставку' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Не удалось отправить ставку'),
    );

    await user.click(screen.getByRole('button', { name: 'Успешная ставка' }));
    await user.click(screen.getByRole('button', { name: 'Повторить ставку' }));
    await waitFor(() => expect(screen.getByText('Ставка принята')).toBeInTheDocument());
  });
});
