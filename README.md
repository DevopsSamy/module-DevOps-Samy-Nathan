# DevOps TP — API Node.js (Express) + Tests Jest + Docker

[![CI/CD Pipeline](https://github.com/DevopsSamy/module-DevOps-Samy-Nathan/actions/workflows/ci-cd.yaml/badge.svg)](https://github.com/DevopsSamy/module-DevOps-Samy-Nathan/actions/workflows/ci-cd.yaml)

> ✅ **Healthcheck**: `/health`  
> ✅ **CRUD Tasks**: `/api/tasks`  
> ✅ **Tests**: Jest + Supertest (+ coverage)  
> ✅ **Docker**: multi-stage image (Node 20 Alpine)

---

## 👥 Membres
- Nathan TOURNANT
- Samy chebrek

---

## 🎯 Objectif du projet
Ce dépôt contient une **API REST** minimaliste en **Node.js/Express** conçue pour illustrer un workflow DevOps :
- endpoints REST + healthcheck
- tests unitaires automatisés (Jest)
- génération de couverture de code
- conteneurisation Docker

---

## 🧰 Technologies
- Node.js 20
- Express
- Jest + Supertest
- Docker

---

## 📁 Structure
- `index.js` : application Express (exporte `createApp()` pour les tests)
- `index.test.js` : tests unitaires Jest/Supertest
- `Dockerfile` : image Docker (multi-stage, dépendances de prod uniquement)
- `.dockerignore` : exclusions du build Docker
- `.github/workflows/ci.yml` : pipeline CI GitHub Actions (tests + coverage)

---

## 🚀 Lancer en local

### Installation
```bash
npm ci