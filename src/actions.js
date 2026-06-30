import { CMD } from './consts.js'

export default function UpdateActions(self) {
	const optionDst = {
		type: 'dropdown',
		id: 'dst',
		label: 'Destination',
		choices: self.destinations,
		default: self.destinations[0]?.id ?? 1,
		allowCustom: true,
		tooltip: 'Variable must return an integer (1-based)',
	}
	const optionSrc = {
		type: 'dropdown',
		id: 'src',
		label: 'Source',
		choices: self.sources,
		default: self.sources[0]?.id ?? 1,
		allowCustom: true,
		tooltip: 'Variable must return an integer (1-based)',
	}

	self.setActionDefinitions({
		setCrosspoint: {
			name: 'Take / Set Crosspoint',
			description: 'Route a source to a destination',
			options: [optionDst, optionSrc],
			callback: async ({ options }, context) => {
				const dst1 = parseInt(await context.parseVariablesInString(String(options.dst)))
				const src1 = parseInt(await context.parseVariablesInString(String(options.src)))
				if (!self._validateDstSrc(dst1, src1)) return
				// Protocol uses 0-based indexing
				self.sendCommand(`${CMD.SET_CROSSPOINT} ${self.config.level ?? 0} ${dst1 - 1} ${src1 - 1}`)
			},
			learn: async (action, context) => {
				const dst1 = parseInt(await context.parseVariablesInString(String(action.options.dst)))
				if (isNaN(dst1) || dst1 < 1 || dst1 > self.config.dst) return undefined
				return { ...action.options, src: self.connections[dst1] ?? action.options.src }
			},
			subscribe: async ({ options }, context) => {
				const dst1 = parseInt(await context.parseVariablesInString(String(options.dst)))
				if (isNaN(dst1) || dst1 < 1) return
				self.sendCommand(`${CMD.GET_CROSSPOINT} ${self.config.level ?? 0} ${dst1 - 1}`)
			},
		},

		interrogate: {
			name: 'Query Crosspoint',
			description: 'Request current source for a destination',
			options: [optionDst],
			callback: async ({ options }, context) => {
				const dst1 = parseInt(await context.parseVariablesInString(String(options.dst)))
				if (isNaN(dst1) || dst1 < 1 || dst1 > self.config.dst) return
				self.sendCommand(`${CMD.GET_CROSSPOINT} ${self.config.level ?? 0} ${dst1 - 1}`)
			},
		},

		queryAllCrosspoints: {
			name: 'Query All Crosspoints',
			description: 'Refresh all crosspoint states from the device',
			options: [],
			callback: () => {
				self.sendCommand(`${CMD.GET_CROSSPOINTS} ${self.config.level ?? 0}`)
			},
		},

		lockDestination: {
			name: 'Lock Destination',
			description: 'Lock a destination to prevent routing changes',
			options: [optionDst],
			callback: async ({ options }, context) => {
				const dst1 = parseInt(await context.parseVariablesInString(String(options.dst)))
				if (isNaN(dst1) || dst1 < 1 || dst1 > self.config.dst) return
				self.sendCommand(`${CMD.LOCK} ${self.config.level ?? 0} ${dst1 - 1}`)
			},
		},

		unlockDestination: {
			name: 'Unlock Destination',
			description: 'Unlock a destination',
			options: [optionDst],
			callback: async ({ options }, context) => {
				const dst1 = parseInt(await context.parseVariablesInString(String(options.dst)))
				if (isNaN(dst1) || dst1 < 1 || dst1 > self.config.dst) return
				self.sendCommand(`${CMD.UNLOCK} ${self.config.level ?? 0} ${dst1 - 1}`)
			},
		},

		protectDestination: {
			name: 'Protect Destination',
			description: 'Protect a destination (soft lock)',
			options: [optionDst],
			callback: async ({ options }, context) => {
				const dst1 = parseInt(await context.parseVariablesInString(String(options.dst)))
				if (isNaN(dst1) || dst1 < 1 || dst1 > self.config.dst) return
				self.sendCommand(`${CMD.PROTECT} ${self.config.level ?? 0} ${dst1 - 1}`)
			},
		},

		unprotectDestination: {
			name: 'Unprotect Destination',
			description: 'Remove protection from a destination',
			options: [optionDst],
			callback: async ({ options }, context) => {
				const dst1 = parseInt(await context.parseVariablesInString(String(options.dst)))
				if (isNaN(dst1) || dst1 < 1 || dst1 > self.config.dst) return
				self.sendCommand(`${CMD.UNPROTECT} ${self.config.level ?? 0} ${dst1 - 1}`)
			},
		},

		salvo: {
			name: 'Salvo (Multiple Crosspoints)',
			description: 'Set multiple crosspoints in one action (comma-separated pairs)',
			options: [
				{
					type: 'textinput',
					id: 'pairs',
					label: 'dst:src pairs (comma separated, e.g. 1:3,2:5,3:1)',
					default: '1:1',
					tooltip: 'Format: dst:src,dst:src,... using 1-based numbers',
				},
			],
			callback: async ({ options }, context) => {
				const raw = await context.parseVariablesInString(options.pairs)
				const pairs = raw.split(',').map((p) => p.trim())
				for (const pair of pairs) {
					const [dstStr, srcStr] = pair.split(':')
					const dst1 = parseInt(dstStr)
					const src1 = parseInt(srcStr)
					if (!self._validateDstSrc(dst1, src1)) continue
					self.sendCommand(`${CMD.SET_CROSSPOINT} ${self.config.level ?? 0} ${dst1 - 1} ${src1 - 1}`)
				}
			},
		},

		fetchLabels: {
			name: 'Refresh Labels from Device',
			description: 'Re-request source and destination labels',
			options: [],
			callback: () => {
				const level = self.config.level ?? 0
				self.sendCommand(`${CMD.GET_LABELS_SRC} ${level} sources`)
				self.sendCommand(`${CMD.GET_LABELS_DST} ${level} destinations`)
			},
		},
	})
}
