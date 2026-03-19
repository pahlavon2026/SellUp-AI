---
description: Git Branch bilan ishlash - Vibe Coding uchun xavfsiz ishlab chiqish qoidalari
---

# 🔀 Git Branching Workflow — Vibe Coding Qoidalari

## Asosiy Tamoyil
> **"Main" branch — bu sizning ilovangizning ishlaydigan "Oltin Nusxasi". Unga to'g'ridan-to'g'ri o'zgartirish kiritmang!**

---

## 1. 🆕 Yangi Ish Boshlash (Branch Yaratish)

Har qanday yangilik uchun yangi branch oching:

```bash
# Avval main branch'da ekanligingizni tekshiring
git checkout main
git pull origin main

# Yangi branch yarating
git checkout -b <branch-nomi>
```

### Branch Nomlash Qoidalari:
| Ish turi | Namuna |
|----------|--------|
| Yangi funksiya | `feature/yangi-dizayn` |
| Xato to'g'irlash | `fix/login-xatosi` |
| Eksperiment | `experiment/ai-chatbot` |
| UI o'zgartirish | `ui/dark-mode` |

---

## 2. 🧪 Branch'da Ishlash va Commit Qilish

```bash
# O'zgarishlarni saqlang (commit)
git add .
git commit -m "Tavsiflovchi xabar: nima qildingiz"

# Masalan:
git commit -m "feat: yangi dashboard dizayni qo'shildi"
git commit -m "fix: login sahifasidagi xato to'g'irlandi"
```

### Commit Xabar Formatlari:
- `feat:` — Yangi funksiya
- `fix:` — Xato to'g'irlash
- `ui:` — Dizayn o'zgarishi
- `refactor:` — Kodni qayta yozish
- `docs:` — Hujjat o'zgarishi

---

## 3. ✅ Muvaffaqiyat? — Merge Qiling!

Agar hammasi zo'r ishlasa:

```bash
# 1. Main'ga qayting
git checkout main

# 2. Main'ni yangilang
git pull origin main

# 3. Yangi branch'ni merge qiling
git merge <branch-nomi>

# 4. GitHub'ga push qiling
git push origin main

# 5. Eski branch'ni o'chiring (ixtiyoriy)
git branch -d <branch-nomi>
```

---

## 4. ❌ Muvaffaqiyatsizlik? — Branch'ni O'chiring!

Agar yangi g'oya ishlamasa yoki AI boshi berk ko'chaga kirsa:

```bash
# 1. Main'ga qayting (o'zgarishlarni saqlamasdan)
git checkout main

# 2. Branch'ni majburiy o'chiring
git branch -D <branch-nomi>
```

> ⚠️ `-D` (katta harf) — merge qilinmagan branch'ni ham o'chiradi
> `-d` (kichik harf) — faqat merge qilingan branch'ni o'chiradi

---

## 5. 📋 Foydali Buyruqlar

```bash
# Barcha branch'larni ko'rish
git branch -a

# Qaysi branch'da ekanligingizni bilish
git branch --show-current

# Branch'lar o'rtasida o'tish
git checkout <branch-nomi>

# O'zgarishlarni vaqtincha saqlash (stash)
git stash
git stash pop

# Oxirgi commit'ni bekor qilish (fayllarni saqlab)
git reset --soft HEAD~1
```

---

## 6. 🔄 Amaliy Misol

```
Main (Oltin Nusxa) ────●────●────●────●────●──── (har doim ishlaydi)
                        │                   ▲
                        │                   │ merge
                        ▼                   │
Feature Branch    ────●────●────●────●──────┘ (muvaffaqiyatli)

Main ────●────●────●──── (buzilmagan)
                   │
                   ▼
Experiment   ────●────●────✗ (muvaffaqiyatsiz, o'chirildi)
```

---

## 7. 🛡️ Xavfsizlik Qoidalari

1. **Hech qachon** `main` branch'da to'g'ridan-to'g'ri kod yozmang
2. **Har doim** yangi ish uchun yangi branch oching
3. **Merge qilishdan oldin** ilovani to'liq sinovdan o'tkazing
4. **Commit xabarlarini** aniq va tushunarli yozing
5. **Merge qilgandan keyin** eski branch'larni tozalab tashlang
