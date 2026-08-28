# Mission: Systems Programming in C++

## Why
I have never written a line of C or C++, and it is the largest gap in what I can currently build. The systems and infrastructure jobs I want list it as a requirement. Fall 2026 I am doing a for-credit tutorial with Prof. Roy (biweekly Wednesdays 12-1) built around three from-scratch projects, and I want to finish it able to write C++ that a working engineer reads as current, not a decade out of date.

## Success looks like
- Ship a container library (`vector` + `unordered_map` from scratch) that runs clean under AddressSanitizer and UBSan — weeks 1-4
- Ship a ray tracer, then cut its render time with a BVH, multithreading, and a custom allocator, with measurements for each — weeks 5-10
- Ship a chess engine whose move generator matches published perft numbers exactly — weeks 11-16
- Walk into a code-review meeting and defend my ownership and lifetime decisions out loud, citing Core Guidelines rather than vibes
- Read a crash and know whether it is a dangling pointer, a double free, or iterator invalidation before reaching for the debugger

## Constraints
- 5-6 hours a week outside meetings, roughly 70% building / 30% reading
- Project-driven, not curriculum-driven. learncpp.com is a lookup reference, not a book I read front to back. Teach me the thing the current project just forced me to learn
- Deliverables are graded at three points; the meeting cadence is biweekly, so lessons should fit the two-week block I am actually in
- Modern C++ only (C++17/20 idioms). When a source disagrees with learncpp on style, learncpp wins
- I am a CS undergrad. Clear over academic. No emojis

## Out of scope
- Pre-C++11 style: raw `new`/`delete` as the default, manual memory everywhere
- Competitive-programming C++
- Chess or graphics libraries — both projects are from scratch or the lesson disappears
- Language trivia disconnected from the three projects (template metaprogramming showpieces, obscure corners of the standard)

---
Source: `2 - Classes/Fall 2026/C++ Tutorial/Tutorial Proposal.md` in the JAASMEMORY vault.
