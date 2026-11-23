import { useState } from 'react';
import { Badge, Button, Icon, Input } from '@/ui';
import s from './AuctionPage.module.css';

type Role = 'seller' | 'buyer';
type AuctionPhase = 'draft' | 'form' | 'review' | 'live' | 'ended';
type BidResult = 'idle' | 'pending' | 'accepted' | 'error';
type Outcome = 'sold' | 'unsold' | null;
type ResponseMode = 'success' | 'error';

type Terms = {
  startPrice: string;
  minStep: string;
  endsAt: string;
  reserve: string;
};

const apartment = {
  title: '2-комн. квартира, 58,4 м²',
  address: 'Москва, ул. Большая Черёмушкинская, 19',
  details: '8 этаж из 17 · монолитный дом · 8 мин. до метро',
};

const apartmentPhotos = [
  {
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    alt: 'Фасад современного жилого дома',
  },
  {
    src: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85',
    alt: 'Светлая гостиная в квартире',
  },
  {
    src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85',
    alt: 'Кухня с обеденной зоной',
  },
];

function nextWeekday(): string {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  date.setHours(19, 0, 0, 0);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

const initialTerms: Terms = {
  startPrice: '14500000',
  minStep: '100000',
  endsAt: nextWeekday(),
  reserve: '15000000',
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

function ApartmentCard({ compact = false }: { compact?: boolean }) {
  const [activePhoto, setActivePhoto] = useState(0);
  return (
    <article className={compact ? s.apartmentCompact : s.apartment}>
      <div className={s.photos}>
        <img src={apartmentPhotos[activePhoto].src} alt={apartmentPhotos[activePhoto].alt} />
        {!compact && (
          <div className={s.photoControls} aria-label="Фотографии квартиры">
            {apartmentPhotos.map((photo, index) => (
              <button
                type="button"
                key={photo.src}
                className={activePhoto === index ? s.activePhoto : undefined}
                aria-label={`Показать фото ${index + 1}`}
                aria-pressed={activePhoto === index}
                onClick={() => setActivePhoto(index)}
              />
            ))}
          </div>
        )}
      </div>
      <div className={s.apartmentBody}>
        <h2>{apartment.title}</h2>
        <p>{apartment.address}</p>
        {!compact && <span>{apartment.details}</span>}
      </div>
    </article>
  );
}

function Summary({ terms, currentBid, bids }: { terms: Terms; currentBid: number; bids: number }) {
  const reserveReached = currentBid >= Number(terms.reserve);
  return (
    <section className={s.summary} aria-label="Условия аукциона">
      <div className={s.currentBid}>
        <span>Текущая ставка</span>
        <strong>{formatPrice(currentBid)}</strong>
      </div>
      <div>
        <span>Минимальный шаг</span>
        <b>{formatPrice(Number(terms.minStep))}</b>
      </div>
      <div>
        <span>Завершится</span>
        <b>{formatDate(terms.endsAt)}</b>
      </div>
      <div>
        <span>Ставок</span>
        <b>{bids}</b>
      </div>
      <div className={s.reserveState}>
        <Badge tone={reserveReached ? 'positive' : 'warning'}>
          {reserveReached ? 'Резерв достигнут' : 'Резерв ещё не достигнут'}
        </Badge>
      </div>
    </section>
  );
}

export function AuctionPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [phase, setPhase] = useState<AuctionPhase>('draft');
  const [terms, setTerms] = useState<Terms>(initialTerms);
  const [errors, setErrors] = useState<Partial<Record<keyof Terms, string>>>({});
  const [currentBid, setCurrentBid] = useState(Number(initialTerms.startPrice));
  const [bidValue, setBidValue] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidResult, setBidResult] = useState<BidResult>('idle');
  const [responseMode, setResponseMode] = useState<ResponseMode>('success');
  const [bids, setBids] = useState(0);
  const [outcome, setOutcome] = useState<Outcome>(null);

  const numbers = {
    start: Number(terms.startPrice),
    step: Number(terms.minStep),
    reserve: Number(terms.reserve),
  };
  const minimumBid = currentBid + numbers.step;
  const setTerm = (key: keyof Terms, value: string) => {
    setTerms((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  };

  const validateTerms = () => {
    const nextErrors: Partial<Record<keyof Terms, string>> = {};
    if (!Number.isFinite(numbers.start) || numbers.start <= 0) {
      nextErrors.startPrice = 'Укажите стартовую цену числом больше нуля';
    }
    if (!Number.isFinite(numbers.step) || numbers.step <= 0) {
      nextErrors.minStep = 'Укажите положительный шаг ставки';
    }
    if (!Number.isFinite(numbers.reserve) || numbers.reserve < numbers.start) {
      nextErrors.reserve = 'Резерв не может быть ниже стартовой цены';
    }
    if (!terms.endsAt || new Date(terms.endsAt).getTime() <= Date.now()) {
      nextErrors.endsAt = 'Выберите дату и время в будущем';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const reviewAuction = () => {
    if (validateTerms()) setPhase('review');
  };

  const publishAuction = () => {
    setCurrentBid(numbers.start);
    setBids(0);
    setBidResult('idle');
    setOutcome(null);
    setPhase('live');
  };

  const submitBid = () => {
    const value = Number(bidValue);
    if (!Number.isFinite(value) || value < minimumBid) {
      setBidError(`Минимальная ставка — ${formatPrice(minimumBid)}`);
      return;
    }
    setBidError('');
    setBidResult('pending');
    window.setTimeout(() => {
      if (responseMode === 'error') {
        setBidResult('error');
        return;
      }
      setCurrentBid(value);
      setBids((count) => count + 1);
      setBidResult('accepted');
    }, 900);
  };

  const finishAuction = (nextOutcome: Exclude<Outcome, null>) => {
    if (nextOutcome === 'sold') {
      setCurrentBid(Math.max(currentBid, numbers.reserve));
      setBids((count) => Math.max(count, 1));
    }
    setBidResult('idle');
    setOutcome(nextOutcome);
    setPhase('ended');
  };

  const resetPrototype = () => {
    setTerms(initialTerms);
    setErrors({});
    setCurrentBid(Number(initialTerms.startPrice));
    setBidValue('');
    setBidError('');
    setBidResult('idle');
    setBids(0);
    setOutcome(null);
    setPhase('draft');
    setRole(null);
  };

  const chooseRole = (nextRole: Role) => {
    setRole(nextRole);
    if (nextRole === 'buyer') {
      setPhase('live');
      setCurrentBid(Number(initialTerms.startPrice));
      setBids(0);
      setOutcome(null);
      setBidResult('idle');
    }
  };

  const renderRoleChoice = () => (
    <section className={s.card}>
      <Badge tone="main">Продажа на аукционе</Badge>
      <h1>Как вы участвуете?</h1>
      <p className={s.lead}>
        Выберите роль, чтобы пройти один законченный сценарий. Сменить роль можно после его
        завершения.
      </p>
      <div className={s.roleCards}>
        <button type="button" className={s.sellerChoice} onClick={() => chooseRole('seller')}>
          <Icon name="PlaceholderAgency16" size={20} />
          <span>
            <strong>Я продаю квартиру</strong>
            <small>Задам условия и запущу торги за несколько минут</small>
          </span>
          <Icon name="ActionChevronRight16" size={20} />
        </button>
        <button type="button" className={s.buyerChoice} onClick={() => chooseRole('buyer')}>
          <Icon name="PlaceholderUser16" size={20} />
          <span>
            <strong>Я хочу купить</strong>
            <small>Посмотрю лот, условия и сделаю ставку</small>
          </span>
          <Icon name="ActionChevronRight16" size={20} />
        </button>
      </div>
    </section>
  );

  const renderDraft = () => {
    if (role === 'buyer') {
      return (
        <section className={s.card}>
          <Badge tone="neutral">Аукцион готовится</Badge>
          <h1>Квартира ещё не выставлена</h1>
          <p className={s.lead}>
            Продавец проверяет условия. Вернитесь позже, чтобы сделать ставку.
          </p>
        </section>
      );
    }
    return (
      <section className={s.card}>
        <Badge tone="main">Ваша квартира</Badge>
        <h1>Пусть квартира найдёт лучшую цену</h1>
        <p className={s.lead}>
          Вы сами задаёте условия, а покупатели делают ставки. Резервная цена останется только
          вашей.
        </p>
        <div className={s.sellerBenefits}>
          <span>
            <Icon name="FunctionalSuccess16" size={18} /> Условия под вашим контролем
          </span>
          <span>
            <Icon name="FunctionalCalendar24" size={18} /> Публикация займёт около 3 минут
          </span>
        </div>
        <Button fullWidth size="L" onClick={() => setPhase('form')}>
          Задать условия аукциона
        </Button>
      </section>
    );
  };

  const renderPreparingForBuyer = () => (
    <section className={s.card}>
      <Badge tone="neutral">Аукцион готовится</Badge>
      <h1>Продавец настраивает условия</h1>
      <p className={s.lead}>
        Когда аукцион будет опубликован, здесь появятся условия и возможность сделать ставку.
      </p>
    </section>
  );

  const renderForm = () => (
    <section className={s.card}>
      <p className={s.backLink}>
        <button type="button" onClick={() => setPhase('draft')}>
          ← К карточке квартиры
        </button>
      </p>
      <h1>Условия аукциона</h1>
      <p className={s.lead}>Укажите условия, которые увидят покупатели.</p>
      <div className={s.form}>
        <Input
          label="Стартовая цена, ₽"
          inputMode="numeric"
          value={terms.startPrice}
          onChange={(event) => setTerm('startPrice', event.target.value.replace(/\D/g, ''))}
          error={errors.startPrice}
        />
        <Input
          label="Минимальный шаг ставки, ₽"
          inputMode="numeric"
          value={terms.minStep}
          onChange={(event) => setTerm('minStep', event.target.value.replace(/\D/g, ''))}
          error={errors.minStep}
        />
        <Input
          label="Аукцион завершится"
          type="datetime-local"
          value={terms.endsAt}
          onChange={(event) => setTerm('endsAt', event.target.value)}
          error={errors.endsAt}
        />
        <Input
          label="Резервная цена, ₽"
          inputMode="numeric"
          value={terms.reserve}
          onChange={(event) => setTerm('reserve', event.target.value.replace(/\D/g, ''))}
          hint="Эту сумму увидите только вы"
          error={errors.reserve}
        />
      </div>
      <Button fullWidth size="L" onClick={reviewAuction}>
        Проверить условия
      </Button>
    </section>
  );

  const renderPublishReview = () => (
    <section className={s.card}>
      <p className={s.backLink}>
        <button type="button" onClick={() => setPhase('form')}>
          ← Изменить условия
        </button>
      </p>
      <Badge tone="main">Проверьте перед публикацией</Badge>
      <h1>Всё готово к аукциону</h1>
      <div className={s.reviewList}>
        <span>
          Стартовая цена <b>{formatPrice(numbers.start)}</b>
        </span>
        <span>
          Минимальный шаг <b>{formatPrice(numbers.step)}</b>
        </span>
        <span>
          Завершение <b>{formatDate(terms.endsAt)}</b>
        </span>
        <span>
          Резервная цена <b>{formatPrice(numbers.reserve)}</b>
        </span>
      </div>
      <p className={s.privateNote}>
        <Icon name="FunctionalInformationCircle16" size={18} /> Резервная цена не будет видна
        покупателям.
      </p>
      <Button fullWidth size="L" onClick={publishAuction}>
        Опубликовать аукцион
      </Button>
    </section>
  );

  const renderLiveSeller = () => (
    <section className={s.card}>
      <Badge tone="positive">Аукцион опубликован</Badge>
      <h1>Следите за ставками</h1>
      <Summary terms={terms} currentBid={currentBid} bids={bids} />
      <p className={s.privateNote}>
        <Icon name="FunctionalInformationCircle16" size={18} /> Ваша резервная цена —{' '}
        {formatPrice(numbers.reserve)}.
      </p>
    </section>
  );

  const renderLiveBuyer = () => (
    <section className={s.card}>
      <Badge tone="main">Аукцион открыт</Badge>
      <h1>Ваша ставка может стать лучшей</h1>
      <div className={s.buyerMomentum}>
        <Icon name="FunctionalCalendar24" size={22} />
        <span>
          <strong>Торги завершатся {formatDate(terms.endsAt)}</strong>
          <small>Успейте оставить ставку до окончания аукциона</small>
        </span>
      </div>
      <Summary terms={terms} currentBid={currentBid} bids={bids} />
      {bidResult === 'accepted' && (
        <div className={s.messageSuccess} role="status">
          <Icon name="FunctionalSuccess16" size={20} />
          <div>
            <strong>Ставка принята</strong>
            <p>Сейчас вы лидируете. Мы сообщим, если ставку перебьют.</p>
          </div>
        </div>
      )}
      {bidResult === 'error' && (
        <div className={s.messageError} role="alert">
          <strong>Не удалось отправить ставку</strong>
          <p>Проверьте соединение и попробуйте ещё раз.</p>
        </div>
      )}
      <div className={s.bidForm}>
        <Input
          label="Ваша ставка, ₽"
          inputMode="numeric"
          placeholder={String(minimumBid)}
          value={bidValue}
          onChange={(event) => {
            setBidValue(event.target.value.replace(/\D/g, ''));
            setBidError('');
          }}
          hint={`Не меньше ${formatPrice(minimumBid)}`}
          error={bidError}
          disabled={bidResult === 'pending'}
        />
        <Button fullWidth size="L" loading={bidResult === 'pending'} onClick={submitBid}>
          {bidResult === 'error' ? 'Повторить ставку' : 'Сделать ставку'}
        </Button>
      </div>
      {bidResult !== 'pending' && (
        <p className={s.bidHint}>
          Резервную цену продавец не раскрывает. После ставки вы сразу увидите, достигнут ли резерв.
        </p>
      )}
    </section>
  );

  const renderEnd = () => {
    const isSold = outcome === 'sold';
    const heading =
      role === 'buyer'
        ? isSold
          ? 'Вы выиграли аукцион'
          : 'Аукцион завершён'
        : isSold
          ? 'Квартира продана'
          : 'Лот не продан';
    const body =
      role === 'buyer'
        ? isSold
          ? 'Ваша ставка стала победной. Продавец свяжется с вами, чтобы обсудить следующие шаги.'
          : 'Резервная цена не была достигнута. Продавец может выставить квартиру снова.'
        : isSold
          ? 'Резервная цена достигнута. Покупатель с победной ставкой получит ваши контакты.'
          : 'Резервная цена не достигнута. Вы можете изменить условия и начать новый аукцион.';
    return (
      <section className={s.card}>
        <Badge tone={isSold ? 'positive' : 'warning'}>
          {isSold ? 'Аукцион завершён' : 'Без продажи'}
        </Badge>
        <h1>{heading}</h1>
        <p className={s.lead}>{body}</p>
        <Summary terms={terms} currentBid={currentBid} bids={bids} />
        <Button fullWidth theme="main_secondary" onClick={resetPrototype}>
          Начать заново
        </Button>
      </section>
    );
  };

  const content =
    role === null
      ? renderRoleChoice()
      : phase === 'draft'
        ? renderDraft()
        : phase === 'form'
          ? role === 'seller'
            ? renderForm()
            : renderPreparingForBuyer()
          : phase === 'review'
            ? role === 'seller'
              ? renderPublishReview()
              : renderPreparingForBuyer()
            : phase === 'live'
              ? role === 'seller'
                ? renderLiveSeller()
                : renderLiveBuyer()
              : renderEnd();

  return (
    <main className={s.page}>
      <div className={s.phone} aria-label="Мобильный макет iPhone">
        <div className={s.phoneScreen}>
          <div className={s.statusBar} aria-hidden="true">
            <time dateTime="2026-11-23T09:41">9:41</time>
            <span className={s.statusIcons}>
              <span className={s.signal}>
                <i />
                <i />
                <i />
                <i />
              </span>
              <span className={s.wifi} />
              <span className={s.battery}>
                <i />
              </span>
            </span>
          </div>
          <span className={s.dynamicIsland} aria-hidden="true" />
          <header className={s.header}>
            <a className={s.brand} href="/" aria-label="Циан — главная">
              <img src="/assets/cian-logo.svg" alt="Циан" />
            </a>
            <a className={s.kitLink} href="/ui-kit">
              UI kit
            </a>
          </header>
          <div className={s.mobileShell}>
            <div className={s.eyebrow}>Демонстрационный прототип</div>
            {role !== null && <ApartmentCard />}

            {content}

            {role !== null && (phase === 'live' || phase === 'ended') && (
              <aside className={s.demoPanel} aria-label="Демонстрация состояний">
                <span>Демонстрация состояний</span>
                {phase === 'live' && role === 'buyer' && (
                  <div className={s.demoButtons}>
                    <button
                      type="button"
                      className={responseMode === 'success' ? s.demoSelected : undefined}
                      onClick={() => setResponseMode('success')}
                    >
                      Успешная ставка
                    </button>
                    <button
                      type="button"
                      className={responseMode === 'error' ? s.demoSelected : undefined}
                      onClick={() => setResponseMode('error')}
                    >
                      Ошибка ответа
                    </button>
                  </div>
                )}
                {phase === 'live' && (
                  <div className={s.demoButtons}>
                    <button type="button" onClick={() => finishAuction('sold')}>
                      Завершить: продан
                    </button>
                    <button type="button" onClick={() => finishAuction('unsold')}>
                      Завершить: без продажи
                    </button>
                  </div>
                )}
                {phase === 'ended' && (
                  <button type="button" onClick={resetPrototype}>
                    Сбросить прототип
                  </button>
                )}
              </aside>
            )}
          </div>
          <span className={s.homeIndicator} aria-hidden="true" />
        </div>
      </div>
    </main>
  );
}
