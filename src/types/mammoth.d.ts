declare module 'mammoth' {
  export interface MammothMessage {
    type: string;
    message: string;
  }

  export interface ExtractRawTextResult {
    value: string;
    messages: MammothMessage[];
  }

  export function extractRawText(input: { arrayBuffer: ArrayBuffer }): Promise<ExtractRawTextResult>;
}
