<p align="center">
  <a href="https://opencode.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="OpenCode logo">
    </picture>
  </a>
</p>
<p align="center">The open source AI coding agent.</p>

> **Fan-made fork:** This repository adds an English-language custom terminal UI, three work modes, and a built-in catalog of 67 specialist agents to OpenCode. It is an independent community project, not an official OpenCode release and not affiliated with or endorsed by the OpenCode team. See the [Custom Version Overview](./CUSTOM-VERSION.md) for features, the full agent catalog, build instructions, and limitations.

<p align="center">
  <a href="https://opencode.ai/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/@opencode/cli"><img alt="npm" src="https://img.shields.io/npm/v/@opencode/cli?style=flat-square" /></a>
  <a href="https://github.com/anomalyco/opencode/actions/workflows/release.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/anomalyco/opencode/release.yml?style=flat-square&branch=dev" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">Chinese (Simplified)</a> |
  <a href="README.zht.md">Chinese (Traditional)</a> |
  <a href="README.ko.md">Korean</a> |
  <a href="README.de.md">German</a> |
  <a href="README.es.md">Spanish</a> |
  <a href="README.fr.md">French</a> |
  <a href="README.it.md">Italian</a> |
  <a href="README.da.md">Danish</a> |
  <a href="README.ja.md">Japanese</a> |
  <a href="README.pl.md">Polish</a> |
  <a href="README.ru.md">Russian</a> |
  <a href="README.bs.md">Bosnian</a> |
  <a href="README.ar.md">Arabic</a> |
  <a href="README.no.md">Norwegian</a> |
  <a href="README.br.md">Portuguese (Brazil)</a> |
  <a href="README.th.md">Thai</a> |
  <a href="README.tr.md">Turkish</a> |
  <a href="README.uk.md">Ukrainian</a> |
  <a href="README.bn.md">Bengali</a> |
  <a href="README.gr.md">Greek</a> |
  <a href="README.vi.md">Vietnamese</a>
</p>

[![OpenCode Terminal UI](packages/web/src/assets/lander/screenshot.png)](https://opencode.ai)

---

### Installation

> The installation commands below install the **official upstream OpenCode**, not this fork. To use this fork's custom features, build this repository by following [Build and Run](./CUSTOM-VERSION.md#build-and-run).

```bash
# YOLO
curl -fsSL https://opencode.ai/v2/install | bash

# Package managers
npm i -g @opencode/cli@latest      # or bun/pnpm/yarn
brew install anomalyco/tap/opencode-v2 # macOS and Linux (recommended, always up to date)
brew install opencode              # macOS and Linux (official brew formula, updated less)
sudo pacman -S opencode            # Arch Linux (Stable)
paru -S opencode-beta              # Arch Linux (Latest from AUR)
mise use -g opencode               # Any OS
nix run github:anomalyco/opencode  # Nix
```

> [!TIP]
> Remove versions older than 0.1.x before installing.

### Desktop App (BETA)

The **official upstream OpenCode** is also available as a desktop application. This fan-made fork customizes the terminal CLI/TUI only; the official desktop downloads below do not include this fork's custom features. Download the upstream app from [opencode.ai/download](https://opencode.ai/download).

| Platform              | Download                           |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `opencode-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `opencode-desktop-mac-x64.dmg`     |
| Windows               | `opencode-desktop-win-x64.exe`     |
| Linux                 | `.deb`, `.rpm`, or `.AppImage`     |

```bash
# macOS (Homebrew)
brew install --cask opencode-desktop
```

#### Installation Directory

The install script installs OpenCode to `$HOME/.opencode/bin`.

### Agents

The upstream OpenCode agents include two primary agents you can switch between with the `Tab` key.

- **build** - Default, full-access agent for development work
- **plan** - Read-only agent for analysis and code exploration
  - Denies file edits by default
  - Asks permission before running bash commands
  - Ideal for exploring unfamiliar codebases or planning changes

The upstream distribution also includes a **general** subagent for complex searches and multistep tasks.
This is used internally and can be invoked using `@general` in messages.

This fork adds 67 specialist agents on top of the upstream agents. See the [Custom Version Overview](./CUSTOM-VERSION.md#agent-catalog) for the complete catalog.

Learn more about [agents](https://opencode.ai/v2/docs/agents).

### Documentation

For more info on how to configure OpenCode, [**head over to our docs**](https://opencode.ai/v2/docs).

### Contributing

If you're interested in contributing to OpenCode, please read our [contributing docs](./CONTRIBUTING.md) before submitting a pull request.

### Building on OpenCode

If you are working on a project that's related to OpenCode and is using "opencode" as part of its name, for example "opencode-dashboard" or "opencode-mobile", please add a note to your README to clarify that it is not built by the OpenCode team and is not affiliated with us in any way.

---

**Join our community** [Discord](https://discord.gg/opencode) | [X.com](https://x.com/opencode)
