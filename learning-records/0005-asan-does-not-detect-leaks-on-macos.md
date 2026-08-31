# AddressSanitizer reports no leaks on macOS; `leaks` fills the gap

Established 2026-08-25, while preparing [[lessons/0005-the-heap-and-your-first-vector.html]]. The
lesson's hook was going to be "write a Vector without a destructor, and let ASan show you the
leak." Tested first, and it does not work.

## What was tested

A deliberately leaking `Vector` (heap buffer via `new int[]`, no destructor) built with the
Homebrew clang and `-fsanitize=address,undefined`, run with `ASAN_OPTIONS=detect_leaks=1`. It ran
to completion, printed correct output, and **exited 0 with no diagnostic**. LeakSanitizer is not
supported on Darwin, so the option is inert rather than failing loudly.

## What works instead

Apple's `leaks`, on a plain Apple-clang build:

```
MallocStackLogging=1 leaks -atExit -- ./t2
Process 27743: 1 leak for 48 total leaked bytes.
STACK OF 1 INSTANCE OF 'ROOT LEAK: <malloc in Vector::push_back(int)>':
4   t2   main + 72                       t2.cpp:25
3   t2   Vector::push_back(int) + 132    t2.cpp:11
2   libc++abi   operator new(unsigned long)
```

Two conditions matter, both found by trial:
- **The owning object must go out of scope before exit.** With the `Vector` alive in `main` at
  program end, `leaks -atExit` reports nothing — the allocation is still reachable, so it is not a
  leak by its definition. Wrapping the body in a bare `{ ... }` block produced the report above.
- The report names the **allocation** site, never the missing `delete`. Worth saying out loud to
  José, because the instinct is to look for the free that did not happen, which has no location.

## Implications

- This does **not** weaken the case for the `asan` preset from
  [[learning-records/0002-p1-build-shape-header-only-two-presets.md]]. ASan still catches
  heap-buffer-overflow and use-after-free, which is the majority of what P1 will produce. It just
  means "clean under ASan" and "no leaks" are two separate claims needing two separate tools, and
  the mission's P1 success criterion quietly assumed one.
- Added to `reference/toolchain.html` as its own callout above the glossary.
- Lesson 5 was rewritten around this rather than around the assumption. General rule reconfirmed:
  run the demo before writing the lesson that depends on it.

## Status note, same date

José has finished Lessons 1-4 and asked where he stands against the proposal. Honest answer: the
build-system half of Weeks 1-2 is done and the C++ half is entirely untouched — `mystl` contained
only `main.cpp` and `Math.cpp` from The Cherno's videos, `include/mystl/` and `tests/` were empty,
and git had a single commit. **8 days to the Sep 2 checkpoint**, whose deliverable is `Vector<T>`
with copy and move semantics, `push_back`, `operator[]`, and STL-compatible iterators, clean under
both sanitizers. Recoverable, but only at roughly one concept per day from here — the remaining
lessons (RAII, copy, move, templates, iterators) are the checkpoint, not preparation for it.

---

## Correction, 2026-08-31

The scope condition above is wrong, and was retested today against José's real `tests/main.cpp`.

`leaks -atExit` performs its analysis **after `main` returns**, so a `Vector` declared directly in
`main` has already been destroyed by the time `leaks` looks. No wrapping block is needed. Verified
three ways on the same unflagged Apple-clang build of his file:

```
destructor present, no wrapping block   -> 0 leaks for 0 total
destructor body emptied, no block       -> ROOT LEAK: <malloc in containers::Vector::grow()>, 48 bytes
no destructor declared at all, no block -> ROOT LEAK: <malloc in containers::Vector::grow()>, 48 bytes
```

What produced the original claim was not established. The rest of the record stands: LeakSanitizer
is unsupported on Darwin, `leaks` fills the gap, and the report names the allocation site rather
than the missing free.

The transferable lesson is the one that generalises past this detail: **a passing leak check is
only evidence if the same check fails without the fix.** [[lessons/0006-the-destructor-and-raii.html]]
now instructs emptying the destructor body and re-running before trusting a zero, and the wrapping
block has been removed from it.
