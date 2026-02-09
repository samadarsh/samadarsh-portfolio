---
description: How to commit changes to GitHub
---

# How to Commit Changes to GitHub

This workflow explains how to commit your changes to GitHub step by step.

## Prerequisites
- Git must be installed on your system
- You must have a GitHub repository set up
- You must be in your project directory

## Steps

### 1. Check the status of your changes
```bash
git status
```
This shows you which files have been modified, added, or deleted.

### 2. Stage your changes
To stage a specific file:
```bash
git add <filename>
```

To stage all changes:
```bash
git add .
```

Examples:
- `git add index.html` - stages only index.html
- `git add style.css main.js` - stages multiple specific files
- `git add .` - stages all modified files

### 3. Commit your changes
```bash
git commit -m "Your commit message here"
```

**Tips for good commit messages:**
- Be clear and descriptive
- Use present tense ("Add feature" not "Added feature")
- Keep it concise but meaningful
- Examples:
  - `git commit -m "Add contact form to homepage"`
  - `git commit -m "Fix navigation menu on mobile devices"`
  - `git commit -m "Update project descriptions"`

### 4. Push your changes to GitHub
```bash
git push
```

If this is your first push or you're pushing a new branch:
```bash
git push -u origin main
```
(Replace `main` with your branch name if different)

## Common Scenarios

### Undo changes before committing
If you want to discard changes to a file:
```bash
git restore <filename>
```

### View commit history
```bash
git log
```

### Create a new branch
```bash
git checkout -b new-branch-name
```

### Switch between branches
```bash
git checkout branch-name
```

## Quick Reference
```bash
# Complete workflow in one go:
git status                                    # Check what changed
git add .                                     # Stage all changes
git commit -m "Descriptive message"          # Commit with message
git push                                      # Push to GitHub
```

## Troubleshooting

**If push is rejected:**
```bash
git pull                                      # Pull latest changes
git push                                      # Try pushing again
```

**If you have merge conflicts after pulling:**
1. Open the conflicted files
2. Resolve the conflicts (look for `<<<<<<<`, `=======`, `>>>>>>>` markers)
3. Stage the resolved files: `git add <filename>`
4. Commit: `git commit -m "Resolve merge conflicts"`
5. Push: `git push`
