export default async function UpdateVariableDefinitions(self) {
	const defs = []

	for (let i = 1; i <= self.config.dst; i++) {
		defs.push({ variableId: `dst_${i}`, name: `Current source for destination ${i}` })
	}
	for (let i = 1; i <= self.config.src; i++) {
		defs.push({ variableId: `label_src_${i}`, name: `Source ${i} label` })
	}
	for (let i = 1; i <= self.config.dst; i++) {
		defs.push({ variableId: `label_dst_${i}`, name: `Destination ${i} label` })
	}

	await self.setVariableDefinitions(defs)
}
