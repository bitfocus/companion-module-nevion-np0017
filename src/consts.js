// Default TCP port for NP0016/NP0017
export const DEFAULT_PORT = 4000

// Poll interval in ms for crosspoint state refresh
export const DEFAULT_POLL_INTERVAL = 5000

// Reconnect delay in ms after connection loss
export const RECONNECT_DELAY = 5000

// Command line terminator (CR+LF)
export const EOL = '\r\n'

// NP0016/NP0017 command strings
export const CMD = {
	// Query all crosspoints for a level
	GET_CROSSPOINTS: 'get_crosspoints',
	// Set a single crosspoint: set_crosspoint <level> <dst> <src>
	SET_CROSSPOINT: 'set_crosspoint',
	// Query a single crosspoint: get_crosspoint <level> <dst>
	GET_CROSSPOINT: 'get_crosspoint',
	// Get all source labels: get_labels <level> sources
	GET_LABELS_SRC: 'get_labels',
	// Get all destination labels: get_labels <level> destinations
	GET_LABELS_DST: 'get_labels',
	// Get matrix size: get_size <level>
	GET_SIZE: 'get_size',
	// Lock a destination: lock <level> <dst>
	LOCK: 'lock',
	// Unlock a destination: unlock <level> <dst>
	UNLOCK: 'unlock',
	// Protect a destination: protect <level> <dst>
	PROTECT: 'protect',
	// Unprotect a destination: unprotect <level> <dst>
	UNPROTECT: 'unprotect',
	// Subscribe to change notifications: subscribe <level>
	SUBSCRIBE: 'subscribe',
}

// Response type strings from device
export const RESP = {
	CROSSPOINTS: 'crosspoints',
	CROSSPOINT: 'crosspoint',
	LABELS_SRC: 'labels_src',
	LABELS_DST: 'labels_dst',
	LABELS: 'labels',
	SIZE: 'size',
	LOCK: 'lock',
	UNLOCK: 'unlock',
	PROTECT: 'protect',
	UNPROTECT: 'unprotect',
	ERROR: 'error',
	OK: 'ok',
}

export const LOCK_STATE = {
	LOCKED: 'locked',
	UNLOCKED: 'unlocked',
	PROTECTED: 'protected',
}
