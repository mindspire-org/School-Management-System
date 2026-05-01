import * as settingsSvc from '../services/settings.service.js';

const b64 = (s) => Buffer.from(s).toString('base64');

/** Read Twilio config from env or settings table */
const getConfig = async () => {
    let sid = process.env.TWILIO_ACCOUNT_SID || '';
    let token = process.env.TWILIO_AUTH_TOKEN || '';
    let waFrom = process.env.TWILIO_WHATSAPP_FROM || '';
    let smsFrom = process.env.TWILIO_SMS_FROM || '';
    try { if (!sid) sid = (await settingsSvc.getByKey('twilio.account_sid'))?.value || ''; } catch (_) { }
    try { if (!token) token = (await settingsSvc.getByKey('twilio.auth_token'))?.value || ''; } catch (_) { }
    try { if (!waFrom) waFrom = (await settingsSvc.getByKey('twilio.whatsapp_from'))?.value || ''; } catch (_) { }
    try { if (!smsFrom) smsFrom = (await settingsSvc.getByKey('twilio.sms_from'))?.value || ''; } catch (_) { }
    return { sid: sid.trim(), token: token.trim(), waFrom: waFrom.trim(), smsFrom: smsFrom.trim() };
};

const twilioFetch = async (path, config, options = {}) => {
    const { sid, token } = config;
    const url = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}${path}`;
    const resp = await fetch(url, {
        ...options,
        headers: {
            Authorization: `Basic ${b64(`${sid}:${token}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            ...(options.headers || {}),
        },
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data?.message || resp.statusText || 'Twilio API error');
    return data;
};

/** GET /twilio-dashboard/account — account info + balance */
export const getAccount = async (req, res, next) => {
    try {
        const cfg = await getConfig();
        if (!cfg.sid || !cfg.token) return res.json({ configured: false });
        const [account, balance] = await Promise.all([
            twilioFetch('.json', cfg),
            twilioFetch('/Balance.json', cfg),
        ]);
        res.json({
            configured: true,
            sid: account.sid,
            friendlyName: account.friendly_name,
            status: account.status,
            type: account.type,
            currency: balance.currency,
            balance: balance.balance,
            waFrom: cfg.waFrom,
            smsFrom: cfg.smsFrom,
        });
    } catch (e) { next(e); }
};

/** GET /twilio-dashboard/messages?pageSize=50 — message logs */
export const getMessages = async (req, res, next) => {
    try {
        const cfg = await getConfig();
        if (!cfg.sid || !cfg.token) return res.json({ configured: false, messages: [] });
        const pageSize = Math.min(Number(req.query.pageSize) || 50, 100);
        const data = await twilioFetch(`/Messages.json?PageSize=${pageSize}`, cfg);
        const messages = (data.messages || []).map((m) => ({
            sid: m.sid,
            from: m.from,
            to: m.to,
            body: m.body,
            status: m.status,
            direction: m.direction,
            numSegments: m.num_segments,
            price: m.price,
            currency: m.price_unit,
            dateSent: m.date_sent,
            dateCreated: m.date_created,
            errorCode: m.error_code,
            errorMessage: m.error_message,
        }));
        res.json({ configured: true, messages, total: data.pagination_info?.total_size || messages.length });
    } catch (e) { next(e); }
};

/** GET /twilio-dashboard/numbers — phone numbers linked to account */
export const getNumbers = async (req, res, next) => {
    try {
        const cfg = await getConfig();
        if (!cfg.sid || !cfg.token) return res.json({ configured: false, numbers: [] });
        const data = await twilioFetch('/IncomingPhoneNumbers.json?PageSize=50', cfg);
        const numbers = (data.incoming_phone_numbers || []).map((n) => ({
            sid: n.sid,
            phoneNumber: n.phone_number,
            friendlyName: n.friendly_name,
            capabilities: n.capabilities,
            smsUrl: n.sms_url,
            voiceUrl: n.voice_url,
            dateCreated: n.date_created,
        }));
        res.json({ configured: true, numbers });
    } catch (e) { next(e); }
};

/** POST /twilio-dashboard/test-send — send a test WhatsApp or SMS */
export const testSend = async (req, res, next) => {
    try {
        const cfg = await getConfig();
        if (!cfg.sid || !cfg.token) return res.status(400).json({ ok: false, error: 'Twilio not configured' });
        const { to, body = 'Test message from School Management System', channel = 'whatsapp' } = req.body || {};
        if (!to) return res.status(400).json({ ok: false, error: 'Recipient number (to) is required' });

        const normalizeWa = (v) => {
            if (!v) return '';
            const s = v.startsWith('whatsapp:') ? v.slice(9) : v;
            const digits = s.replace(/\D/g, '');
            const e164 = digits.startsWith('0') ? `+92${digits.slice(1)}` : `+${digits}`;
            return `whatsapp:${e164}`;
        };
        const toE164 = (v) => {
            if (!v) return '';
            const digits = v.replace(/\D/g, '');
            return digits.startsWith('0') ? `+92${digits.slice(1)}` : `+${digits}`;
        };

        let toParam, fromParam;
        if (channel === 'whatsapp') {
            toParam = normalizeWa(to);
            fromParam = cfg.waFrom.startsWith('whatsapp:') ? cfg.waFrom : `whatsapp:${cfg.waFrom}`;
        } else {
            toParam = toE164(to);
            fromParam = toE164(cfg.smsFrom);
        }

        const params = new URLSearchParams();
        params.append('To', toParam);
        params.append('From', fromParam);
        params.append('Body', body);

        const data = await twilioFetch('/Messages.json', cfg, {
            method: 'POST',
            body: params.toString(),
        });
        res.json({ ok: true, sid: data.sid, status: data.status, to: toParam, from: fromParam });
    } catch (e) {
        res.status(200).json({ ok: false, error: e?.message || String(e) });
    }
};
