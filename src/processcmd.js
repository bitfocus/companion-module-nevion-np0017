import { RESP, LOCK_STATE } from './consts.js'

// Parse and handle a single response line from the device.
// NP0017 response format examples:
//   size <level> <src_count> <dst_count>
//   crosspoints <level> <count> <src0> <src1> ... <srcN-1>
//   crosspoint <level> <dst> <src>
//   labels sources <level> <count> <label0> <label1> ... <labelN-1>
//   labels destinations <level> <count> <label0> <label1> ... <labelN-1>
//   lock <level> <dst> locked|unlocked
//   protect <level> <dst> protected|unprotected
//   ok
//   error <code> [message]
export function processResponse(line) {
	const parts = line.split(/\s+/)
	const type = parts[0].toLowerCase()

	switch (type) {
		case RESP.SIZE:
			this.handleSize(parts)
			break
		case RESP.CROSSPOINTS:
			this.handleCrosspoints(parts)
			break
		case RESP.CROSSPOINT:
			this.handleCrosspoint(parts)
			break
		case RESP.LABELS:
			// labels sources <level> <count> <label0> ...
			// labels destinations <level> <count> <label0> ...
			this.handleLabels(parts)
			break
		case RESP.LABELS_SRC:
			// Alternative: labels_src <level> <count> <label0> ...
			this.handleLabelsSrc(parts)
			break
		case RESP.LABELS_DST:
			// Alternative: labels_dst <level> <count> <label0> ...
			this.handleLabelsDst(parts)
			break
		case RESP.LOCK:
		case RESP.UNLOCK:
			this.handleLock(parts)
			break
		case RESP.PROTECT:
		case RESP.UNPROTECT:
			this.handleProtect(parts)
			break
		case RESP.ERROR:
			this.log('warn', `Device error: ${parts.slice(1).join(' ')}`)
			break
		case RESP.OK:
			// ACK — nothing to do
			break
		default:
			this.log('debug', `Unhandled response: ${line}`)
			break
	}
}

// size <level> <src_count> <dst_count>
function handleSize(parts) {
	const srcCount = parseInt(parts[2])
	const dstCount = parseInt(parts[3])
	if (!isNaN(srcCount) && !isNaN(dstCount)) {
		this.log('info', `Matrix size: ${srcCount} sources, ${dstCount} destinations`)
		// Only update if config doesn't already specify counts (or they differ)
		let changed = false
		if (srcCount !== this.sources.length) {
			this.sources = Array.from({ length: srcCount }, (_, i) => ({
				id: i + 1,
				label: this.sourcesLabels[i + 1] ?? `Source ${i + 1}`,
			}))
			changed = true
		}
		if (dstCount !== this.destinations.length) {
			this.destinations = Array.from({ length: dstCount }, (_, i) => ({
				id: i + 1,
				label: this.destinationsLabels[i + 1] ?? `Destination ${i + 1}`,
			}))
			changed = true
		}
		if (changed) {
			this.updateActions()
			this.updateFeedbacks()
			this.updateVariableDefinitions()
		}
	}
}

// crosspoints <level> <count> <src_for_dst0> <src_for_dst1> ...
// Sources and destinations are 0-based in the protocol; internally we use 1-based.
function handleCrosspoints(parts) {
	const count = parseInt(parts[2])
	if (isNaN(count)) return

	let changed = false
	for (let i = 0; i < count; i++) {
		const src0 = parseInt(parts[3 + i]) // 0-based source from device
		if (isNaN(src0)) continue
		const dst1 = i + 1 // 1-based destination
		const src1 = src0 + 1 // 1-based source
		if (this.connections[dst1] !== src1) {
			this.connections[dst1] = src1
			changed = true
		}
	}
	if (changed) {
		this.updateVariableValues()
		this.checkFeedbacks('checkCrosspoint')
	}
}

// crosspoint <level> <dst> <src>  (0-based)
function handleCrosspoint(parts) {
	const dst0 = parseInt(parts[2])
	const src0 = parseInt(parts[3])
	if (isNaN(dst0) || isNaN(src0)) return

	const dst1 = dst0 + 1
	const src1 = src0 + 1
	if (this.connections[dst1] !== src1) {
		this.connections[dst1] = src1
		this.updateVariableValues()
		this.checkFeedbacks('checkCrosspoint')
	}
}

// labels sources <level> <count> <label0> <label1> ...
// labels destinations <level> <count> <label0> <label1> ...
function handleLabels(parts) {
	const subtype = parts[1].toLowerCase()
	const count = parseInt(parts[3])
	if (isNaN(count)) return

	if (subtype === 'sources') {
		for (let i = 0; i < count; i++) {
			const label = parts[4 + i] ?? `Source ${i + 1}`
			this.sourcesLabels[i + 1] = label
		}
		this._rebuildSources()
	} else if (subtype === 'destinations') {
		for (let i = 0; i < count; i++) {
			const label = parts[4 + i] ?? `Destination ${i + 1}`
			this.destinationsLabels[i + 1] = label
		}
		this._rebuildDestinations()
	}
}

// labels_src <level> <count> <label0> ...
function handleLabelsSrc(parts) {
	const count = parseInt(parts[2])
	if (isNaN(count)) return
	for (let i = 0; i < count; i++) {
		this.sourcesLabels[i + 1] = parts[3 + i] ?? `Source ${i + 1}`
	}
	this._rebuildSources()
}

// labels_dst <level> <count> <label0> ...
function handleLabelsDst(parts) {
	const count = parseInt(parts[2])
	if (isNaN(count)) return
	for (let i = 0; i < count; i++) {
		this.destinationsLabels[i + 1] = parts[3 + i] ?? `Destination ${i + 1}`
	}
	this._rebuildDestinations()
}

// lock <level> <dst> locked|unlocked
function handleLock(parts) {
	const dst0 = parseInt(parts[2])
	const state = parts[3]?.toLowerCase()
	if (isNaN(dst0) || !state) return
	const dst1 = dst0 + 1
	this.locks[dst1] = state === LOCK_STATE.LOCKED
	this.checkFeedbacks('checkLock')
}

// protect <level> <dst> protected|unprotected
function handleProtect(parts) {
	const dst0 = parseInt(parts[2])
	const state = parts[3]?.toLowerCase()
	if (isNaN(dst0) || !state) return
	const dst1 = dst0 + 1
	this.protects[dst1] = state === LOCK_STATE.PROTECTED
	this.checkFeedbacks('checkProtect')
}

export { handleSize, handleCrosspoints, handleCrosspoint, handleLabels, handleLabelsSrc, handleLabelsDst, handleLock, handleProtect }
