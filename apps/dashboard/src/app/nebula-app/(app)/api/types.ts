type EngineConfig = {
  mode: "engine";
  engine_url: string;
  engine_authorization_token: string;
  engine_backend_wallet_address: string;
};

type SessionKeyConfig = {
  mode: "session_key";
  smart_account_address: string;
  smart_account_factory_address: string;
  smart_account_session_key: string;
};

type ClientConfig = {
  mode: "client";
  signer_wallet_address: string;
};

export type ExecuteConfig = EngineConfig | SessionKeyConfig | ClientConfig;

export type SessionInfo = {
  id: string;
  account_id: string;
  modal_name: string;
  archive_at: string | null;
  can_execute: boolean;
  execute_config: ExecuteConfig | null;
  created_at: string;
  deleted_at: string | null;
  history: Array<{
    role: "user" | "assistant"; // role: action is coming up
    content: string;
    timestamp: number;
  }> | null;
  updated_at: string;
  archived_at: string | null;
  title: string | null;
  is_public: boolean | null;
  // memory
  // action: array<object> | null; <-- type of this is not available on https://nebula-api.thirdweb-dev.com/docs#/default/get_session_session__session_id__get
};

export type TruncatedSessionInfo = {
  created_at: string;
  id: string;
  updated_at: string;
  title: string | null;
};