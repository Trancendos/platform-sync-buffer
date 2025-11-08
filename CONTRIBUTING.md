# Contributing to Platform Sync Buffer

Thank you for your interest in contributing!

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/platform-sync-buffer.git
   cd platform-sync-buffer
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create `.env` file (see `.env.example`)
5. Run in development mode:
   ```bash
   npm run dev
   ```

## Code Style

- TypeScript strict mode enabled
- ESLint for linting
- Prettier for formatting
- Follow existing patterns

## Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Run tests:
   ```bash
   npm test
   npm run lint
   ```

4. Commit with conventional commits:
   ```bash
   git commit -m "feat: add new sync rule for labels"
   ```

   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

5. Push and create PR:
   ```bash
   git push origin feature/your-feature-name
   ```

## Testing

- Write tests for new features
- Maintain >70% code coverage
- Test webhook handlers thoroughly
- Include integration tests

## Documentation

- Update README.md if adding features
- Add API documentation for new endpoints
- Include examples in docs/
- Update CHANGELOG.md

## Pull Request Process

1. Update documentation
2. Add tests
3. Ensure CI passes
4. Request review
5. Address feedback
6. Squash commits if requested

## Questions?

Open an issue or contact: victicnor@gmail.com
