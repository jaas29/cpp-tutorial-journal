# An unoptimized benchmark does not understate the result, it reverses it

Established 2026-09-11, while building the P1 benchmark for
[[lessons/0014-measuring-it-and-the-preset-that-lies.html]]. Neither `dev` nor `asan` passes any
`-O` flag, and benchmarking `Vector` under `dev` reports that it beats `std::vector` by 2.4x. At
`-O2` the same benchmark on the same machine reports it 9% slower. This is the fourth toolchain
trap in the 0005-0007 family, and the most dangerous, because unlike the others it produces a
plausible number rather than silence.

## What was measured

200,000 operations, median of 5 runs, Apple clang 17, macOS 26.5 arm64. Ratios above 1.00 mean the
standard library wins:

| 200k operations | `dev` preset | `-O2 -DNDEBUG` |
|---|---|---|
| `vector` push_back | **0.41x** (mine 2.4x *faster*) | **1.09x** (mine 9% slower) |
| hashmap insert | 2.38x slower | **5.36x slower** |
| hashmap lookup, hits | 0.85x | 0.86x |

## Why this is worth recording

- **The error is not conservative in either direction.** It invented a win on `vector` and hid more
  than half the loss on `insert`. "Unoptimized numbers are pessimistic but directionally right" is
  the intuition to unlearn: the `dev` number and the `-O2` number are answers to different
  questions, and the ordering between two implementations is not preserved.
- **The cause is specific and predicts where it will recur.** At `-O0` nothing inlines, so a deep
  stack of thin abstractions (`std::vector`: iterator wrappers, allocator indirection, `__builtin`
  calls) pays a real function call per layer, while a three-member class with a raw loop pays almost
  nothing. An unoptimized benchmark therefore measures **abstraction depth**, and systematically
  flatters whichever implementation is more primitive. Any hand-rolled-versus-standard-library
  comparison is exposed to this, which is most of what P1 and P2 will measure.
- **Neither existing preset can be fixed into being the benchmark build.** Optimization and
  sanitizers are mutually exclusive for this purpose: `-O2` destroys the line numbers correctness
  work needs, and sanitizer instrumentation on every memory access destroys the timings. This is the
  argument for a **third** preset rather than a flag added to an existing one, and it settles the
  question the two-preset shape in record 0002 left open.

## Implication for P2

P2 is six weeks of performance work — BVH, threading, custom allocator — where the entire
deliverable is before/after timings. Inheriting a two-preset repo into that project would mean every
speedup number is measured under `-O0`. The `release` preset must exist in the P2 repo from its
first commit, and "which preset produced this number" belongs next to every timing in the writeup.

Also note the reverse error, which is the same mistake pointed the other way: never take a
*correctness* claim from the `release` build. Three presets, three questions, no substitutions.
