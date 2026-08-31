# A heap-corruption abort under the `dev` preset prints nothing at all

Established 2026-08-31, while verifying [[lessons/0006-the-destructor-and-raii.html]] on this
machine. Records 0005 and 0006 established that neither preset can see *leaks*. This one is about
the opposite failure: a bug both presets do detect, reported usefully by only one of them.

## What was tested

The Lesson 6 `Vector` — destructor added, no copy constructor — copied once (`Vector b = a;`) so
that both destructors free the same buffer. Same source, two builds:

```
/usr/bin/clang++ -std=c++20 -g -Wall -Wextra -Wpedantic -Werror -fsanitize=undefined
  -> exit 133, and NOTHING on stdout or stderr

/opt/homebrew/opt/llvm/bin/clang++ ... -fsanitize=address,undefined
  -> AddressSanitizer: attempting double-free on 0x603000001c00
     three stacks: the free, the second free, and the original allocation in grow()
```

Exit 133 is 128 + 5: the process died on signal 5 (`SIGTRAP`), which is how macOS's allocator
aborts. No `malloc: *** error for object ...` line was printed. The program's own
`std::cout << "a[0] = " << a[0]` output was also lost, because the process is killed before the
stdout buffer is flushed — so the last thing the program *did* print is invisible too.

## Why this is worth recording

- The natural reading of a silent exit 133 is "it crashed somewhere", which invites debugging by
  bisection. The correct reflex is **rebuild under the `asan` preset first**, before forming any
  hypothesis. That is a one-command answer to a question that otherwise costs an evening.
- It is the second half of the argument for two presets. Record 0002 justified the `asan` preset
  with a planted heap-buffer-overflow. This is a second, independent bug class where `dev` is not
  merely less detailed but supplies **zero** information.
- Combined with 0005 and 0006, the honest summary of the three build configurations is now:
  `dev` catches UB with a message and heap corruption with nothing; `asan` catches heap corruption
  with a full report and leaks not at all; the third uninstrumented build catches leaks only. No
  single build is a proxy for "clean". Added as a triage row in `reference/ownership.html` and
  worth folding into `reference/toolchain.html` next.
- The lost `stdout` line matters pedagogically: the aliasing symptom (`a[0] = 999` after writing to
  `b`) is a bug in its own right, visible *before* any crash — but only in the ASan run, where the
  report goes to stderr and the program's own output still appears.

## Implication for the checkpoint

`Vector b = a;` is the shape of the next deliverable, so this failure is one José will hit for real
while writing the copy constructor. He should have the reflex before he needs it.
