export const METRIKA_COUNTER_ID = 0; // Заменить на номер счётчика при подключении Метрики.

export type AuctionRole = 'seller' | 'buyer' | 'guest';
export type AuctionStep =
  | 'role_choice'
  | 'seller_intro'
  | 'terms_form'
  | 'terms_review'
  | 'auction_live'
  | 'buyer_lot'
  | 'bid_form'
  | 'bid_pending'
  | 'bid_success'
  | 'bid_error'
  | 'auction_finished';

export type AuctionGoal =
  | 'auction_role_selected'
  | 'auction_terms_opened'
  | 'auction_terms_validation_error'
  | 'auction_terms_reviewed'
  | 'auction_published'
  | 'auction_bid_attempted'
  | 'auction_bid_validation_error'
  | 'auction_bid_response'
  | 'auction_finished'
  | 'auction_restarted';

type GoalParams = {
  role: AuctionRole;
  step: AuctionStep;
  [key: string]: string | number | boolean;
};

declare global {
  interface Window {
    ym?: (counterId: number, action: 'reachGoal', goal: AuctionGoal, params: GoalParams) => void;
  }
}

/**
 * Единая точка для целей аукциона. Пока в прототипе нет счётчика, вызов
 * выполняется только после подключения window.ym и не влияет на сценарий.
 */
export function trackAuctionGoal(goal: AuctionGoal, params: GoalParams) {
  window.ym?.(METRIKA_COUNTER_ID, 'reachGoal', goal, params);
}
