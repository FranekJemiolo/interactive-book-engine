# Interactive Narrative Book Engine (INBE)

A lightweight, GitHub Pages–deployable interactive book engine combining interactive fiction, visual novel framing, and optional exploration/debug tools.

## Features

- **Content-First Architecture**: Define stories using declarative YAML files
- **Branching Narrative**: Create complex story graphs with conditional choices
- **State Management**: Track variables, flags, and player progress
- **Responsive Design**: Mobile-first reading experience with desktop enhancements
- **Progress Persistence**: Resume from where you left off using localStorage
- **Deterministic Runtime**: Same input always produces the same story path
- **GitHub Pages Ready**: Single-file build system for easy deployment

## Architecture

The system is divided into 4 layers:

1. **Content Layer** (YAML / DB)
2. **Engine Layer** (state + execution)
3. **UX Layer** (rendering + interaction)
4. **Tooling Layer** (graph, replay, analytics - optional)

## Project Structure

```
interactive-book-engine/
├── src/
│   ├── adapters/       # Data loading adapters (YAML, DB)
│   ├── core/           # Core engine (conditions, evaluation)
│   ├── engine/         # Node lifecycle, chapter system
│   ├── renderer/       # DOM-based UI renderer
│   ├── state/          # State management
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utilities (progress, etc.)
│   ├── app.ts          # Main application entry point
│   └── styles.css      # Responsive styling
├── content/            # Book content (YAML files)
│   ├── book.yaml
│   ├── chapters/
│   └── nodes/
├── .github/workflows/  # CI/CD for GitHub Pages
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Content Specification

### Book Structure

```yaml
title: "The Last Signal"
chapters:
  - chapter_1
  - chapter_2

arcs:
  introduction:
    pacing:
      frameDelay: 500
      suspense: "low"
    visuals:
      tone: "mysterious"
```

### Chapter

```yaml
id: chapter_1
title: "The Arrival"
arc: introduction
nodes:
  - node_1_1
  - node_1_2
context:
  location: "space_station"
  time: "night"
```

### Node

```yaml
id: node_1_1
content:
  - type: text
    value: "It was raining when you arrived."
  - type: pause
    duration: 1000
  - type: image
    src: "images/scene.jpg"
choices:
  - text: "Look around"
    goto: node_1_2
  - text: "Check equipment"
    goto: node_1_3
```

### Conditional Choices

```yaml
choices:
  - text: "Ask about the case"
    goto: chapter_2
    require:
      all:
        - var: "trust"
          op: ">="
          value: 3
        - flag: "has_key"
          equals: true
```

## State Model

```typescript
{
  vars: Record<string, number>      // Numeric gameplay variables
  flags: Record<string, boolean>    // Boolean switches
  global: Record<string, any>      // Cross-book memory
  chapter: {
    id: string
    context: Record<string, any>  // Scoped narrative state
  }
  meta: {
    visitedNodes: string[]
    choicesMade: string[]
    startedAt: number
  }
}
```

## Condition Language

Supported operators for variables: `>`, `<`, `>=`, `<=`, `==`, `!=`

Supported operators for flags: `equals: true | false`

Logical structure:
- `all: []` - AND
- `any: []` - OR
- `not: {}` - invert

## Deployment

### GitHub Pages

1. Push your code to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to `GitHub Actions`
4. The workflow in `.github/workflows/deploy.yml` will automatically build and deploy

### Manual Build

```bash
npm run build
# Upload the contents of the `dist` folder to your hosting provider
```

## Development

### Running Tests

```bash
npm test
```

### Docker + DB Testing

```bash
npm run test:docker
```

This starts a PostgreSQL database and runs tests against it.

## Roadmap

- [ ] Embedded scenes with interactive zones
- [ ] DB adapter for backend content
- [ ] Graph visualization tool
- [ ] Replay system
- [ ] Causal analysis engine
- [ ] Immersive mode with fullscreen API
- [ ] Chapter completion screen
- [ ] Reader Intent System

## License

MIT

## Author

FranekJemiolo
