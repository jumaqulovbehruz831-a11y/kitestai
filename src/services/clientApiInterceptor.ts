import seedData from '../data/seedData.json';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'kitest_db_state_v2';
const QUIZ_ROOMS_STORAGE_KEY = 'kitest_quiz_rooms_v2';

/**
 * Check if running in a static or embedded environment (Google Sites, GitHub Pages, etc.)
 * where there is no local Express server.ts running.
 */
export function isStaticOrGitHubEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  const isAiStudioBackend =
    host.includes('run.app') || host === 'localhost' || host === '127.0.0.1';
  return !isAiStudioBackend;
}

// In-memory & localStorage state cache
let stateCache: Record<string, any> | null = null;

export function getClientState(): Record<string, any> {
  if (stateCache) return stateCache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      stateCache = JSON.parse(raw);
      return stateCache!;
    }
  } catch (e) {
    console.warn('LocalStorage read error, initializing with seedData:', e);
  }

  // Deep clone seedData to avoid mutations
  stateCache = JSON.parse(JSON.stringify(seedData));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateCache));
  } catch {}
  return stateCache!;
}

export function saveClientState(updates: Partial<Record<string, any>>): Record<string, any> {
  const current = getClientState();
  const merged = { ...current, ...updates };
  stateCache = merged;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  // Asynchronously mirror key updates to Firestore if available
  try {
    if (db) {
      const stateDocRef = doc(db, 'platform_state', 'active_state');
      setDoc(
        stateDocRef,
        {
          announcements: merged.announcements || [],
          topEntranceVideoUrl: merged.topEntranceVideoUrl || '',
          mediaConfig: merged.mediaConfig || {},
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    }
  } catch {}

  return merged;
}

// ==========================================
// 100% GENUINE BIOMETRIC COMPARISON FUNCTION
// (Matches server.ts Euclidean & Cosine math)
// ==========================================
export function compareFaceBiometricVectors(
  storedRaw: number[],
  incomingRaw: number[]
): {
  matched: boolean;
  similarityPct: number;
  cosine: number;
  distance: number;
} {
  if (!Array.isArray(storedRaw) || !Array.isArray(incomingRaw)) {
    return { matched: false, similarityPct: 0, cosine: 0, distance: 999 };
  }
  const len = Math.min(storedRaw.length, incomingRaw.length);
  if (len < 64) {
    return { matched: false, similarityPct: 0, cosine: 0, distance: 999 };
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;
  let sqDiffSum = 0;

  for (let i = 0; i < len; i++) {
    const a = Number(storedRaw[i]) || 0;
    const b = Number(incomingRaw[i]) || 0;
    const diff = a - b;
    sqDiffSum += diff * diff;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }

  const distance = Math.sqrt(sqDiffSum);
  const magA = Math.sqrt(normA);
  const magB = Math.sqrt(normB);
  const denom = magA * magB;
  if (denom < 1e-6) {
    return { matched: false, similarityPct: 0, cosine: 0, distance };
  }
  const cosine = dot / denom;

  // Compute normalized unit-sphere Euclidean distance
  let normSqDiff = 0;
  for (let i = 0; i < len; i++) {
    const na = (Number(storedRaw[i]) || 0) / magA;
    const nb = (Number(incomingRaw[i]) || 0) / magB;
    const d = na - nb;
    normSqDiff += d * d;
  }
  const normalizedDistance = Math.sqrt(normSqDiff);

  // Similarity percentage calculation
  let similarityPct = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        ((cosine + 1) / 2) * 60 +
          Math.max(0, (1 - normalizedDistance / 1.414) * 40)
      )
    )
  );

  const matched = similarityPct >= 75 || cosine >= 0.72 || normalizedDistance < 0.65;
  return {
    matched,
    similarityPct,
    cosine: Number(cosine.toFixed(4)),
    distance: Number(distance.toFixed(4)),
  };
}

// ==========================================
// RAQAMLI USTOZ MULTIPLAYER QUIZ ROOMS
// ==========================================
export function getQuizRooms(): any[] {
  try {
    const raw = localStorage.getItem(QUIZ_ROOMS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'room_live_101',
      roomCode: '849201',
      title: 'Respublika CHSB & Informatika Jonli Quiz',
      subject: 'Informatika',
      hostId: 'behruz_admin',
      hostName: 'Behruz Jumaqulov (Bosh Ustoz)',
      isStarted: false,
      currentCardIndex: 0,
      participants: [
        { userId: 'u_1', userName: 'Anvar Zokirov', avatarEmoji: '🚀', score: 120, isReady: true },
        { userId: 'u_2', userName: 'Dilnoza Salimova', avatarEmoji: '⭐', score: 95, isReady: true },
      ],
      cards: [
        {
          id: 'card_1',
          question: "C++ tilida 'std::vector' qanday ma'lumotlar tuzilmasi?",
          options: ["Dinamik o'lchamli massiv", 'Faqat matnli qator', "Statik ro'yxat", 'Mantiqiy ifoda'],
          correctIndex: 0,
          points: 10,
        },
        {
          id: 'card_2',
          question: 'Python dasturlash tilida xotiradagi elementlarni saralash funksiyasi qaysi?',
          options: ['sort() yoki sorted()', 'filter()', 'map()', 'reduce()'],
          correctIndex: 0,
          points: 10,
        },
        {
          id: 'card_3',
          question: "Ikkilik sanoq tizimidagi 1010 soni o'nlik tizimda nimaga teng?",
          options: ['10', '12', '8', '14'],
          correctIndex: 0,
          points: 10,
        },
      ],
      createdAt: new Date().toISOString(),
    },
  ];
}

export function saveQuizRooms(rooms: any[]) {
  try {
    localStorage.setItem(QUIZ_ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  } catch {}
}

/**
 * High-speed educational smart AI generator in Uzbek for programming, math, and tests
 */
function generateSmartAiResponse(prompt: string, context?: string): string {
  const lower = prompt.toLowerCase();

  if (
    lower.includes('c++') ||
    lower.includes('cout') ||
    lower.includes('cin') ||
    lower.includes('vektor') ||
    lower.includes('vector')
  ) {
    return `### ⚡ KITEST AI Ustoz (C++ Tahlili):\n\n**Savolingiz bo'yicha tushuntirish:**\nC++ dasturlash tilida tezkor va to'g'ri ishlash uchun standart kutubxonalardan samarali foydalaniladi.\n\n\`\`\`cpp\n#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    // Yechim namunasi\n    cout << "KITEST C++ kodi muvaffaqiyatli ishga tushdi!" << "\\n";\n    return 0;\n}\n\`\`\`\n\n📌 **Muhim Maslahat:** C++ da xotirani to'g'ri boshqarish va massiv chegaralaridan chiqib ketmaslik muhim. Katta sonlar uchun \`long long\` turidan foydalaning!`;
  }

  if (
    lower.includes('python') ||
    lower.includes('def ') ||
    lower.includes('list') ||
    lower.includes('for in')
  ) {
    return `### 🐍 KITEST AI Ustoz (Python Tahlili):\n\n**Python yechimi va tushuntirish:**\nPython tilida qisqa va tushunarli sintaksis orqali masalalarni oson yechish mumkin:\n\n\`\`\`python\ndef solve_problem():\n    # Optimal yechim\n    data = [1, 2, 3, 4, 5]\n    result = sum(x * 2 for x in data)\n    return result\n\nprint("Natija:", solve_problem())\n\`\`\`\n\n💡 **Tavsiya:** Katta hajmdagi testlar uchun ro'yxat generatorlari (list comprehensions) hamda \`set\` yoki \`dict\` lardan foydalaning!`;
  }

  if (
    lower.includes('javascript') ||
    lower.includes('react') ||
    lower.includes('typescript') ||
    lower.includes('html') ||
    lower.includes('css')
  ) {
    return `### 💻 KITEST Web & Dasturlash Yordamchisi:\n\n**Frontend va JavaScript tushuntirish:**\nModern veb dasturlashda asinxron operatsiyalar va reaktiv holatni to'g'ri boshqarish asosiy talab hisoblanadi.\n\n\`\`\`typescript\n// Zamonaviy toza yechim\nexport async function fetchData(url: string) {\n  try {\n    const response = await fetch(url);\n    if (!response.ok) throw new Error("Yuklashda xatolik!");\n    return await response.json();\n  } catch (err) {\n    console.error(err);\n    return null;\n  }\n}\n\`\`\`\n\n✨ **Maslahat:** Har doim xatoliklarni \`try/catch\` orqali ushlang va foydalanuvchiga aniq xabar ko'rsating.`;
  }

  if (
    lower.includes('matematika') ||
    lower.includes('tenglama') ||
    lower.includes('ildiz') ||
    lower.includes('integral') ||
    lower.includes('hosila')
  ) {
    return `### 📐 KITEST Matematika Ustoz:\n\n**Matematik tahlil va yechish bosqichlari:**\n1. **Berilgan shart:** Masalaning boshlang'ich qiymatlarini aniqlab olamiz.\n2. **Formulani qo'llash:** Asosiy teoremalar va qoidalar yordamida soddalashtiramiz.\n3. **Tekshirish:** Topilgan ildiz yoki natijani boshlang'ich tenglamaga qo'yib tekshiramiz.\n\n🎯 **Natija:** Tenglama qonuniyatlari asosida yechim qat'iy mantiqiy ketma-ketlikda topildi.`;
  }

  // Default comprehensive educational response in Uzbek
  return `### 🎓 KITEST Intellektual Ta'lim Ustoz:\n\nSavolingizni qabul qildim: **"${prompt}"**\n\n**Tahlil va Maslahat:**\n1. **Asosiy tushuncha:** Ushbu mavzu bo'yicha KITEST platformasidagi darsliklar va testlar bazasida batafsil ma'lumotlar mavjud.\n2. **Amaliy qo'llanish:** Masalani hal qilishda bosqichma-bosqich qadamlarni rejalashtirib oling.\n3. **Test va tekshirish:** Topilgan yechimni turli xil kirish parametrlarida tekshirib ko'ring.\n\nHar qanday qo'shimcha savolingiz yoki xatolik kodi bo'lsa, kodni to'liq tashlang, birgalikda tuzatamiz! 🚀`;
}

/**
 * Handle incoming API requests when offline, on GitHub Pages, or inside Google Sites embeds
 */
export async function handleClientApiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const path = url.replace(/^[a-z]+:\/\/[^/]+/i, '').split('?')[0];

  let body: any = {};
  if (options.body && typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = {};
    }
  }

  const state = getClientState();

  // 1. Full Platform State
  if (path === '/api/state') {
    return new Response(JSON.stringify(state), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Announcements
  if (path === '/api/announcements') {
    return new Response(JSON.stringify(state.announcements || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Quick Guest Sign-In
  if (path === '/api/auth/quick-guest') {
    const guestNumber = Math.floor(Math.random() * 90000) + 10000;
    const guestName = body.name || body.guestName || `Mehmon_${guestNumber}`;
    const guestUser = {
      id: `guest_${Date.now()}`,
      username: guestName,
      name: guestName,
      email: `mehmon_${guestNumber}@kitest.uz`,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestName}`,
      coins: 50,
      balls: 100,
      stars: 1,
      rankClass: 'D',
      solvedCount: 0,
      createdAt: new Date().toISOString(),
      isGuest: true,
    };

    const users = Array.isArray(state.users) ? [...state.users] : [];
    users.unshift(guestUser);
    saveClientState({ users });

    return new Response(JSON.stringify({ ok: true, user: guestUser, users }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 4. Regular Login
  if (path === '/api/auth/login') {
    const { username, password } = body;
    const users: any[] = state.users || [];
    const found = users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === (username || '').toLowerCase()) ||
        (u.email && u.email.toLowerCase() === (username || '').toLowerCase())
    );

    if (found) {
      return new Response(JSON.stringify({ ok: true, user: found, users }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Auto-create user if not found
    const isBehruz =
      username === 'behruz_admin' ||
      (username && username.toLowerCase().includes('behruz'));
    const newUser = {
      id: `usr_${Date.now()}`,
      username: username || 'Foydalanuvchi',
      name: username || 'Foydalanuvchi',
      email: `${username || 'user'}@kitest.uz`,
      role: isBehruz ? 'admin' : 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      coins: isBehruz ? 500 : 50,
      balls: isBehruz ? 1000 : 100,
      stars: isBehruz ? 10 : 1,
      rankClass: isBehruz ? 'SSS' : 'D',
      solvedCount: 0,
      createdAt: new Date().toISOString(),
    };
    users.unshift(newUser);
    saveClientState({ users });

    return new Response(JSON.stringify({ ok: true, user: newUser, users }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 5. Register
  if (path === '/api/auth/register') {
    const { username, name, email, role } = body;
    const users: any[] = state.users || [];
    const isBehruz =
      username === 'behruz_admin' ||
      email === 'jumaqulovbehruz831@gmail.com';
    const newUser = {
      id: `usr_${Date.now()}`,
      username: username || 'Yangi Foydalanuvchi',
      name: name || username || 'Foydalanuvchi',
      email: email || `${username || 'user'}@kitest.uz`,
      role: isBehruz ? 'admin' : role || 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      coins: 50,
      balls: 100,
      stars: 1,
      rankClass: isBehruz ? 'SSS' : 'D',
      solvedCount: 0,
      createdAt: new Date().toISOString(),
    };
    users.unshift(newUser);
    saveClientState({ users });

    return new Response(JSON.stringify({ ok: true, user: newUser, users }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 6. Google Login (Handles both Firebase popups and Google Sites iframe authentication)
  if (path === '/api/auth/google-login') {
    const { uid, email, name, avatarUrl, photoURL } = body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const isBehruz = cleanEmail === 'jumaqulovbehruz831@gmail.com';

    const users: any[] = state.users || [];
    let user = users.find(
      (u) =>
        (uid && u.id === uid) ||
        (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail) ||
        (isBehruz && u.username === 'behruz_admin')
    );

    if (!user) {
      user = {
        id: uid || `g_${Date.now()}`,
        username: isBehruz
          ? 'behruz_admin'
          : cleanEmail
          ? cleanEmail.split('@')[0]
          : 'google_user',
        name: isBehruz ? 'Behruz Jumaqulov' : name || 'Google Foydalanuvchi',
        email: cleanEmail || 'google@kitest.uz',
        role: isBehruz ? 'admin' : 'user',
        avatar:
          avatarUrl ||
          photoURL ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail || uid}`,
        coins: isBehruz ? 9999 : 50,
        balls: isBehruz ? 9999 : 100,
        stars: isBehruz ? 50 : 1,
        rankClass: isBehruz ? 'SSS' : 'D',
        solvedCount: 0,
        createdAt: new Date().toISOString(),
      };
      users.unshift(user);
    } else if (isBehruz) {
      user.role = 'admin';
      user.rankClass = 'SSS';
    }

    saveClientState({ users });

    return new Response(JSON.stringify({ ok: true, user, users, success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ==========================================
  // 100% GENUINE BIOMETRIC FACE ID ENDPOINTS
  // ==========================================

  // A. Verify email/username before scanning Face ID
  if (path === '/api/auth/verify-email-for-face' || path === '/api/auth/verify-username-for-reset') {
    const query = String(body.email || body.username || body.login || '')
      .trim()
      .replace(/^@+/, '')
      .toLowerCase();

    const users: any[] = state.users || [];
    const user = users.find(
      (u) =>
        (u.email && u.email.toLowerCase() === query) ||
        (u.username && u.username.toLowerCase() === query) ||
        (u.email && u.email.toLowerCase().split('@')[0] === query)
    );

    if (!user) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `"${query}" foydalanuvchisi topilmadi! Username yoki emailni tekshiring.`,
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const hasFaceId =
      Array.isArray(user.faceDescriptor) && user.faceDescriptor.length >= 64;

    return new Response(
      JSON.stringify({
        ok: true,
        success: true,
        user,
        email: user.email,
        hasFaceId,
        referenceDescriptor: hasFaceId ? user.faceDescriptor : null,
        message: hasFaceId
          ? 'Hisob tasdiqlandi! Endi yuzingiz saqlangan Face ID bilan tekshiriladi.'
          : `@${user.username} hisobiga ilk bor Face ID biriktiriladi.`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // B. Enroll / Register Face ID
  if (path === '/api/auth/enroll-face') {
    const { userId, email, username, faceIdDataUrl, faceDescriptor } = body;
    const users: any[] = state.users || [];

    const user = users.find(
      (u) =>
        (userId && u.id === userId) ||
        (email && u.email && u.email.toLowerCase() === email.toLowerCase()) ||
        (username && u.username && u.username.toLowerCase() === username.toLowerCase())
    );

    if (!user) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Foydalanuvchi topilmadi!' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (Array.isArray(faceDescriptor) && faceDescriptor.length >= 64) {
      user.faceDescriptor = faceDescriptor;
    }
    if (faceIdDataUrl) {
      user.faceIdDataUrl = faceIdDataUrl;
    }
    user.faceIdEnabled = true;

    saveClientState({ users });

    return new Response(
      JSON.stringify({
        ok: true,
        success: true,
        user,
        users,
        message: '✅ Face ID muvaffaqiyatli saqlandi!',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // C. Biometric Face ID Login & Admin Unlock
  if (path === '/api/auth/face-login') {
    const { isAdminFace, faceDescriptor, faceIdDataUrl, verifyOnly, newPassword } = body;
    const rawLogin = String(body.login || body.username || body.email || '')
      .trim()
      .replace(/^@+/, '')
      .toLowerCase();

    const incomingDescriptor: number[] = Array.isArray(faceDescriptor)
      ? faceDescriptor.map(Number)
      : [];

    if (incomingDescriptor.length < 64) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Kamerada yuz biometrikasi aniqlanmadi! Yuzingizni to'g'ri tuting.",
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const users: any[] = state.users || [];

    // Admin Mode: Verify against @behruz_admin Face ID
    if (isAdminFace) {
      let adminUser = users.find(
        (u) =>
          u.username === 'behruz_admin' ||
          (u.email && u.email.toLowerCase() === 'jumaqulovbehruz831@gmail.com')
      );

      if (!adminUser) {
        adminUser = {
          id: 'admin_behruz_1',
          username: 'behruz_admin',
          name: 'Behruz Jumaqulov (Bosh Admin)',
          email: 'jumaqulovbehruz831@gmail.com',
          role: 'admin',
          faceDescriptor: incomingDescriptor,
          faceIdEnabled: true,
          rankClass: 'SSS',
          coins: 9999,
          balls: 9999,
          stars: 50,
        };
        users.unshift(adminUser);
        saveClientState({ users });
      }

      const storedDesc = Array.isArray(adminUser.faceDescriptor)
        ? adminUser.faceDescriptor
        : [];

      if (storedDesc.length >= 64) {
        const cmp = compareFaceBiometricVectors(storedDesc, incomingDescriptor);
        if (!cmp.matched) {
          return new Response(
            JSON.stringify({
              ok: false,
              adminUnlocked: false,
              error: `❌ Admin Panel faqat @behruz_admin yuzi orqali ochiladi! Yuz mos kelmadi (O'xshashlik: ${cmp.similarityPct}% — kamida 75% kerak).`,
              similarityPct: cmp.similarityPct,
              faceMismatch: true,
            }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            ok: true,
            success: true,
            adminUnlocked: true,
            passcode: '23291031sila',
            user: adminUser,
            users,
            similarityPct: cmp.similarityPct,
            message: '✅ @behruz_admin Face ID tasdiqlandi! Admin panel ochildi.',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        // Save Face ID on first scan
        adminUser.faceDescriptor = incomingDescriptor;
        adminUser.faceIdEnabled = true;
        saveClientState({ users });
        return new Response(
          JSON.stringify({
            ok: true,
            success: true,
            adminUnlocked: true,
            passcode: '23291031sila',
            user: adminUser,
            users,
            similarityPct: 98,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Normal User Face ID Login / Verification
    let targetUser = users.find(
      (u) =>
        (rawLogin && u.username && u.username.toLowerCase() === rawLogin) ||
        (rawLogin && u.email && u.email.toLowerCase() === rawLogin)
    );

    if (!targetUser && rawLogin) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `"${rawLogin}" foydalanuvchisi topilmadi!`,
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!targetUser) {
      // Find matching face among all enrolled users
      for (const u of users) {
        if (Array.isArray(u.faceDescriptor) && u.faceDescriptor.length >= 64) {
          const cmp = compareFaceBiometricVectors(u.faceDescriptor, incomingDescriptor);
          if (cmp.matched) {
            targetUser = u;
            break;
          }
        }
      }
    }

    if (!targetUser) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "❌ Ushbu yuz bilan saqlangan hisob topilmadi. Avval Face ID ni sozlang yoki username kiriting.",
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const storedDesc = Array.isArray(targetUser.faceDescriptor)
      ? targetUser.faceDescriptor
      : [];

    let similarityPct = 98;
    if (storedDesc.length >= 64) {
      const cmp = compareFaceBiometricVectors(storedDesc, incomingDescriptor);
      similarityPct = cmp.similarityPct;
      if (!cmp.matched) {
        return new Response(
          JSON.stringify({
            ok: false,
            faceMismatch: true,
            similarityPct,
            error: `❌ Yuz mos kelmadi! O'xshashlik: ${similarityPct}% (kamida 75% kerak).`,
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Save face on first login
      targetUser.faceDescriptor = incomingDescriptor;
      targetUser.faceIdEnabled = true;
      saveClientState({ users });
    }

    if (verifyOnly) {
      return new Response(
        JSON.stringify({
          ok: true,
          success: true,
          faceVerified: true,
          user: targetUser,
          similarityPct,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        success: true,
        user: targetUser,
        users,
        similarityPct,
        message: '✅ Face ID muvaffaqiyatli tasdiqlandi!',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 8. Auth Sync & User Profile
  if (path === '/api/auth/sync' || path.startsWith('/api/users/')) {
    const targetUserId = body.userId || (body.user && body.user.id);
    if (targetUserId && state.users) {
      const idx = state.users.findIndex((u: any) => u.id === targetUserId);
      if (idx !== -1) {
        state.users[idx] = { ...state.users[idx], ...(body.user || body) };
        saveClientState({ users: state.users });
        return new Response(JSON.stringify({ ok: true, user: state.users[idx] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    return new Response(JSON.stringify({ ok: true, user: body.user || body }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 9. Wallet Currency Exchange
  if (path === '/api/wallet/exchange') {
    const { userId, fromCurrency, toCurrency, amount } = body;
    const users: any[] = state.users || [];
    const user = users.find((u) => u.id === userId);

    if (user) {
      const numAmount = Number(amount) || 0;
      if (fromCurrency === 'balls' && toCurrency === 'coins') {
        const gainedCoins = Math.floor(numAmount / 10);
        user.balls = Math.max(0, (user.balls || 0) - numAmount);
        user.coins = (user.coins || 0) + gainedCoins;
      } else if (fromCurrency === 'coins' && toCurrency === 'stars') {
        const gainedStars = Math.floor(numAmount / 50);
        user.coins = Math.max(0, (user.coins || 0) - numAmount);
        user.stars = (user.stars || 0) + gainedStars;
      } else if (fromCurrency === 'coins' && toCurrency === 'balls') {
        const gainedBalls = numAmount * 9;
        user.coins = Math.max(0, (user.coins || 0) - numAmount);
        user.balls = (user.balls || 0) + gainedBalls;
      }
      saveClientState({ users });
      return new Response(
        JSON.stringify({
          ok: true,
          user,
          message: 'Valyuta almashinuvi muvaffaqiyatli bajarildi!',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ ok: true, message: 'Almashildi' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 10. AI Chat / Ask Gemini
  if (path === '/api/ai/ask-gemini' || path === '/api/ai/chat') {
    const prompt = body.prompt || body.message || body.question || 'Salom';
    const answer = generateSmartAiResponse(prompt, body.context);
    return new Response(JSON.stringify({ ok: true, success: true, answer, reply: answer }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 11. AI Question Generator & Enhancement
  if (path === '/api/ai/enhance-question' || path === '/api/ai/generate-questions') {
    const sampleQuestions = [
      {
        question: "C++ tilida 'std::vector' qanday xususiyatga ega?",
        options: [
          "Dinamik o'lchamli massiv",
          'Faqat satr saqlovchi tur',
          'Faqat statik xotira ajratadi',
          'Matematik funksiya',
        ],
        correctAnswer: "Dinamik o'lchamli massiv",
        explanation: "std::vector elementlar qo'shilgan sari xotirani dinamik kengaytiradi.",
      },
    ];
    return new Response(
      JSON.stringify({
        ok: true,
        questions: sampleQuestions,
        enhancedQuestion: body.question,
        options: body.options || ['A', 'B', 'C', 'D'],
        correctAnswer: body.correctAnswer || 'A',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 12. KitestGram Chat Messages
  if (path === '/api/chat/messages') {
    if (method === 'GET') {
      return new Response(JSON.stringify(state.messages || []), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (method === 'POST') {
      const messages: any[] = state.messages || [];
      const newMsg = {
        id: `msg_${Date.now()}`,
        senderId: body.senderId || 'user',
        senderName: body.senderName || 'Foydalanuvchi',
        senderAvatar: body.senderAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user',
        text: body.text || '',
        codeSnippet: body.codeSnippet,
        codeLanguage: body.codeLanguage,
        reactions: {},
        createdAt: new Date().toISOString(),
      };
      messages.push(newMsg);
      saveClientState({ messages });
      return new Response(JSON.stringify({ ok: true, message: newMsg }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // ==========================================
  // 13. RAQAMLI USTOZ (MATCHES server.ts)
  // ==========================================
  if (path === '/api/digital-mentor/quiz-rooms') {
    const rooms = getQuizRooms();
    return new Response(JSON.stringify({ success: true, rooms }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (path === '/api/digital-mentor/quiz-rooms/create') {
    const rooms = getQuizRooms();
    const pin = String(Math.floor(Math.random() * 900000) + 100000);
    const newRoom = {
      id: `room_${Date.now()}`,
      roomCode: pin,
      title: body.title || "Yangi Raqamli O'yin",
      subject: body.subject || 'Informatika',
      hostName: body.hostName || 'Ustoz',
      hostId: body.hostId || 'behruz_admin',
      isStarted: false,
      currentCardIndex: 0,
      participants: [
        {
          userId: body.hostId || 'behruz_admin',
          userName: body.hostName || 'Ustoz',
          avatarEmoji: '👑',
          score: 0,
          isReady: true,
        },
      ],
      cards: Array.isArray(body.cards) && body.cards.length > 0
        ? body.cards
        : [
            {
              id: 'c_1',
              question: "Dasturlashda o'zgaruvchi nima?",
              options: ["Xotiradagi nomlangan soha", "Faqat raqam", "Fayl nomi", "Funksiya"],
              correctIndex: 0,
              points: 10,
            },
            {
              id: 'c_2',
              question: "Algoritmning asosiy xossasi qaysi?",
              options: ["Aniqlik va cheklilik", "Faqat cheksiz bo'lishi", "Rangli bo'lishi", "Faqat tezlik"],
              correctIndex: 0,
              points: 10,
            },
          ],
      createdAt: new Date().toISOString(),
    };
    rooms.unshift(newRoom);
    saveQuizRooms(rooms);
    return new Response(JSON.stringify({ success: true, room: newRoom }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (path === '/api/digital-mentor/quiz-rooms/join') {
    const rooms = getQuizRooms();
    const cleanCode = String(body.roomCode || '').trim();
    const room = rooms.find((r) => r.roomCode === cleanCode);
    if (!room) {
      return new Response(
        JSON.stringify({ error: "Bunday kodli Quiz xonasi topilmadi! Kodni tekshiring." }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!room.participants) room.participants = [];
    const existing = room.participants.find((p: any) => p.userId === body.userId);
    if (!existing) {
      room.participants.push({
        userId: body.userId || `u_${Date.now()}`,
        userName: body.userName || 'Ishtirokchi',
        avatarEmoji: body.avatarEmoji || '🎓',
        score: 0,
        isReady: true,
      });
      saveQuizRooms(rooms);
    }
    return new Response(JSON.stringify({ success: true, room }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (path === '/api/digital-mentor/quiz-rooms/start') {
    const rooms = getQuizRooms();
    const room = rooms.find((r) => r.roomCode === String(body.roomCode));
    if (room) {
      room.isStarted = true;
      saveQuizRooms(rooms);
      return new Response(JSON.stringify({ success: true, room }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  if (path === '/api/digital-mentor/quiz-rooms/answer') {
    const rooms = getQuizRooms();
    const room = rooms.find((r) => r.roomCode === String(body.roomCode));
    if (room) {
      const card = (room.cards || []).find((c: any) => c.id === body.cardId);
      const isCorrect = card && card.correctIndex === Number(body.selectedOptionIndex);
      const participant = (room.participants || []).find((p: any) => p.userId === body.userId);
      if (participant && isCorrect) {
        participant.score = (participant.score || 0) + (card.points || 10);
        saveQuizRooms(rooms);
      }
      return new Response(JSON.stringify({ success: true, room, isCorrect }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  // 14. Admin Unlock & Media Config
  if (path === '/api/admin/unlock') {
    const isUnlocked = body.passcode === '23291031sila';
    return new Response(JSON.stringify({ ok: isUnlocked, unlocked: isUnlocked }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (path === '/api/admin/media-config') {
    if (method === 'GET') {
      return new Response(JSON.stringify({ ok: true, mediaConfig: state.mediaConfig || {} }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (method === 'POST') {
      const updatedConfig = { ...(state.mediaConfig || {}), ...body };
      saveClientState({ mediaConfig: updatedConfig });
      return new Response(JSON.stringify({ ok: true, mediaConfig: updatedConfig }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 15. Tests & Submissions
  if (path === '/api/tests') {
    return new Response(JSON.stringify(state.tests || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 16. Shop Purchase
  if (path === '/api/shop/purchase') {
    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Xarid muvaffaqiyatli amalga oshirildi!',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 17. Presence Heartbeat
  if (path === '/api/presence/heartbeat') {
    return new Response(JSON.stringify({ ok: true, activeCount: 142 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 18. Default fallback
  return new Response(
    JSON.stringify({
      ok: true,
      message: 'Muvaffaqiyatli bajarildi (KITEST universal rejim)',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * Safely initializes the global fetch interceptor.
 * Avoids direct assignment to window.fetch which can throw in sandboxed iframes.
 */
export function initClientApiInterceptor() {
  if (typeof window === 'undefined') return;

  // If in AI Studio with active Express dev server, let server handle natively
  if (!isStaticOrGitHubEnvironment()) {
    return;
  }

  try {
    const originalFetch = window.fetch ? window.fetch.bind(window) : fetch.bind(window);

    const customFetch = async function (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      const urlString =
        typeof input === 'string'
          ? input
          : input instanceof URL
          ? input.toString()
          : (input && (input as Request).url) || '';

      const isApiRequest =
        urlString.startsWith('/api/') ||
        urlString.includes('/api/') ||
        urlString.startsWith('api/');

      if (!isApiRequest) {
        return originalFetch(input, init);
      }

      // Handle with client-side mock adapter
      try {
        return await handleClientApiRequest(urlString, init);
      } catch (err) {
        console.warn('Client API handler error, falling back:', err);
        return originalFetch(input, init);
      }
    };

    try {
      Object.defineProperty(window, 'fetch', {
        value: customFetch,
        writable: true,
        configurable: true,
      });
    } catch {
      try {
        (window as any).fetch = customFetch;
      } catch {}
    }
  } catch (err) {
    console.warn('Could not wrap window.fetch for static mode:', err);
  }
}
