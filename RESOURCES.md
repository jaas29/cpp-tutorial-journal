# C++ Resources

Curated from the tutorial resource list reviewed by Prof. Roy. Full annotated version lives at `2 - Classes/Fall 2026/C++ Tutorial/Resources.md` in the vault.

## Knowledge

- [learncpp.com](https://www.learncpp.com/)
  Free, complete, actively maintained, teaches modern style from lesson one. **The primary source** — when any other resource disagrees on style, this wins. Use for: anything about how compilation works and how memory works.
- [cppreference.com](https://en.cppreference.com/)
  Not a teaching site — the dictionary. Precise, dense, unfriendly. Use for: exact questions ("does erasing from a vector invalidate my other iterators?"). In P1 the `vector` and `unordered_map` pages are the requirements document.
- [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/) — Stroustrup & Sutter
  ~500 numbered rules with rationale. Not read, **cited**. Use for: justifying a design decision in a writeup or a code-review meeting.
- [CMake official documentation & tutorial](https://cmake.org/cmake/help/latest/guide/tutorial/index.html)
  Written by the CMake maintainers, and the only CMake source that is never out of date with the tool you have installed. **The primary CMake source.** Steps 1-3 of the tutorial cover the target-based style; stop there, the rest is packaging. The [command reference](https://cmake.org/cmake/help/latest/manual/cmake-commands.7.html) is a dictionary, like cppreference - looked up, not read. Checked 2026-08-19 against CMake 4.4.2.
- [*Professional CMake: A Practical Guide*](https://crascit.com/professional-cmake/) - Craig Scott
  Scott is a CMake co-maintainer, which makes this the highest-trust deep reference available. Paid, ~$30, 22nd edition Jan 2026. **Not needed this term** - the official tutorial plus `reference/cmake.html` covers P1-P3. Note it here for when a build problem outgrows the docs.

- Book: *A Tour of C++* (3rd ed, 2022) — Stroustrup. On hand at `Attachments/A Tour of C++ - Stroustrup (3rd ed, 2022).pdf`
  A fast flyover of the whole language for people who already program. Covers C++20. Use for: a map of where a feature sits before meeting it cold, and the *why* behind the design.
- Book: *Effective Modern C++* — Meyers. On hand at `Attachments/Effective Modern C++ - Meyers.pdf`
  42 Items, each specific advice plus pages of reasoning. A book of mistakes not yet made. Use from P2 onward, item by item as relevant.
- [Ray Tracing in One Weekend](https://raytracing.github.io/) — Shirley
  Canonical three-book series. Use for: P2, plus *The Next Week* for the BVH.
- [Chess Programming Wiki](https://www.chessprogramming.org/)
  Use for: P3 — bitboards, perft, alpha-beta, transposition tables. [Perft results](https://www.chessprogramming.org/Perft_Results) make move generation provably correct.
- [Compiler Explorer (godbolt.org)](https://godbolt.org/)
  Shows the assembly a line compiles to. Use for: making the cost of an abstraction visible instead of theoretical. Overlaps with Computer Systems.
### Video

José learns partly by watching — see `NOTES.md`. These are vetted channels, ordered by when they
become useful. Caveat that applies to all of them: **video is for intuition, learncpp is for
style.** Where a video's syntax disagrees with learncpp, learncpp wins (per the mission).

- [The Cherno](https://www.youtube.com/@TheCherno) — **use now, during P1.**
  Ex-EA engine dev. Strong on what is actually happening in memory, with drawn diagrams rather
  than slides. His *Making DATA STRUCTURES in C++* series builds a `vector` on camera, which is
  literally P1. Start with: *Pointers in C++*, *References in C++*, *Object Lifetime (Stack Scope
  Lifetimes)*, *Smart Pointers*, then *Writing a VECTOR (dynamic array)*.

  **Verified URLs** (titles confirmed against YouTube 2026-08-25; runtimes not verified):
  - [Stack vs Heap Memory in C++](https://www.youtube.com/watch?v=wJ1L2nSIV1s) — pairs with Lesson 5, Knowledge 1
  - [POINTERS in C++](https://www.youtube.com/watch?v=DTxHyVn0ODg) — pairs with Lesson 5, Knowledge 3
  - [The NEW Keyword in C++](https://www.youtube.com/watch?v=NUZdUSqsCs4) — pairs with Lesson 5, Knowledge 3
  - [VECTOR/DYNAMIC ARRAY — Making DATA STRUCTURES in C++](https://www.youtube.com/watch?v=ryRf4Jh_YC0)
    — **not yet.** Assumes templates, move semantics and in-place construction. It is the review
    video for *after* the destructor and copy-constructor lessons, not a companion to Lesson 5.

  **Caveat:** he uses raw `new`/`delete` and some pre-C++17 style. Inside P1 that is fine and
  correct — writing a container means you *are* the one doing manual memory. Do not carry the
  style into P2/P3 application code.
- [C++ Weekly — Jason Turner](https://www.youtube.com/@cppweekly) — **use now, as the modern-style
  corrective to the above.** Short single-topic episodes (5-15 min), C++11 through C++26. Turner
  sits on the standards committee and was still active as of August 2026
  ([CppCast ep. 410](https://cppcast.com/)). Best consumed as a 10-minute palate cleanser, not a
  course.
- [Sebastian Lague](https://www.youtube.com/@SebastianLague) — **use at the start of P2.**
  *[Coding Adventure: Ray Tracing](https://www.youtube.com/watch?v=Qz0KTGYJtUk)* and
  *[Optimizing a Ray Tracer (by building a BVH)](https://www.youtube.com/watch?v=C1H4zIiCOaI)* are
  the clearest visual explanations of P2 and its BVH milestone that exist. **The code is C#/Unity,
  not C++** — watch it for the geometry and the BVH intuition, then implement from
  *Ray Tracing in One Weekend*. Watching this before reading Shirley makes Shirley much faster.
- [javidx9 / OneLoneCoder](https://www.youtube.com/@javidx9) — **P2/P3.** Systems built from
  scratch on camera in C++, with the reasoning spoken aloud. Good model for how to think through a
  from-scratch build.
- [CppCon](https://www.youtube.com/@CppCon) — **the talks listed below live here.** Conference
  recordings from the people who design the language. Highest trust of anything on this list; also
  the densest, so it is one talk per project phase, not a channel to browse.

**Deliberately not recommended:** general "C++ Full Course" / "C++ Tutorial for Beginners"
channels (Caleb Curry, CodeBeauty, freeCodeCamp's C++ courses, thenewboston, Bro Code). They teach
raw pointers and `new`/`delete` as the default and stop before anything P1 needs. See
*Excluded on purpose* below.

### Talks (one per project phase)
- Herb Sutter, *Leak-Freedom in C++* (CppCon 2016) — during P1
- Chandler Carruth, *Efficiency with Algorithms, Performance with Data Structures* (CppCon 2014) — during P2
- Mike Acton, *Data-Oriented Design and C++* (CppCon 2014) — during P2
- Chandler Carruth, *There Are No Zero-Cost Abstractions* (CppCon 2019) — during P3

## Wisdom (Communities)

- The tutorial itself: biweekly code review with Prof. Roy, and possibly other students taking the credit. This is the highest-signal feedback loop available — treat prep for it as the real deadline.
- [r/cpp_questions](https://reddit.com/r/cpp_questions) — moderated, beginners welcome, answers tend to be modern-style.
- [C++ Slack (cpplang)](https://cpplang.slack.com/) — active `#beginner` channel with working engineers.

*Not yet confirmed with José whether he wants to post publicly. Ask before recommending he ask a question somewhere.*

## Excluded on purpose

Pre-C++11 tutorials (tutorialspoint, w3schools, most YouTube courses) — they teach raw pointers and `new`/`delete` as the default, the exact habit that gets flagged in review. Competitive-programming C++. Chess and graphics libraries.

## Tooling

- [Clang AddressSanitizer docs](https://clang.llvm.org/docs/AddressSanitizer.html)
  Official LLVM documentation. Checked 2026-08-17 — this is the trusted reference for reading ASan reports, and it documents `ASAN_SYMBOLIZER_PATH` / `asan_symbolize.py` for when a trace comes back as raw addresses. Use for: P1 onward, every time a report is unclear.
- [Clang UndefinedBehaviorSanitizer docs](https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html)
  Official LLVM documentation. Checked 2026-08-17. Use for: the list of individual checks, when you want to know whether UBSan would have caught something.

## Gaps

- None open. (The CMake gap was closed 2026-08-19: official docs chosen as primary, *Professional CMake* noted as the escalation path. The two-compiler setup it needed to cover is written up in [`reference/cmake.html`](./reference/cmake.html) and verified working.)
