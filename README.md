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

## Creating Your Own Interactive Book

This section provides step-by-step instructions for copying this repository structure to create and host your own interactive book on GitHub Pages.

### Step 1: Fork or Clone the Repository

**Option A: Fork (Recommended for GitHub Pages)**

1. Go to the repository page on GitHub
2. Click the "Fork" button in the top-right corner
3. Choose your account as the destination
4. Wait for the fork to complete

**Option B: Clone (For Local Development)**

```bash
git clone https://github.com/YOUR_USERNAME/interactive-book-engine.git
cd interactive-book-engine
```

### Step 2: Customize Your Book

#### 2.1 Edit Book Metadata

Open `content/book.yaml` and customize:

```yaml
title: "Your Book Title"
chapters:
  - chapter_1
  - chapter_2
  # Add more chapters as needed

arcs:
  your_arc_name:
    pacing:
      frameDelay: 500
      suspense: "low"
    visuals:
      tone: "mysterious"
```

#### 2.2 Create or Edit Chapters

Each chapter is defined in `content/chapters/`. For example, `content/chapters/chapter_1.yaml`:

```yaml
id: chapter_1
title: "Chapter 1: The Beginning"
arc: your_arc_name
nodes:
  - node_1_1
  - node_1_2
  # Add more nodes as needed
context:
  location: "your_location"
  time: "day"
```

#### 2.3 Create Story Nodes

Each node is defined in `content/nodes/`. For example, `content/nodes/node_1_1.yaml`:

```yaml
id: node_1_1
content:
  - type: text
    value: "Your story text here..."
  - type: pause
    duration: 1000
  - type: image
    src: "images/your-image.jpg"
choices:
  - text: "Choice 1"
    goto: node_1_2
  - text: "Choice 2"
    goto: node_1_3
```

#### 2.4 Add Images (Optional)

1. Create an `images` folder in the `content` directory
2. Add your images to `content/images/`
3. Reference them in your node YAML files using relative paths

### Step 3: Test Locally

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser to test your book.

### Step 4: Deploy to GitHub Pages

#### 4.1 Push Your Changes

```bash
# Add all changes
git add .

# Commit changes
git commit -m "Customize my interactive book"

# Push to GitHub
git push origin main
```

#### 4.2 Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Click on "Pages" in the left sidebar
4. Under "Build and deployment", set:
   - **Source**: GitHub Actions
5. GitHub will automatically detect the workflow file and deploy your site

#### 4.3 Access Your Book

After a few minutes, your book will be available at:
```
https://YOUR_USERNAME.github.io/interactive-book-engine/
```

### Step 5: Customize Domain (Optional)

If you want to use a custom domain:

1. In GitHub Pages settings, click "Custom domain"
2. Enter your domain (e.g., `your-book.com`)
3. Configure DNS settings as instructed by GitHub
4. Wait for DNS propagation

### Content Tips

#### Story Structure

- **Nodes**: Individual story segments with text, images, and choices
- **Chapters**: Collections of nodes that form a complete narrative arc
- **Arcs**: Narrative themes that affect pacing and visuals

#### Conditional Choices

Make choices appear based on player actions:

```yaml
choices:
  - text: "Advanced option"
    goto: secret_node
    require:
      all:
        - var: "wisdom"
          op: ">="
          value: 10
        - flag: "found_key"
          equals: true
```

#### State Variables

Track player progress:

```yaml
# In node content
- type: text
  value: "You gained experience."
# Set variable in your node logic (requires custom engine modification)
```

### Troubleshooting

#### Build Fails

- Check that all YAML files are properly formatted
- Ensure all node IDs referenced in `goto:` fields exist
- Run `npm run build` locally to see detailed error messages

#### Images Not Loading

- Ensure images are in the `content/images/` folder
- Check that file paths in YAML files are correct
- Verify image file names match exactly (case-sensitive)

#### GitHub Pages Not Updating

- Wait 5-10 minutes after pushing changes
- Check the "Actions" tab to see if the workflow is running
- Ensure the workflow file exists in `.github/workflows/deploy.yml`

### Advanced Customization

#### Modify Styling

Edit `src/styles.css` to change colors, fonts, and layout:

```css
/* Example: Change theme color */
:root {
  --primary-color: #your-color;
}
```

#### Add Custom Features

The engine is modular. Add new features by:
1. Creating new modules in `src/core/` or `src/engine/`
2. Updating `src/types/index.ts` with new types
3. Integrating with `src/app.ts`

### Content Organization Best Practices

- **Naming Convention**: Use descriptive IDs like `chapter_1_forest`, `node_meeting_king`
- **File Structure**: Group related nodes in subdirectories (e.g., `nodes/forest/`, `nodes/castle/`)
- **Version Control**: Commit frequently with descriptive messages
- **Testing**: Test each branch of your story before publishing

### Example: Minimal Book Setup

To create a simple 2-choice book:

1. Edit `content/book.yaml`:
   ```yaml
   title: "My First Book"
   chapters:
     - chapter_1
   ```

2. Create `content/chapters/chapter_1.yaml`:
   ```yaml
   id: chapter_1
   title: "Chapter 1"
   nodes:
     - start
   ```

3. Create `content/nodes/start.yaml`:
   ```yaml
   id: start
   content:
     - type: text
       value: "Welcome to my book!"
   choices:
     - text: "Continue"
       goto: end
   ```

4. Create `content/nodes/end.yaml`:
   ```yaml
   id: end
   content:
     - type: text
       value: "The end!"
   choices: []
   ```

5. Test with `npm run dev` and deploy to GitHub Pages.

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
