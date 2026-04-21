## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you would like to change.

### Local setup

```bash
git clone <repo-url>
cd primetrade-task

# Backend
cd backend && cp .env.example .env
npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

### Code style
- Use `const`/`let`, avoid `var`
- Async/await over raw promises
- Keep controllers thin — business logic belongs in services (future)
- Validate all inputs at the route layer with express-validator

### Branch naming
- `feat/feature-name`
- `fix/bug-description`
- `chore/task-description`
