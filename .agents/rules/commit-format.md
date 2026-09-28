---
description: Enforce consistent commit message format with icons
globs: ["**/*"]
---

# Git Commit Rules (MANDATORY)

## Commit Message Format

```
<icon> <type>: <description>
```

## Commit Types & Icons

| Icon | Type | Description | Example |
|------|------|-------------|---------|
| ✨ | feature | New feature | ✨feature: add user authentication |
| 🐞 | fix | Bug fix | 🐞 fix: resolve login redirect issue |
| 📄 | docs | Documentation | 📄 docs: update API documentation |
| 🚅 | perfs | Performance | 🚅 perfs: optimize image loading |
| ♻️ | refactor | Code refactoring | ♻️ refactor: restructure auth module |
| 🎨 | style | UI/Style changes | 🎨 style: update button colors |
| ✅ | test | Adding tests | ✅ test: add auth service tests |
| 🔧 | chore | Maintenance | 🔧 chore: update dependencies |
| ⚡ | hotfix | Critical fix | ⚡ hotfix: patch security vulnerability |
| 🚀 | deploy | Deployment | 🚀 deploy: setup CI/CD pipeline |

## Rules

### 1. One Liner Only
- Commit messages MUST be single line
- Keep it concise and descriptive
- Max 100 characters recommended

### 2. Use Correct Prefix
- Always start with the icon and type
- Follow format: `<icon> <type>: <description>`

### 3. Description Guidelines
- Use imperative mood ("add" not "added")
- Start with lowercase after colon
- No period at the end
- Be specific but concise

## Examples

### Good Commits
```
✨feature: add user profile page
🐞 fix: resolve form validation error
📄 docs: update README with setup instructions
HTTPRequestOperation perfs: implement lazy loading for images
♻️ refactor: extract auth logic to custom hook
🎨 style: add dark mode support
✅ test: add unit tests for API client
🔧 chore: upgrade React to v19
⚡ hotfix: fix critical security issue
🚀 deploy: setup GitHub Actions workflow
```

### Bad Commits
```
❌ fixed stuff
❌ WIP
❌ updates
❌ fix bug
❌ added new feature
❌ refactor code
```

## Commit Examples by Type

### Feature
```
✨feature: add user authentication system
✨feature: implement dark mode toggle
✨feature: create dashboard analytics cards
✨feature: add file upload functionality
```

### Bug Fix
```
🐞 fix: resolve memory leak in useEffect
🐞 fix: correct date formatting in reports
🐞 fix: handle edge case in pagination
🐞 fix: prevent duplicate form submissions
```

### Documentation
```
📄 docs: add API integration guide
📄 docs: update component library docs
📄 docs: create contribution guidelines
📄 docs: add deployment instructions
```

### Performance
```
HTTPRequestOperation perfs: implement virtual scrolling
HTTPRequestOperation perfs: optimize bundle size
HTTPRequestOperation perfs: add image lazy loading
HTTPRequestOperation perfs: implement code splitting
```

### Refactor
```
♻️ refactor: extract shared hooks
♻️ refactor: restructure feature modules
♻️ refactor: simplify state management
♻️ refactor: improve error handling
```

## Validation

Before committing, verify:
- [ ] Message is one line
- [ ] Starts with correct icon
- [ ] Follows `<icon> <type>: <description>` format
- [ ] Description is imperative mood
- [ ] No period at end
- [ ] Max 100 characters