import * as settingsSvc from './settings.service.js';

const b64 = (s) => Buffer.from(s).toString('base64');

const getConfig = async () => {
  let sid = process.env.TWILIO_ACCOUNT_SID || '';
  let token = process.env.TWILIO_AUTH_TOKEN || '';
  let smsFrom = process.env.TWILIO_SMS_FROM || '';
  let waFrom = process.env.TWILIO_WHATSAPP_FROM || '';
  try {
    if (!sid) sid = (await settingsSvc.getByKey('twilio.account_sid'))?.value || '';
  } catch (_) {}
  try {
    if (!token) token = (await settingsSvc.getByKey('twilio.auth_token'))?.value || '';
  } catch (_) {}
  try {
    if (!smsFrom) smsFrom = (await settingsSvc.getByKey('twilio.sms_from'))?.value || '';
  } catch (_) {}
  try {
    if (!waFrom) waFrom = (await settingsSvc.getByKey('twilio.whatsapp_from'))?.value || '';
  } catch (_) {}
  return { sid: sid.trim(), token: token.trim(), smsFrom: smsFrom.trim(), waFrom: waFrom.trim() };
};

const toE164 = (raw) => {
  if (!raw) return '';
  const s = String(raw).trim();
  if (s.startsWith('+')) return s;
  const digits = s.replace(/\D/g, '');
  if (!digits) return '';
  return `+${digits}`;
};

export const canUseWhatsApp = async () => {
  const { sid, token, waFrom } = await getConfig();
  return !!(sid && token && waFrom);
};

export const canUseSms = async () => {
  const { sid, token, smsFrom } = await getConfig();
  return !!(sid && token && smsFrom);
};

export const sendWhatsAppText = async ({ to, body, from } = {}) => {
  const { sid, token, waFrom } = await getConfig();
  const fromFinal = (from || waFrom || '').trim();
  const toFinal = String(to || '').trim();
  if (!sid || !token || !fromFinal || !toFinal || !body) {
    throw new Error('Twilio WhatsApp not configured or missing parameters');
  }
  const normalizeWa = (v) => {
    if (!v) return '';
    const s = v.startsWith('whatsapp:') ? v.slice(9) : v;
    const e = toE164(s);
    return `whatsapp:${e}`;
  };
  const toParam = normalizeWa(toFinal);
  const fromParam = normalizeWa(fromFinal);
  console.log('--- TWILIO WHATSAPP SEND ATTEMPT ---');
  console.log('To:', toParam);
  console.log('From:', fromParam);
  console.log('Body:', body);

  const params = new URLSearchParams();
  params.append('To', toParam);
  params.append('From', fromParam);
  params.append('Body', String(body));
  const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${b64(`${sid}:${token}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  const data = await resp.json().catch(() => ({}));
  console.log('Twilio API Response Status:', resp.status);
  console.log('Twilio API Response Data:', JSON.stringify(data, null, 2));
  
  if (!resp.ok) {
    const msg = data?.message || resp.statusText || 'Twilio WhatsApp send failed';
    console.error('Twilio WhatsApp Send Error:', msg);
    throw new Error(msg);
  }
  return { success: true, sid: data.sid || null, status: data.status || null, to: toParam, from: fromParam };
};

export const sendSmsText = async ({ to, body, from } = {}) => {
  const { sid, token, smsFrom } = await getConfig();
  const fromFinal = (from || smsFrom || '').trim();
  const toFinal = String(to || '').trim();
  if (!sid || !token || !fromFinal || !toFinal || !body) {
    throw new Error('Twilio SMS not configured or missing parameters');
  }
  const toParam = toE164(toFinal);
  const fromParam = toE164(fromFinal);
  const params = new URLSearchParams();
  params.append('To', toParam);
  params.append('From', fromParam);
  params.append('Body', String(body));
  const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${b64(`${sid}:${token}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = data?.message || resp.statusText || 'Twilio SMS send failed';
    throw new Error(msg);
  }
  return { success: true, sid: data.sid || null, status: data.status || null, to: toParam, from: fromParam };
};

