export default function handler(req, res) { res.status(200).json({ ok: true, hasKeys: !!process.env.ANTHROPIC_API_KEY && !!process.env.ORS_API_KEY }) }
