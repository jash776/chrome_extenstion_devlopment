# Contributing Guide

## Branching Strategy

This repository uses a four-tier branching model. Below is a summary of each
branch and its purpose.

| Branch    | Purpose                          | Maps to environment |
|-----------|----------------------------------|---------------------|
| `master`  | Production-ready code            | **PROD**            |
| `staging` | Pre-production mirror of PROD    | **Staging**         |
| `release` | Quality-assurance / testing      | **QA / Release**    |
| `dev`     | Active integration of features   | **Development**     |

> **Rule:** `staging` must always be identical to `master`.  
> An automated workflow resets `staging` to `master` after every push to
> `master`.

---

## Development Workflow

```
feature/* ──► dev ──cherry-pick──► release ──cherry-pick──► staging ──merge──► master
```

### 1. Create a feature branch from `dev`

```bash
git checkout dev
git pull origin dev
git checkout -b feature/<short-description>
```

Work on your feature, then open a Pull Request targeting **`dev`**.

### 2. Cherry-pick to `release` (QA)

Once a commit on `dev` has passed initial review and should be tested in QA,
cherry-pick it to a new branch off `release`:

```bash
git checkout release
git pull origin release
git checkout -b cherry-pick/<ticket-id>-to-release
git cherry-pick <commit-sha>
git push origin cherry-pick/<ticket-id>-to-release
```

Open a Pull Request targeting **`release`**.

### 3. Cherry-pick to `staging` (pre-PROD)

Once QA has signed off on a commit in `release`, cherry-pick it to a new
branch off `staging`:

```bash
git checkout staging
git pull origin staging
git checkout -b cherry-pick/<ticket-id>-to-staging
git cherry-pick <commit-sha>
git push origin cherry-pick/<ticket-id>-to-staging
```

Open a Pull Request targeting **`staging`**.

### 4. Merge `staging` → `master` (PROD)

When all cherry-picked changes in `staging` have been verified and are ready
for production, open a Pull Request from **`staging`** into **`master`**.

After the PR is merged, the automated **Sync Staging with Master** workflow
will automatically reset `staging` to match `master`, keeping them in sync.

---

## Branch Protection Rules (recommended)

Configure the following rules in **Settings → Branches** on GitHub:

| Branch    | Require PR | Required reviewers | Allowed PR source branches          |
|-----------|------------|--------------------|-------------------------------------|
| `master`  | ✅          | 2                  | `staging` only                      |
| `staging` | ✅          | 1                  | `cherry-pick/*`                     |
| `release` | ✅          | 1                  | `cherry-pick/*`                     |
| `dev`     | ✅          | 1                  | `feature/*`                         |

> **Note:** GitHub branch protection rules enforce *who* can push (users/teams).  
> The **Branch Strategy Enforcement** CI workflow (`.github/workflows/branch-strategy.yml`)
> enforces *which source branch* is allowed to open a PR against each protected branch.

---

## PR Naming Convention

| Type            | Format                              |
|-----------------|-------------------------------------|
| Feature         | `feature/<short-description>`       |
| Cherry-pick     | `cherry-pick/<ticket-id>-to-<branch>` |
| Hotfix          | `hotfix/<short-description>`        |

---

## Automated Checks

Every pull request runs:

1. **Branch Strategy Enforcement** – verifies the source branch is allowed to
   target the destination branch (see `.github/workflows/branch-strategy.yml`).
2. **CI/CD Pipeline** – lints, validates `manifest.json`, and packages the
   extension (see `.github/workflows/ci.yml`).
