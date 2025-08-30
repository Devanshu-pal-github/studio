// Centralized config helpers. Never hardcode secrets in code.

export function getEnv(name: string, fallback?: string): string {
	const val = process.env[name];
	if (val && val.length > 0) return val;
	if (fallback !== undefined) return fallback;
	return '';
}

export function getJWTSecret(): string {
	const fromEnv = process.env.JWT_SECRET;
	if (fromEnv && fromEnv.length >= 16) return fromEnv;
	if (process.env.NODE_ENV !== 'production') {
		// ephemeral dev-only secret (not persisted)
		return 'dev-' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
	}
	throw new Error('JWT_SECRET is required in production environment');
}

export function getMongoURI(): string {
	const uri = process.env.MONGODB_URI || '';
	if (uri) return uri;
	// Allow localhost only in non-production
	if (process.env.NODE_ENV !== 'production') return 'mongodb://localhost:27017';
	throw new Error('MONGODB_URI is required in production environment');
}

export function getMongoDBName(uri?: string): string {
	// Priority: env MONGODB_DB > DB path in URI > default
	if (process.env.MONGODB_DB && process.env.MONGODB_DB.length > 0) return process.env.MONGODB_DB;
	const u = uri || process.env.MONGODB_URI || '';
	try {
		// SRV URIs may not parse cleanly via URL in Node; fallback to manual parse
		// Expect formats: mongodb+srv://.../dbName?query or mongodb://host:port/dbName
		const afterSlash = u.split('//')[1]?.split('/')?.[1] || '';
		const dbPart = (afterSlash || '').split('?')[0];
		if (dbPart && !dbPart.startsWith('?') && dbPart.trim().length > 0) return dbPart.trim();
	} catch {}
	// Default database name
	return 'gdg';
}

