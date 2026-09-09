# Tražilica Spremljenih Stvari 📦

Aplikacija za jednostavno spremanje, organizaciju i brzo pronalaženje stvari po prostorijama, kutijama i policama (Garaža, Tavan, Podrum, Ostava, itd.).

---

## 🚀 Postavljanje na GitHub Pages (Online pristup preko linka)

Aplikacija je već u potpunosti pripremljena za **GitHub Pages**:
- U `vite.config.ts` je postavljen `base: './'` (svi asseti rade na bilo kojem GitHub poddirektoriju `username.github.io/repo/`).
- Pripremljen je automatski GitHub Actions workflow (`.github/workflows/deploy.yml`).

### Opcija 1: Automatski preko GitHub Actions (Preporučeno)

1. Ako ste eksportirali projekt na GitHub (ili napravili novi GitHub repozitorij):
   ```bash
   git remote add origin https://github.com/<vaš-github-korisnik>/<naziv-repozitorija>.git
   git branch -M main
   git push -u origin main
   ```
2. Na GitHubu otvorite svoj repozitorij i idite na:
   - **Settings** -> **Pages** (u lijevom izborniku)
   - Pod **Source** (Build and deployment) odaberite: **GitHub Actions**
3. Čim pushate na granu `main`, GitHub Actions će automatski prevesti (`npm run build`) i objaviti stranicu.
4. Vaša web aplikacija bit će dostupna na:
   `https://<vaš-github-korisnik>.github.io/<naziv-repozitorija>/`

---

### Opcija 2: Preko skripte `gh-pages`

Možete objaviti aplikaciju i direktno iz terminala:
```bash
npm run deploy
```
Ova skripta automatski pokreće `npm run build` i šalje gotov `dist` na `gh-pages` granu vašeg GitHub repozitorija.
U GitHub postavkama (**Settings -> Pages**) tada odaberite granu `gh-pages` i mapu `/ (root)`.

---

## 💻 Lokalno pokretanje

```bash
npm install
npm run dev
```

Aplikacija će biti dostupna na [http://localhost:3000](http://localhost:3000).
