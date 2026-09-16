# A median of five inside one run is not a stable result

Established 2026-09-15, when a second reviewer re-ran the P1 benchmark and got a different
answer. The harness reported that `HashMap::find` beat `std::unordered_map` on hits at
0.86x, then 0.90x, then 1.03x on his machine. Re-running it five times here produced 0.85x,
1.34x, 1.04x, 1.26x, 0.94x — the claimed win flipped sides on consecutive runs. The number
had been quoted in a lesson, a learning record, and a rendered video as a result.

This is the direct sequel to [[0010-an-unoptimized-benchmark-reverses-the-result]]: that
record established which *build* to measure under, and this one is about the measurement
procedure itself being wrong under the correct build.

## The bug

```cpp
row("hashmap lookup, all hits", ms(mine), ms(theirs));
```

`ms()` ran five trials and took the median, which is the right instinct. But the two calls
are **sequential blocks** — five trials of mine finish before the first trial of theirs
begins. A median of five defends against a scheduler hiccup *within* a block. It does
nothing about the machine changing *between* blocks: CPU frequency ramping, a background
process starting, cache state left by the previous block. Any of those lands entirely on
one side, and the ratio then measures the machine rather than the container.

## The fix, and what it costs

Interleave the trials — mine, theirs, mine, theirs — so both implementations experience the
same conditions in the same trial. Add an untimed warm-up pass so the first trial is not
paying for cold caches and lazy page faults. And **report the ratio's range across trials,
not a point**, with the verdict reading `parity` whenever that range straddles 1.00.

Measured after the fix, four independent runs:

| Operation | Ratio | Range | Verdict across all four runs |
|---|---|---|---|
| `vector push_back` | ~1.08x | 0.85–1.28 | parity |
| `hashmap insert` | ~5.7x | 5.2–6.3 | std wins, every run |
| `hashmap lookup, hits` | ~0.95x | 0.85–1.18 | **parity, every run** |
| `hashmap lookup, misses` | ~0.58x | 0.53–0.62 | **mine wins, every run** |

So the hit "win" was never real. The miss win is, and now has a range that never touches
1.00 to back it. The explanation survives and gets sharper: `max_load_factor` 0.75 against
libc++'s 1.0 means shorter chains, and a miss walks the *whole* chain — which is exactly why
the advantage appears on misses and not on hits.

## Why this is worth recording

- **A single ratio with no spread is not a measurement, it is an anecdote.** The fix that
  mattered was not more trials. Eleven sequential trials per side would still have been
  wrong. It was making the comparison paired.
- **The error survived three layers of review** — it was written into a lesson, cited in a
  learning record, and narrated in a video, because every one of those was quoting the same
  bad number rather than re-deriving it. A figure repeated is not a figure confirmed.
- **The dev-preset contrast is now a better story, not a worse one.** Under the unoptimized
  build the corrected harness reports `vector push_back` at 0.33x with a range of
  [0.32-0.35] and a verdict of "mine wins" — a *tight* interval around an answer that is
  flatly false at `-O2`. Record 0010 said an unoptimized benchmark is unrelated rather than
  pessimistic; this adds that it can also be confidently, reproducibly unrelated. Precision
  is not accuracy.

## Implication for P2

P2's entire deliverable is before/after timings for a BVH, threading, and a custom
allocator — every one of them a paired comparison of the same workload under two
implementations. The interleaved-trials harness, the warm-up, and the range-with-verdict
output belong in that repo from its first commit, not rediscovered in week 9. Together with
0010's `release` preset, that is the measurement setup P2 starts from.
