import { InstanceStatus, TCPHelper } from '@companion-module/base'
import { EOL, CMD, RECONNECT_DELAY } from './consts.js'

export function sendCommand(cmd) {
	const line = cmd + EOL
	if (this.socket !== undefined && this.socket.isConnected) {
		this.log('debug', `TX: ${cmd}`)
		this.socket.send(Buffer.from(line, 'utf8'))
		return true
	}
	this.log('warn', `Socket not connected, could not send: ${cmd}`)
	return false
}

export function queryOnConnect() {
	const level = this.config.level ?? 0

	this.sendCommand(`${CMD.GET_SIZE} ${level}`)

	if (this.config.autoLabels) {
		this.sendCommand(`${CMD.GET_LABELS_SRC} ${level} sources`)
		this.sendCommand(`${CMD.GET_LABELS_DST} ${level} destinations`)
	}

	this.sendCommand(`${CMD.GET_CROSSPOINTS} ${level}`)

	if (this.config.subscribe) {
		this.sendCommand(`${CMD.SUBSCRIBE} ${level}`)
	}
}

export function startPoll() {
	this.stopPoll()
	const interval = this.config.pollInterval ?? 0
	if (interval > 0) {
		this.pollTimer = setInterval(() => {
			if (this.socket && this.socket.isConnected) {
				this.sendCommand(`${CMD.GET_CROSSPOINTS} ${this.config.level ?? 0}`)
			}
		}, interval)
	}
}

export function stopPoll() {
	if (this.pollTimer) {
		clearInterval(this.pollTimer)
		this.pollTimer = null
	}
}

export function initTCP() {
	this.receiveBuffer = ''

	if (this.socket !== undefined) {
		this.socket.destroy()
		delete this.socket
	}

	this.stopPoll()

	if (!this.config.host) {
		this.updateStatus(InstanceStatus.BadConfig)
		return
	}

	this.updateStatus(InstanceStatus.Connecting, `Connecting to ${this.config.host}:${this.config.port}`)
	this.socket = new TCPHelper(this.config.host, this.config.port)

	this.socket.on('status_change', (status, message) => {
		this.updateStatus(status, message)
	})

	this.socket.on('error', (err) => {
		this.log('error', `Network error: ${err.message}`)
		this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
		this.stopPoll()
	})

	this.socket.on('connect', () => {
		this.log('info', `Connected to ${this.config.host}:${this.config.port}`)
		this.updateStatus(InstanceStatus.Ok, `Connected to ${this.config.host}`)
		this.receiveBuffer = ''
		this.queryOnConnect()
		this.startPoll()
	})

	this.socket.on('data', (chunk) => {
		this.receiveBuffer += chunk.toString('utf8')
		let lineEnd
		while ((lineEnd = this.receiveBuffer.indexOf('\n')) !== -1) {
			const line = this.receiveBuffer.slice(0, lineEnd).replace(/\r$/, '').trim()
			this.receiveBuffer = this.receiveBuffer.slice(lineEnd + 1)
			if (line.length > 0) {
				this.log('debug', `RX: ${line}`)
				this.processResponse(line)
			}
		}
	})
}
