import { InstanceBase, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { UpgradeScripts } from './upgrades.js'
import UpdateActions from './actions.js'
import UpdateFeedbacks from './feedbacks.js'
import UpdateVariableDefinitions from './variables.js'
import * as config from './config.js'
import * as tcp from './tcp.js'
import * as processcmd from './processcmd.js'

class NevionNP extends InstanceBase {
	constructor(internal) {
		super(internal)
		Object.assign(this, { ...config, ...tcp, ...processcmd })

		this.socket = undefined
		this.receiveBuffer = ''
		this.pollTimer = null

		// State: keyed by 1-based index
		this.connections = {}   // dst1 -> src1
		this.locks = {}         // dst1 -> bool
		this.protects = {}      // dst1 -> bool
		this.sourcesLabels = {} // src1 -> string
		this.destinationsLabels = {} // dst1 -> string
		this.sources = []
		this.destinations = []
	}

	async init(config) {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)
		this.initState()
		await this.updateVariableDefinitions()
		this.updateVariableValues()
		this.updateActions()
		this.updateFeedbacks()
		this.initTCP()
	}

	async destroy() {
		this.log('debug', `destroy id: ${this.id}`)
		this.stopPoll()
		if (this.socket) {
			this.socket.destroy()
		}
		this.updateStatus(InstanceStatus.Disconnected)
	}

	initState() {
		this.connections = {}
		this.locks = {}
		this.protects = {}
		this.sourcesLabels = {}
		this.destinationsLabels = {}

		const srcCount = this.config.src ?? 16
		const dstCount = this.config.dst ?? 16

		this.sources = Array.from({ length: srcCount }, (_, i) => ({
			id: i + 1,
			label: `Source ${i + 1}`,
		}))
		this.destinations = Array.from({ length: dstCount }, (_, i) => ({
			id: i + 1,
			label: `Destination ${i + 1}`,
		}))

		for (let i = 1; i <= dstCount; i++) {
			this.connections[i] = null
			this.locks[i] = false
			this.protects[i] = false
		}
	}

	updateVariableValues() {
		const vals = {}
		for (let i = 1; i <= (this.config.dst ?? 16); i++) {
			vals[`dst_${i}`] = this.connections[i] ?? 'unknown'
		}
		for (let i = 1; i <= (this.config.src ?? 16); i++) {
			vals[`label_src_${i}`] = this.sourcesLabels[i] ?? `Source ${i}`
		}
		for (let i = 1; i <= (this.config.dst ?? 16); i++) {
			vals[`label_dst_${i}`] = this.destinationsLabels[i] ?? `Destination ${i}`
		}
		this.setVariableValues(vals)
	}

	_rebuildSources() {
		this.sources = Array.from({ length: this.config.src ?? 16 }, (_, i) => ({
			id: i + 1,
			label: this.sourcesLabels[i + 1] ?? `Source ${i + 1}`,
		}))
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableValues()
	}

	_rebuildDestinations() {
		this.destinations = Array.from({ length: this.config.dst ?? 16 }, (_, i) => ({
			id: i + 1,
			label: this.destinationsLabels[i + 1] ?? `Destination ${i + 1}`,
		}))
		this.updateActions()
		this.updateFeedbacks()
		this.updateVariableValues()
	}

	_validateDstSrc(dst1, src1) {
		if (isNaN(dst1) || dst1 < 1 || dst1 > (this.config.dst ?? 16)) {
			this.log('warn', `Invalid destination: ${dst1}`)
			return false
		}
		if (isNaN(src1) || src1 < 1 || src1 > (this.config.src ?? 16)) {
			this.log('warn', `Invalid source: ${src1}`)
			return false
		}
		return true
	}

	handleStartStopRecordActions(isRecording) {
		this.isRecordingActions = isRecording
	}

	updateActions() {
		UpdateActions(this)
	}

	updateFeedbacks() {
		UpdateFeedbacks(this)
	}

	async updateVariableDefinitions() {
		await UpdateVariableDefinitions(this)
	}
}

runEntrypoint(NevionNP, UpgradeScripts)
