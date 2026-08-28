# Apple clang's AddressSanitizer is unusable on this machine

Established 2026-08-17, before Project 1 began. On this Mac (macOS 26.5.2, arm64, Apple clang 17.0.0), any binary built with `/usr/bin/clang++ -fsanitize=address` compiles and links successfully and then **hangs on startup producing no output at all**. UBSan (`-fsanitize=undefined`) is unaffected.

## Evidence

Sampling the stuck process gave an unambiguous deadlock in ASan's own initialisation:

```
__asan::AsanInitInternal()
  → __asan::InitializeShadowMemory()
    → __sanitizer::MemoryRangeIsAvailable()
      → __sanitizer::get_dyld_hdr()
        → dyld_shared_cache_iterate_text_swift   (macOS 26 dyld)
          → _Block_copy → malloc
            → __sanitizer_mz_malloc              (ASan's intercepted malloc)
              → __asan::AsanInitFromRtl()        (re-entering init)
                → StaticSpinMutex::LockSlow()    (spins forever on a held lock)
```

macOS 26's dyld allocates inside the routine ASan calls to enumerate memory mappings; that allocation reaches ASan's own interceptor, which re-enters the initialiser and spins on the lock it already holds.

## Workaround, verified working

Homebrew LLVM (clang 22.1.8 at `/opt/homebrew/opt/llvm/bin/clang++`) ships a runtime without the bug. It needs an explicit sysroot or it cannot find the system headers:

```
/opt/homebrew/opt/llvm/bin/clang++ -isysroot "$(xcrun --show-sdk-path)" \
  -std=c++20 -g -fno-omit-frame-pointer -fsanitize=address,undefined ...
```

Confirmed to catch a deliberate heap-use-after-free with correctly symbolized `file:line` frames.

## Implications

- Project 1's success criterion is "runs clean under AddressSanitizer and UBSan". That criterion is only reachable through the Homebrew toolchain, so **the build setup lesson must establish two compilers from the start**, not one.
- The CMake setup for P1 needs `CMAKE_CXX_COMPILER` pointed at the Homebrew clang for the sanitizer build configuration. Worth handling in the very first build-system lesson rather than discovering it mid-project.
- If José ever sees an ASan binary "hang", the first hypothesis is the wrong compiler, not his own code. Recorded in [[reference/toolchain.html]] so he does not lose an afternoon to it.
