import { combineRgb } from '@companion-module/base'

export default function UpdateFeedbacks(self) {
	self.setFeedbackDefinitions({
		checkCrosspoint: {
			name: 'Crosspoint Active',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 0, 0),
				color: combineRgb(255, 255, 255),
			},
			options: [
				{
					type: 'dropdown',
					id: 'dst',
					label: 'Destination',
					default: self.destinations[0]?.id ?? 1,
					choices: self.destinations,
					allowCustom: true,
				},
				{
					type: 'dropdown',
					id: 'src',
					label: 'Source',
					default: self.sources[0]?.id ?? 1,
					choices: self.sources,
					allowCustom: true,
				},
			],
			callback: async (feedback, context) => {
				const dst1 = parseInt(await context.parseVariablesInString(String(feedback.options.dst)))
				const src1 = parseInt(await context.parseVariablesInString(String(feedback.options.src)))
				if (isNaN(dst1) || dst1 < 1 || dst1 > self.config.dst) return false
				return self.connections[dst1] === src1
			},
			subscribe: async (feedback, context) => {
				const dst1 = parseInt(await context.parseVariablesInString(String(feedback.options.dst)))
				if (isNaN(dst1) || dst1 < 1) return
				self.sendCommand(`get_crosspoint ${self.config.level ?? 0} ${dst1 - 1}`)
			},
			learn: async (feedback, context) => {
				const dst1 = parseInt(await context.parseVariablesInString(String(feedback.options.dst)))
				if (isNaN(dst1) || dst1 < 1 || dst1 > self.config.dst) return undefined
				return { ...feedback.options, src: self.connections[dst1] ?? feedback.options.src }
			},
		},

		checkLock: {
			name: 'Destination Locked',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 128, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					id: 'dst',
					label: 'Destination',
					default: self.destinations[0]?.id ?? 1,
					choices: self.destinations,
					allowCustom: true,
				},
			],
			callback: async (feedback, context) => {
				const dst1 = parseInt(await context.parseVariablesInString(String(feedback.options.dst)))
				if (isNaN(dst1) || dst1 < 1 || dst1 > self.config.dst) return false
				return self.locks[dst1] === true
			},
		},

		checkProtect: {
			name: 'Destination Protected',
			type: 'boolean',
			defaultStyle: {
				bgcolor: combineRgb(255, 200, 0),
				color: combineRgb(0, 0, 0),
			},
			options: [
				{
					type: 'dropdown',
					id: 'dst',
					label: 'Destination',
					default: self.destinations[0]?.id ?? 1,
					choices: self.destinations,
					allowCustom: true,
				},
			],
			callback: async (feedback, context) => {
				const dst1 = parseInt(await context.parseVariablesInString(String(feedback.options.dst)))
				if (isNaN(dst1) || dst1 < 1 || dst1 > self.config.dst) return false
				return self.protects[dst1] === true
			},
		},
	})
}
