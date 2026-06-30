# Nevion NP0016 / NP0017 Router Control

This module controls video matrix routers that support the **Nevion NP0016** or **NP0017** ASCII protocol (formerly Network Electronics).

## Supported Devices

- Nevion eMerger
- Nevion Flashlink
- Nevion VideoIPath (with NP0017 adapter)
- Any router supporting the NP0016/NP0017 protocol

## Connection

Connect via TCP (default port **4000**). The module will automatically:
1. Query matrix size on connect
2. Retrieve source and destination labels
3. Subscribe to crosspoint change notifications

## Protocol Variants

- **NP0016**: Legacy line-based ASCII protocol (default)
- **NP0017**: Extended version with label support and additional status messages

## Configuration

| Field | Description |
|---|---|
| Host | IP address or hostname of the router |
| Port | TCP port (default: 4000) |
| Level | Router level/matrix to control (0-based, default: 0) |
| Sources | Number of source inputs |
| Destinations | Number of destination outputs |
| Poll Interval | How often to poll crosspoint state (ms) |

## Actions

- **Take / Set Crosspoint** — Route a source to a destination
- **Salvo** — Set multiple crosspoints at once
- **Lock Destination** — Lock/unlock a destination

## Feedbacks

- **Crosspoint Active** — True when a specific source is routed to a destination

## Variables

- `$(nevion:dst_N)` — Current source routed to destination N
- `$(nevion:label_src_N)` — Label of source N
- `$(nevion:label_dst_N)` — Label of destination N
