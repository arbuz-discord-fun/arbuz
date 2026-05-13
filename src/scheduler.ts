import { nowMsk, todayStr } from './utils.js';
import { processDayEnd } from './dayEnd.js';
import { TEST_RESET_EVERY_MINUTES } from './config.js';

/**
 * Возвращает миллисекунды до следующего 23:59:00 МСК.
 * 23:59 МСК = 20:59 UTC (UTC+3, без DST).
 */
function msUntilDayClose(): number {
  const now = Date.now();
  const msk = nowMsk(); // getUTC* методы дают МСК значения

  let target = new Date(
    Date.UTC(msk.getUTCFullYear(), msk.getUTCMonth(), msk.getUTCDate(), 20, 59, 0, 0),
  ).getTime();

  if (target <= now) target += 24 * 60 * 60 * 1000;
  return target - now;
}

function scheduleDayClose(): void {
  const ms   = msUntilDayClose();
  const mins = Math.round(ms / 60_000);
  console.log(`[scheduler] Следующее закрытие дня через ~${mins} мин`);

  setTimeout(async () => {
    const date = todayStr();
    console.log(`[scheduler] Закрываю день: ${date}`);
    try {
      await processDayEnd(date);
    } catch (err) {
      console.error('[scheduler] Ошибка processDayEnd:', err);
    }
    scheduleDayClose(); // планируем следующий день
  }, ms);
}

let lastTestMarker: string | null = null;

function startTestLoop(): void {
  console.log(`[scheduler] ТЕСТ: сброс каждые ${TEST_RESET_EVERY_MINUTES} мин`);

  setInterval(async () => {
    const msk = nowMsk();
    if (msk.getUTCMinutes() % TEST_RESET_EVERY_MINUTES! !== 0) return;

    const marker = `${msk.getUTCFullYear()}-${msk.getUTCMonth()}-${msk.getUTCDate()}-${msk.getUTCHours()}-${msk.getUTCMinutes()}`;
    if (lastTestMarker === marker) return;
    lastTestMarker = marker;

    const date = todayStr();
    console.log(`[scheduler] TEST RESET для ${date}`);
    try {
      await processDayEnd(date);
    } catch (err) {
      console.error('[scheduler] Ошибка processDayEnd:', err);
    }
  }, 30_000);
}

export function startScheduler(): void {
  if (TEST_RESET_EVERY_MINUTES) {
    startTestLoop();
  } else {
    scheduleDayClose();
  }
}
