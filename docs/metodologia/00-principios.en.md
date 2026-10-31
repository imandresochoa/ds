---
titulo: Principles
resumen: What agentic-first means and the rules that are not up for negotiation.
origen: "dacf3b549c12"
---

An agentic-first design system is one that a person and an agent read equally well. There is no “nice” version for people and another for machines: the page you see is Markdown with structured data, and the agent reads that same Markdown.

## The seven rules

1. **Production rules.** What is in production is documented as it is. The system does not describe an ideal: it describes the code. What does not exist yet is marked with its status.
2. **Everything has a status.** Each entry and each platform say whether they are in exploration, in development, in production or deprecated. An agent only uses what is in production unless asked otherwise.
3. **The link is checked, not promised.** Each entry in production declares its sources (file and classes). The sync computes a fingerprint and warns when the code changes. A link nobody checks ends up lying.
4. **Judgment in prose, mechanics in code.** Judgment (when to use something, and why) is written down. What is repeatable (values, classes, checks) is generated or validated by a script.
5. **Observable rules.** Write “a single filled button per group”, which can be checked, not “give it more room to breathe”, which cannot.
6. **Anti-patterns have names.** Naming a common mistake (“double primary”, “class synonyms”) lets an agent recognize it and avoid it.
7. **If it is not documented, it is not invented.** When there is a gap, the agent says so and proposes an entry in exploration. It would rather leave something blank than fill it with a guess.

## What changes compared with a classic design system

| Classic | Agentic-first |
| --- | --- |
| Documentation in a separate tool | Markdown in the repo, served as a website and as `.md` |
| Updated when someone remembers | The sync detects every change in production |
| Examples recreated by hand | Live examples that load the real production CSS |
| New and published work live together with no distinction | Statuses per entry and per platform, and initiatives |
| Read by a person | Read by people and agents: `llms.txt`, `design.md`, `registry.json` |

## Origin

This methodology comes from the first system we built with it (October 2026) and is meant to be replicated in any product. The decisions and their reasons are in the [kit decisions](https://github.com/imandresochoa/ds/blob/main/docs/DECISIONES.md).
