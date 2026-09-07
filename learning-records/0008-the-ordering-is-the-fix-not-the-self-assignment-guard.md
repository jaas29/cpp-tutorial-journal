# In copy assignment, the ordering is the fix; the self-assignment guard is an optimization

Established 2026-08-31, while verifying [[lessons/0007-the-copy-constructor-and-deep-copy.html]]
on this machine. Contradicts, for our ordering, the standard textbook claim that the
self-assignment guard is a correctness requirement.

## The claim being tested

Every source states copy assignment as `if (this == &other) return *this;` first, justified as:
without it, `v = v` frees the buffer and then copies out of the memory it just freed. That
justification is written into `reference/ownership.html` section 3 and was taken on trust.

## What was tested

The Lesson 7 `Vector` with copy constructor and copy assignment, self-assigned through a reference
(`Vector &alias = c; c = alias;`) so the compiler cannot see it. Four variants, same source
otherwise, all three build configurations:

```
allocate -> copy -> release,  guard      -> c[3] == 30   (correct)
allocate -> copy -> release,  NO guard   -> c[3] == 30   (correct)
release  -> allocate -> copy, guard      -> c[3] == 30   (correct)
release  -> allocate -> copy, NO guard   -> c[3] == -1094795586
```

`-1094795586` is `0xBEBEBEBE`, ASan's fill pattern for freshly allocated memory.

## Why the textbook reasoning does not apply

With allocate-before-release, at the moment the copy loop runs the source buffer has not been
touched, so `other.m_data` and `m_data` are the same live buffer and copying it onto itself is a
no-op. Correct by construction.

With release-first and no guard, the failure is **not** the use-after-free the books describe.
`delete[] m_data` then `m_data = new int[...]` means `other.m_data` — which aliases `m_data` —
now names the *new* buffer, so the loop copies uninitialized memory onto itself. The old buffer is
never read at all.

So the guard's real job in our version is skipping a pointless allocate-and-copy when an object is
assigned to itself. Worth keeping. Not load-bearing.

## The part that matters more: nothing detected row four

`dev` (UBSan), `asan`, and the plain leak-check build all ran row four to completion, exit 0, no
diagnostic. It is not a use-after-free (the read is from live memory), not out of bounds, not a
leak. Reading uninitialized memory is MemorySanitizer's job, and MSan does not exist on
Darwin/arm64.

**Fourth row for the triage table in `reference/ownership.html`:** all three build configurations
are blind to reading uninitialized memory. Records 0005/0006 gave the leak blind spot, 0007 the
silent-abort blind spot; this is the third and the only one with no tooling answer at all. The
only detector is an assertion in the test that fails loudly, rather than output read by eye.

## Second, smaller finding: the self-assignment test will not compile

`c = c;` written literally is rejected by our own flags:

```
error: explicitly assigning value of variable of type 'containers::Vector' to itself
       [-Werror,-Wself-assign-overloaded]
```

Correct behaviour — literal self-assignment in real code is always a mistake — but it means the
test must alias through a reference or pointer. That is also the honest shape of the bug: real
self-assignment arrives through two names for one object, via parameters.

## Action taken

- `reference/ownership.html` section 3: the sentence claiming `v = v` "frees the buffer and then
  copies out of it" was true only of the release-first ordering, which is not the ordering the
  sheet shows two lines above. Corrected.
- Lesson 7 Knowledge 4 carries the measured table rather than the received rule.

## Open

Not tested: whether the same conclusion holds once `Vector` is a template and `T` has a
non-trivial copy assignment of its own. Self-assigning `T` elements one by one is a different
question from self-assigning the buffer, and it is worth re-testing when `Vector<T>` lands.
