# A container tested only at `T = int` cannot see its own unnecessary copies

Established 2026-09-07, while templating `Vector` for
[[lessons/0009-vector-t-and-the-bug-int-was-hiding.html]]. The bug was written in Lesson 5 and
survived four lessons, three sanitizers, `-Werror`, and a clean `leaks` run — because the only
`T` ever instantiated was one for which the bug had no cost.

## The defect

`grow()`, unchanged since Lesson 5:

```cpp
T *fresh = new T[new_capacity];
for (std::size_t i = 0; i < m_size; ++i)
    fresh[i] = m_data[i];        // deep copy
delete[] m_data;                 // ...of data whose only future is deletion
```

Every element is deep-copied into the new buffer, and the originals are destroyed on the next
line. That is the exact situation Lesson 8 defined a move for. The fix is one word:
`fresh[i] = std::move(m_data[i]);` — committed as `b5e28ea`.

## What was measured

Global `operator new[]` replaced to count buffer allocations and nothing else. Same source both
runs, differing only in that one line, `-O0`:

```
                                          grow() copies   grow() moves
5 push_backs into Vector<int>                  4               4
8 rows into Vector<Vector<int>>               51              44
```

(Lesson 9's table shows 43/36 for the second row — same delta, different absolute totals, because
that harness builds shorter rows. The delta is the finding; the totals are an artefact of the
probe.)

Seven allocations saved, and they are identifiable: 1 + 2 + 4, the inner buffers relocated as the
outer buffer doubles from capacity 1 to 8. Each is an inner `Vector`'s buffer, allocated only to
be freed moments later.

## Why this is a record and not just a fix

**The top row is the whole point.** At `T = int` the two versions produce identical numbers,
because moving an `int` *is* copying an `int`. No measurement taken against `Vector<int>` — no
profiler, no allocation counter, no benchmark — could have distinguished a correct `grow()` from a
wasteful one. The test data was incapable of expressing the difference.

The template did not introduce this bug. **It made it observable.** Instantiating a generic
container with a type that owns memory is not a portability exercise; it is the measurement
instrument. `Vector<Vector<int>>` is the smallest `T` that reports on the decisions `int` was
paying for silently.

## Implications for what comes next

- **`unordered_map` must be exercised with an owning `T` from the first test, not retrofitted.**
  Its rehash is structurally the same operation as `grow()` — relocate every element into a bigger
  buffer, destroy the old one — so the identical defect is available there, and `int` values will
  hide it just as effectively.
- Generalised: for any container operation that relocates elements, **write the test against a
  type whose copy is expensive**, or the test cannot fail.
- This joins records [[0005-asan-does-not-detect-leaks-on-macos]],
  [[0006-ubsan-instrumentation-hides-leaks-from-leaks]] and
  [[0007-dev-preset-aborts-silently-on-heap-corruption]] as a fourth blind spot, and it is a
  different species from the other three. Those are gaps in the *tools*. This one is a gap in the
  *test data*, and no tool could have covered it — which makes choosing what to instantiate a
  design decision, not a detail.
