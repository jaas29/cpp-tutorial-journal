# CMake earns its place through the dependency graph, not through convenience

Established 2026-08-25, from José's own question at the start of Project 1: "why do we need CMake
for?" He had already built and linked by hand and correctly saw that CMake was not doing anything
he could not type. The answer had to be an argument, not an instruction.

## The framing that worked

Build the program by hand first, on his machine, with real output — then break it three ways:

1. **Flag drift.** The same flag list repeated per translation unit, with nothing enforcing it.
   Same failure family as the Lesson 3 signature mismatch: the toolchain does not stop you.
2. **No dependency graph.** The load-bearing one. A shell script cannot know which `.cpp` included
   which header, so it must rebuild everything or risk linking stale objects. Demonstrated live:
   editing `vecutil.cpp` rebuilt one file, editing `log.hpp` rebuilt all three, and
   `build/CMakeFiles/app.dir/compiler_depend.make` was opened to show where that knowledge is
   written down.
3. **Two configurations.** His `dev`/`asan` split from
   [[learning-records/0002-p1-build-shape-header-only-two-presets.md]] doubles every command by hand.

## The mental model to hold him to

**CMake is a generator, not a build system.** It writes Makefiles into `build/`; `make` runs them.
This is the reason the workflow has two commands with different triggers, and it makes the
configure-vs-build table in `reference/cmake.html` follow from something rather than be memorised.

## Implications

- Break 2 is not a general argument — it is *his* argument, because P1 is header-only. Every test
  file depends on `vector.hpp`, so header dependency tracking is the main event in this project.
  Reuse this framing when P2's ray tracer makes rebuild cost visible in wall-clock seconds.
- He was shown `flags.make` and `compiler_depend.make` as readable files. The habit being built is
  **the build directory is inspectable, not magic** — same instinct as reading symbol tables in
  [[learning-records/0003-source-list-is-explicit-not-directory-scan.md]] rather than guessing.
- `CMAKE_CXX_EXTENSIONS OFF` now has a reason attached: the demo project's generated flags said
  `-std=gnu++20`, his own `mystl` says `-std=c++20`. Verified in both.
- **Still open from record 0003:** he is working in `mystl/`, not `p1-containers`. `mystl/build`
  currently configures with sanitizers on and *without* `-Werror`. Worth settling whether `mystl`
  becomes P1 before real container work starts.

Captured in [[lessons/0004-why-cmake-exists.html]].
