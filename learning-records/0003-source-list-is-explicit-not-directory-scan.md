# A `.cpp` in `src/` is not in the build until `add_executable` names it

Established 2026-08-24, from a real failure in `~/projects/cpp-tutorial/mystl` while José was
working alongside The Cherno's videos rather than the lesson track. He split `Log` out of
`main.cpp` into `src/Log.cpp`, and the build failed at link time with
`Undefined symbols … "Log(char const*)", referenced from: ltmp1 in main.cpp.o`.

## The misconception

Placing a source file in the project's `src/` directory makes it part of the program. It does not.
`add_executable` is the sole statement of which translation units exist; nothing in the toolchain
scans directories. `Log.cpp` was never compiled, produced no object file, and therefore supplied
no symbol — while `main.cpp` compiled cleanly, because the hand-written declaration
`void Log(const char*);` was all the compiler ever needed.

This is worth recording because the misconception is invisible from the error message. The error
names `main.cpp.o`, the file that is *correct*, and never mentions `Log.cpp` at all — precisely
because the build system does not know `Log.cpp` exists.

## Evidence

Diagnosed together by reading symbol tables rather than guessing:
`nm -u build/CMakeFiles/mystl.dir/src/main.cpp.o | c++filt` showed the hole (`Log(char const*)`),
and hand-compiling `Log.cpp` showed the matching `T __Z3LogPKc` that was never reaching the linker.
Fixed by adding `src/Log.cpp` to `add_executable`; `cmake --build build` reconfigured itself,
compiled only the new file, linked, and printed `hello world`.

## Implications

- **The `reference/toolchain.html` triage table already listed this as cause #1** under
  `Undefined symbols`. José hit the error without consulting it. The reference sheets are not yet
  a reflex — worth prompting him to check the triage table *first* the next time something fails,
  since building that habit is more valuable than any individual answer.
- **Compiler error vs linker error is now a distinction he has seen in the wild**, with the
  `file:line:col` versus `symbol + .o` tell. Future lessons can assume it.
- **The next gap is headers.** `main.cpp` still hand-writes its declaration of `Log`, which works
  but is exactly the setup that produces a silent signature mismatch (demonstrated in the lesson:
  `Log(char*)` and `Log(char const*)` are unrelated symbols). Lesson 4 should move the declaration
  into `include/mystl/Log.hpp` and teach `#pragma once` and the one-definition rule from that
  concrete need. That is also the file shape `vector.hpp` requires, so it is Project 1 work.
- **He is working in `mystl/`, not the `p1-containers` repo** named in
  [[learning-records/0002-p1-build-shape-header-only-two-presets.md]]. `mystl` is a scratch tree
  for following videos and is missing `-Werror` and the two-preset setup. Worth clarifying whether
  `mystl` becomes P1 or stays a sandbox before Project 1 work starts in earnest.

Captured in [[lessons/0003-the-linker-only-sees-what-you-listed.html]].
