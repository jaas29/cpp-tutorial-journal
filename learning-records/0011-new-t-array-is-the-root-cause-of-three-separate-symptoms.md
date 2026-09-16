# `new T[n]` is one root cause with three separate symptoms, and now it has a price

Established 2026-09-11, while explaining the 5.36x insert gap in
[[lessons/0014-measuring-it-and-the-preset-that-lies.html]]. The limitation first written down in
[[lessons/0009-vector-t-and-the-bug-int-was-hiding.html]] as "`new T[n]` requires `T` to be
default-constructible" has now surfaced twice more, in unrelated-looking places, and the third
appearance came with a measurement attached.

## The three symptoms

1. **Lesson 9** — `Vector<Point>` does not compile at all when `Point` has no default constructor.
2. **Lesson 13** — `pop_back()` cannot destroy the element it removes. Every slot holds a live
   object for the lifetime of the buffer, so an erased entry keeps whatever it owns until the whole
   container is destroyed.
3. **Lesson 14** — instrumenting the key type with a counting struct, 100 inserts into `HashMap`:

   | 100 inserts | key copies | key moves | default-constructions |
   |---|---|---|---|
   | Mine | 391 | 87 | **390** |
   | `std::unordered_map` | 100 | 100 | **0** |

   390 constructions nobody asked for, because `new T[n]` constructs every slot in every buffer —
   including empty buckets, and again in every fresh buffer on every growth.

## Why this is worth recording

- **It is one decision, not three bugs.** `new T[n]` *allocates and constructs*; the standard
  library allocates raw bytes and constructs in place. Every symptom above follows from that single
  difference. Recognising one root cause behind a type error, a lifetime limitation and a
  performance gap is the actual lesson, and it is the kind of thing that is invisible until the
  third instance.
- **It is now quantified rather than theoretical.** Lesson 9 recorded it as a known limitation with
  no cost attached, which made deferring it easy and unexamined. A 5.36x gap with 61% isolated to
  rehash and the rest to copies and constructions makes the deferral a *decision with a number on
  it*, which is what a code review can actually interrogate.
- **The fix is named and scoped.** Raw storage (`operator new` / `std::aligned_storage`-style
  buffers) plus placement `new` plus explicit destructor calls, which is also the gateway to
  allocators. It touches every member of both containers, which is why it stayed deferred five days
  before the deliverable — and per Core Guideline Per.2 that deferral is defensible as long as it is
  stated rather than hidden.

## Implication for P2 and P3

The custom arena allocator in P2 week 10 is the same technique arriving as a first-class deliverable
rather than a limitation: request one large slab, hand out pieces, construct in place with placement
`new`, manage alignment explicitly. P1 has now produced three independent motivations for it, which
means that week should start from this record rather than from scratch.
