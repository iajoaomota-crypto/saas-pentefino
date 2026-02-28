export default function handler(req: any, res: any) {
    res.status(200).json({ pong: true, env: process.env.NODE_ENV || 'unknown' });
}
