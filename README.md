# Flicky Electron Vue

A modern desktop application built with Vue.js and Electron.

## Features

- 🚀 **Fast & Lightweight** - Built with Vue.js for optimal performance
- 🖥️ **Cross Platform** - Runs on Windows, macOS, and Linux
- 🎨 **Modern UI** - Beautiful and responsive design
- 🔧 **Easy to Customize** - Modular architecture for easy development
- ⚙️ **Settings Management** - Database, AWS S3, and general configuration
- 📊 **Dashboard** - Real-time metrics and monitoring

## Tech Stack

- **Frontend**: Vue.js 3
- **Desktop Runtime**: Electron 28
- **Build Tool**: Vite
- **Styling**: Modern CSS with Glassmorphism effects
- **Database**: MariaDB/MySQL support
- **Cloud Storage**: AWS S3 integration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd flicky-electron-vue
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run electron-dev
```

### Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run electron` - Run Electron app (requires built files)
- `npm run electron-dev` - Start development with Electron
- `npm run electron-watch` - Start development with hot reload
- `npm run electron-pack` - Build and package the app
- `npm run dist` - Create distributable packages

## Project Structure

```
flicky-electron-vue/
├── src/
│   ├── components/
│   │   ├── Header.vue
│   │   ├── Sidebar.vue
│   │   ├── MainContent.vue
│   │   └── Settings.vue
│   ├── services/
│   │   ├── configService.js
│   │   ├── databaseService.js
│   │   ├── queryService.js
│   │   └── tableService.js
│   ├── utils/
│   │   └── logger.js
│   ├── App.vue
│   └── main.js
├── electron/
│   ├── main.js
│   └── preload.js
├── index.html
├── vite.config.mjs
├── package.json
└── README.md
```

## Configuration

The app includes comprehensive settings for:

### Database Configuration

- MariaDB/MySQL connection settings
- Connection testing functionality

### AWS S3 Configuration

- Access keys and region settings
- Bucket configuration for file uploads

### General Settings

- Target folder selection
- Log level configuration

## Development

### Adding New Components

1. Create a new `.vue` file in the `src/components/` directory
2. Import and use it in your desired parent component
3. Follow Vue.js 3 Composition API or Options API patterns

### Styling

The app uses a glassmorphism design with:

- Backdrop blur effects
- Semi-transparent backgrounds
- Smooth transitions and animations
- Responsive grid layouts

### Electron Integration

The app communicates with Electron through the `window.electronAPI` interface, providing:

- File system access
- Native dialog boxes
- Configuration management
- Database operations

## Building for Production

1. Build the Vue.js app:

```bash
npm run build
```

2. Package with Electron:

```bash
npm run electron-pack
```

The built application will be available in the `dist-electron/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
