import { Regex } from '@companion-module/base'
import { DEFAULT_PORT, DEFAULT_POLL_INTERVAL } from './consts.js'

export async function configUpdated(config) {
	this.config = config
	this.initState()
	await this.updateVariableDefinitions()
	this.updateVariableValues()
	this.updateActions()
	this.updateFeedbacks()
	this.initTCP()
}

export function getConfigFields() {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Hostname / IP',
			width: 8,
			regex: Regex.HOSTNAME,
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Port',
			width: 4,
			regex: Regex.PORT,
			default: DEFAULT_PORT,
			tooltip: `Default TCP port: ${DEFAULT_PORT}`,
		},
		{
			type: 'number',
			id: 'level',
			label: 'Router Level',
			width: 4,
			default: 0,
			min: 0,
			max: 63,
			tooltip: 'Router level / matrix index (0-based)',
		},
		{
			type: 'number',
			id: 'src',
			label: 'Source Count',
			width: 4,
			default: 16,
			min: 1,
			max: 1024,
			range: true,
			step: 1,
		},
		{
			type: 'number',
			id: 'dst',
			label: 'Destination Count',
			width: 4,
			default: 16,
			min: 1,
			max: 1024,
			range: true,
			step: 1,
		},
		{
			type: 'checkbox',
			id: 'autoLabels',
			label: 'Fetch Labels from Device',
			width: 4,
			default: true,
			tooltip: 'Retrieve source and destination labels from the device on connect',
		},
		{
			type: 'checkbox',
			id: 'subscribe',
			label: 'Subscribe to Change Notifications',
			width: 4,
			default: true,
			tooltip: 'Send subscribe command so the device pushes crosspoint updates automatically',
		},
		{
			type: 'number',
			id: 'pollInterval',
			label: 'Poll Interval (ms, 0 = disabled)',
			width: 4,
			default: DEFAULT_POLL_INTERVAL,
			min: 0,
			max: 60000,
			tooltip: 'How often to refresh crosspoint state by polling. Set to 0 to disable polling.',
		},
	]
}
