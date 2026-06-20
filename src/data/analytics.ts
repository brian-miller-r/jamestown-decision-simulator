type AnalyticsValue = string | number | boolean | null | string[] | number[] | boolean[];
type AnalyticsPayload = Record<string, AnalyticsValue>;

function hasPendoSdk(): boolean {
  return typeof pendo !== 'undefined';
}

function getOrCreateVisitorId(): string {
  const key = 'novus_visitor_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = 'anon-' + crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function initializeNovus(): void {
  if (!hasPendoSdk()) return;
  try {
    pendo.initialize({
      visitor: {
        id: getOrCreateVisitorId(),
      },
    });
  } catch (error) {
    console.warn('[Novus] initialize failed:', error);
  }
}

export function identifyNovusVisitor(visitor: AnalyticsPayload): void {
  if (!hasPendoSdk()) return;
  try {
    pendo.identify({ visitor });
  } catch (error) {
    console.warn('[Novus] identify failed:', error);
  }
}

export function updateNovusVisitor(visitor: AnalyticsPayload): void {
  if (!hasPendoSdk()) return;
  try {
    pendo.updateOptions({ visitor });
  } catch (error) {
    console.warn('[Novus] visitor update failed:', error);
  }
}

export function trackNovusEvent(eventName: string, metadata?: AnalyticsPayload): void {
  if (!hasPendoSdk()) return;
  try {
    pendo.track(eventName, metadata);
  } catch (error) {
    console.warn(`[Novus] track failed for ${eventName}:`, error);
  }
}
