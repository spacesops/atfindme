export type SipRecord = {
  type: string;
  key: string;
  value: string[];
};

export type RecordGroup = "pay" | "key" | "link" | "note";

export type HandleProfile = {
  handle: string;
  found: boolean;
  valid: boolean;
  sovereign: boolean;
  sovereignty?: string;
  records: SipRecord[];
  fallback_records: SipRecord[];
  num_id?: string;
  alias?: string;
  script_pubkey?: string;
  anchor?: number;
  payUri?: string;
  payLabel?: string;
  payQr?: string;
  isBolt12?: boolean;
  error?: string;
};
