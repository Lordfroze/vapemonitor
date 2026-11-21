# Issue: Fitur Autentikasi dan Manajemen User

## Deskripsi
Menambahkan sistem autentikasi ke aplikasi Vape Monitor dengan dukungan role-based access control (RBAC) untuk membedakan akses antara **User** dan **Admin**.

---

## Requirements

### 1. Database Schema - Tabel Users
Tambahkan tabel `users` ke schema Drizzle (`src/db/schema.ts`):

```typescript
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('user'), // 'user' | 'admin'
  avatarUrl: varchar('avatar_url', { length: 500 }),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  roleIdx: index('users_role_idx').on(table.role),
}));
```

### 2. Relasi dengan Data Existing
- `cartridgeLogs` dan `liquidLogs` perlu dikaitkan dengan `userId` (foreign key ke `users.id`)
- User hanya bisa melihat/kelola data miliknya sendiri
- Admin bisa melihat/kelola data semua user

### 3. Authentication Flow
- **Login**: Email + Password (bcrypt hash)
- **Session**: JWT token dalam HttpOnly cookie (secure, sameSite: 'lax')
- **Logout**: Hapus cookie, invalidate session
- **Register**: Hanya untuk user pertama (self-register) atau via admin invitation

### 4. Role Definitions

| Role | Akses |
|------|-------|
| **User** | - Dashboard pribadi<br>- CRUD cartridge & liquid milik sendiri<br>- Riwayat pribadi<br>- Pengaturan profil sendiri |
| **Admin** | - Semua akses User<br>- **Menu Admin: Manajemen User** (lihat, tambah, edit, hapus, nonaktifkan user)<br>- Lihat dashboard semua user<br>- Export data semua user<br>- Pengaturan sistem |

### 5. Menu Admin - Manajemen User
Halaman `/admin/users` (hanya akses admin):
- Tabel daftar user dengan kolom: Nama, Email, Role, Status (Aktif/Nonaktif), Terakhir Login, Aksi
- Fitur:
  - **Tambah User**: Form email, nama, password awal, role (user/admin)
  - **Edit User**: Ubah nama, email, role, status aktif
  - **Reset Password**: Generate password baru & kirim via email (atau tampilkan sekali)
  - **Nonaktifkan/Aktifkan**: Toggle `isActive`
  - **Hapus User**: Soft delete (set isActive=false) atau hard delete dengan konfirmasi
  - **Paginasi & Search**: Cari by nama/email, filter by role/status
  - **Export CSV**: Export daftar user

### 6. UI/UX Requirements
- **Login Page**: `/login` - Clean, minimal, consistent dengan design system
- **Protected Routes**: Middleware untuk redirect ke `/login` jika unauthenticated
- **Role-based Navigation**: Admin melihat menu "Admin" di navigation
- **User Avatar/Menu**: Dropdown di header dengan nama, role, logout, link ke profil
- **Loading/Empty/Error States**: Semua halaman admin & auth

### 7. Security
- Password hashing: bcrypt (cost factor 12)
- JWT secret di environment variable
- Rate limiting pada endpoint login (max 5 attempts per 15 min per IP)
- CSRF protection untuk form mutasi
- Secure headers (helmet/next.js defaults)
- Audit log untuk aksi admin (opsional, phase 2)

---

## Implementation Plan

### Phase 1: Foundation
- [ ] Update `schema.ts` - tambah tabel `users`, relasi ke logs
- [ ] Drizzle migration generate & push
- [ ] Auth utilities: hash, verify, JWT sign/verify, cookie helpers
- [ ] Middleware auth protection

### Phase 2: Auth Pages & API
- [ ] API routes: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- [ ] Login page `/login` dengan form validation (zod + react-hook-form)
- [ ] Register flow (initial admin setup)

### Phase 3: Role-based Access
- [ ] Update Navigation - tambah user menu, admin menu conditional
- [ ] Protect existing pages dengan middleware
- [ ] Update queries/actions untuk filter by userId (non-admin)

### Phase 4: Admin Panel
- [ ] Layout admin (`/admin/*`)
- [ ] User management page dengan tabel, modal forms
- [ ] API routes untuk CRUD user (admin only)
- [ ] Search, filter, paginasi, export

### Phase 5: Polish
- [ ] Toast notifications untuk aksi auth & admin
- [ ] Loading skeletons
- [ ] Responsive design
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Tests (unit + e2e)

---

## Technical Notes

### Environment Variables (`.env`)
```env
# Auth
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_COOKIE_NAME="vape-monitor-session"
BCRYPT_COST=12

# Database (existing)
DATABASE_URL="postgresql://..."
```

### Dependencies to Add
```bash
npm install bcryptjs jose zod @hookform/resolvers
npm install -D @types/bcryptjs
```

### File Structure Additions
```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   └── ...existing pages
│   └── admin/
│       ├── layout.tsx
│       └── users/page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── UserMenu.tsx
│   └── admin/
│       ├── UserTable.tsx
│       ├── UserFormModal.tsx
│       └── UserFilters.tsx
├── lib/
│   ├── auth/
│   │   ├── session.ts
│   │   ├── password.ts
│   │   └── middleware.ts
│   └── db/
│       └── queries/
│           ├── users.ts
│           └── admin.ts
├── actions/
│   ├── auth.ts
│   └── admin.ts
└── middleware.ts
```

---

## Acceptance Criteria

1. ✅ User bisa login dengan email & password
2. ✅ Session persist setelah refresh browser
3. ✅ User hanya melihat data miliknya sendiri
4. ✅ Admin bisa akses `/admin/users`
5. ✅ Admin bisa CRUD user (tambah, edit, hapus, toggle active)
6. ✅ Navigation menampilkan menu sesuai role
7. ✅ Logout berfungsi & redirect ke login
8. ✅ Middleware redirect unauthenticated user ke `/login`
9. ✅ Responsive di mobile & desktop
10. ✅ TypeScript strict mode pass, zero ESLint errors

---

## Priority
**High** - Core feature untuk multi-user support

## Estimated Effort
- Phase 1-2: ~2-3 hari
- Phase 3: ~1-2 hari
- Phase 4: ~2-3 hari
- Phase 5: ~1-2 hari
- **Total: ~6-10 hari kerja**

---

## Related Files
- `src/db/schema.ts` - Schema database
- `src/middleware.ts` - Auth middleware (baru)
- `src/lib/auth/*` - Auth utilities (baru)
- `src/app/(auth)/login/page.tsx` - Login page (baru)
- `src/app/admin/users/page.tsx` - Admin user management (baru)
- `src/components/layout/Navigation.tsx` - Update untuk user menu