type PendoPayloadValue = string | number | boolean | null | string[] | number[] | boolean[];
type PendoPayload = Record<string, PendoPayloadValue>;

interface PendoSdk {
  initialize: (options: { visitor?: PendoPayload; account?: PendoPayload }) => void;
  identify: (options: { visitor?: PendoPayload; account?: PendoPayload }) => void;
  updateOptions: (options: { visitor?: PendoPayload; account?: PendoPayload }) => void;
  pageLoad: (options?: PendoPayload) => void;
  track: (eventName: string, metadata?: PendoPayload) => void;
  trackAgent: (eventName: string, metadata?: PendoPayload) => void;
}

declare const pendo: PendoSdk;
