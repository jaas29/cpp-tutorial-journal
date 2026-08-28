# Project 1's build is a header-only INTERFACE library with two presets

Established 2026-08-19, during Lesson 2. Records the shape chosen for the Project 1 repository
(`~/Projects/p1-containers`) and the reasoning, since both are non-obvious and will be questioned
in code review.

## The shape

- **`add_library(containers INTERFACE)`**, not a compiled library. P1's `vector` and
  `unordered_map` are class templates, so they have no code to compile until instantiated and must
  live entirely in headers. An `INTERFACE` target is CMake's name for exactly that: a named bundle
  of include paths and flags with no compilation of its own.
- **Two configure presets, two build directories.** `dev` (Apple clang, UBSan) and `asan`
  (Homebrew clang, ASan + UBSan). Separate directories rather than separate flag sets, because
  CMake caches `CMAKE_CXX_COMPILER` per build directory and object files from the two toolchains
  must never be linked together. This makes mixing structurally impossible rather than merely
  unlikely.
- **`-Werror` from day one**, alongside `-Wall -Wextra -Wpedantic`.
- **`-isysroot $(xcrun --show-sdk-path)` hardcoded in the `asan` preset.** Required — verified that
  without it Homebrew clang fails inside `<iostream>` with `no such sysroot directory`. JSON cannot
  run commands, so the path is literal and needs regenerating after an Xcode update.

## Why this matters later

- The `INTERFACE` choice is only correct while the library is header-only. If P1 ever grows a
  non-template `.cpp`, this becomes `add_library(containers STATIC ...)` and the `INTERFACE`
  keywords become `PUBLIC`. That is the trigger to revisit this record.
- `-Werror` will eventually block a build on a warning José disagrees with. The rule is to fix or
  narrowly suppress with justification, never to remove the flag. If it becomes a genuine
  obstacle, that is worth discussing rather than silently dropping.

## Verified 2026-08-19 on this machine

Both presets configure, build, and run. A one-character off-by-one (`i <= b.size()`) was planted:
the `dev` build printed the right-looking answer and exited 0, while the `asan` build aborted with
a fully symbolized `heap-buffer-overflow` naming both the faulting line and the allocation site.
This is the demonstration that the second preset earns its keep, and it is reproduced in
[[lessons/0002-two-builds-one-source-tree.html]].

Apple clang's ASan hang was re-confirmed the same day (still running after 10s, no output),
so [[learning-records/0001-asan-broken-under-apple-clang.md]] remains current.
