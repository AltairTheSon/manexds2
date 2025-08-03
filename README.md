# Figma Design System Generator

A modern Angular application that converts Figma design systems into coded Angular components with support for Arabic RTL layouts.

## Features

- 🔗 **Figma API Integration**: Connect to Figma files using access tokens
- 🎨 **Design Token Extraction**: Automatically extract colors, typography, spacing, and shadows
- 🧩 **Component Generation**: Generate Angular components from Figma components
- 🌐 **RTL Support**: Full support for Arabic and RTL layouts
- 📊 **Statistics Dashboard**: Track component usage and design system health
- 🔄 **Sync Capabilities**: Keep components in sync with Figma changes
- 📱 **Responsive Design**: Modern, mobile-friendly interface
- 🚀 **Netlify Ready**: Optimized for deployment on Netlify

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Angular CLI 17+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd figma-design-system-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:4200`

## Usage

### 1. Connect to Figma

1. Get your Figma Access Token from [Figma Account Settings](https://www.figma.com/developers/api#access-tokens)
2. Enter your access token in the application
3. Add your Figma file IDs (you can add multiple files)
4. Test the connection

### 2. Extract Design System

1. Click "Extract Design System" to analyze your Figma files
2. Review extracted components and design tokens
3. Organize components by category
4. Configure generation options

### 3. Generate Components

1. Select components to generate
2. Choose output format (Angular components)
3. Configure styling preferences (SCSS)
4. Generate and download the code

### 4. Sync Changes

1. Enable auto-sync to monitor Figma changes
2. Review changes and update components
3. Regenerate components with latest changes

## Project Structure

```
src/
├── app/
│   ├── components/          # Angular components
│   │   ├── dashboard/       # Main dashboard
│   │   ├── figma-connection/ # Figma API connection
│   │   ├── component-generator/ # Component generation
│   │   ├── design-tokens/   # Design tokens management
│   │   ├── stats/          # Statistics dashboard
│   │   └── sync/           # Sync functionality
│   ├── services/           # Angular services
│   │   ├── figma.service.ts
│   │   ├── design-system.service.ts
│   │   └── code-generator.service.ts
│   ├── models/             # TypeScript interfaces
│   ├── interfaces/         # API interfaces
│   └── utils/              # Utility functions
├── assets/                 # Static assets
└── environments/           # Environment configurations
```

## Configuration

### Environment Variables

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  figmaApiUrl: 'https://api.figma.com/v1',
  appName: 'Figma Design System Generator',
  version: '1.0.0'
};
```

### Figma API Setup

1. Go to [Figma Account Settings](https://www.figma.com/developers/api#access-tokens)
2. Create a new access token
3. Copy the token to use in the application

## Deployment

### Netlify Deployment

1. Build the project:
```bash
npm run build:prod
```

2. Deploy to Netlify:
   - Connect your repository to Netlify
   - Set build command: `npm run build:prod`
   - Set publish directory: `dist/figma-design-system-generator`

### Environment Variables for Production

Set these environment variables in Netlify:
- `FIGMA_API_URL`: Figma API URL
- `APP_NAME`: Application name
- `VERSION`: Application version

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run build:prod` - Build for production with optimizations
- `npm test` - Run unit tests
- `npm run lint` - Run ESLint
- `npm run e2e` - Run end-to-end tests

### Code Style

This project uses:
- ESLint for code linting
- Prettier for code formatting
- Angular Material for UI components
- SCSS for styling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the Figma API documentation

## Roadmap

- [ ] Vue.js component generation
- [ ] React component generation
- [ ] Advanced component variants
- [ ] Design system documentation generation
- [ ] Component testing templates
- [ ] Advanced sync options
- [ ] Team collaboration features