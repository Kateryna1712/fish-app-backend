export interface CallbackLiqpayDto {
  payment_id: number;
  action: 'pay' | 'hold' | 'paysplit' | 'subscribe' | 'regular';
  status: PaymentStatusLiqpay | string;
  version: number;
  type: string;
  paytype: string;
  public_key: string;
  acq_id: number;
  order_id: string;
  liqpay_order_id: string;
  description: string;
  sender_first_name: string;
  sender_last_name: string;
  sender_card_mask2: string;
  sender_card_bank: string;
  sender_card_type: 'visa' | 'mastercard' | string;
  sender_card_country: number;
  ip: string;
  info: string;
  amount: number;
  currency: string;
  sender_commission: number;
  receiver_commission: number;
  agent_commission: number;
  amount_debit: number;
  amount_credit: number;
  commission_debit: number;
  commission_credit: number;
  currency_debit: string;
  currency_credit: string;
  sender_bonus: number;
  amount_bonus: number;
  mpi_eci: string;
  is_3ds: boolean;
  language: string;
  create_date: number;
  end_date: number;
  transaction_id: number;

  // optional fields
  card_token?: string;
  authcode_credit?: string;
  authcode_debit?: string;
  completion_date?: string;
  customer?: string;
  redirect_to?: string;
  refund_date_last?: string;
  rrn_credit?: string;
  rrn_debit?: string;
  sender_phone?: string;
  err_code?: string;
  err_erc?: string;
  err_description?: string;
  token?: string;
  wait_reserve_status?: string;
  verifycode?: string;

  // product inf (optional)
  product_category?: string;
  product_description?: string;
  product_name?: string;
  product_url?: string;

  // refund
  refund_amount?: number;
}

export enum PaymentStatusLiqpay {
  // ✅ Final statuses
  ERROR = 'error',
  FAILURE = 'failure',
  REVERSED = 'reversed',
  SUBSCRIBED = 'subscribed',
  SUCCESS = 'success',
  UNSUBSCRIBED = 'unsubscribed',

  // 🔐 Statuses that require confirmation
  VERIFY_3DS = '3ds_verify',
  CAPTCHA_VERIFY = 'captcha_verify',
  CVV_VERIFY = 'cvv_verify',
  IVR_VERIFY = 'ivr_verify',
  OTP_VERIFY = 'otp_verify',
  PASSWORD_VERIFY = 'password_verify',
  PHONE_VERIFY = 'phone_verify',
  PIN_VERIFY = 'pin_verify',
  RECEIVER_VERIFY = 'receiver_verify',
  SENDER_VERIFY = 'sender_verify',
  SENDERAPP_VERIFY = 'senderapp_verify',
  WAIT_QR = 'wait_qr',
  WAIT_SENDER = 'wait_sender',

  // ⏳ Other statuses
  CASH_WAIT = 'cash_wait',
  HOLD_WAIT = 'hold_wait',
  INVOICE_WAIT = 'invoice_wait',
  PREPARED = 'prepared',
  PROCESSING = 'processing',
  WAIT_ACCEPT = 'wait_accept',
  WAIT_CARD = 'wait_card',
  WAIT_COMPENSATION = 'wait_compensation',
  WAIT_LC = 'wait_lc',
  WAIT_RESERVE = 'wait_reserve',
  WAIT_SECURE = 'wait_secure',
}

export enum PayTypeLiqpay {
  CARD = 'card',
  PRIVAT24 = 'privat24',
  MASTERPASS = 'masterpass',
  MOMENT_PART = 'moment_part',
  CASH = 'cash',
  INVOICE = 'invoice',
  QR = 'qr',
}
