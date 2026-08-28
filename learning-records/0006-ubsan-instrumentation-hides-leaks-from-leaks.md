# `-fsanitize=undefined` makes Apple's `leaks` report zero leaks

Established 2026-08-26, while verifying [[lessons/0005-the-heap-and-your-first-vector.html]]
against the real P1 repo rather than a scratch build. Record
[[learning-records/0005-asan-does-not-detect-leaks-on-macos.md]] established that ASan cannot
detect leaks on Darwin and that `leaks` fills the gap. This record narrows that: **the `dev` preset
cannot detect them either**, for a different reason.

## What was tested

The leaking `Vector` from Lesson 5 (heap buffer, no destructor), same source and same compiler
(`/usr/bin/clang++`) every time, varying only the flags:

```
<no extra flags>                              -> 1 leak for 48 total
-fno-omit-frame-pointer                       -> 1 leak for 48 total
-fsanitize=undefined                          -> 0 leaks for 0 total
-fno-omit-frame-pointer -fsanitize=undefined  -> 0 leaks for 0 total
```

`-fsanitize=undefined` alone flips it. The frame-pointer flag is irrelevant. This is not the
scope condition from record 0005 — the no-flag build of the identical source reports the leak.

## Why this matters more than it looks

The `dev` preset in `p1-containers/CMakePresets.json` carries `-fsanitize=undefined`. So:

- `./build/dev/tests` — UBSan on, `leaks` reports **0**
- `./build/asan/tests` — LeakSanitizer unsupported on Darwin, reports **0** (record 0005)

**Both presets are blind to leaks, for two unrelated reasons.** A leak in P1 would pass every
build configuration currently defined. The `asan` preset was chosen to make memory bugs loud, and
this is the one class it silently drops.

Presumed cause, not verified: UBSan's runtime interposes or retains the allocation such that
`leaks` still finds it reachable at exit. Worth confirming before it goes in a lesson as fact.

## Implication

Leak checking needs a **third, uninstrumented build** — not a preset variation of the two that
exist. Until that is added, the workaround is a manual compile:

```
/usr/bin/clang++ -std=c++20 -g -Iinclude tests/main.cpp -o /tmp/leakcheck
MallocStackLogging=1 leaks -atExit -- /tmp/leakcheck
```

Verified working the same day, reporting the 48-byte leak with the allocation stack naming
`containers::Vector::grow()`.

Open question for the 2026-08-26 meeting with Prof. Roy: whether a third `leak` preset is the
right shape, or whether leak checking belongs in CI on a plain build.
