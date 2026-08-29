# 21 - Code Review Protocol & Multi-Agent Quality Rubric

This protocol defines the review standards applied by team members and coding agents before merging pull requests.

---

## 1. Code Review Dimensions

### Dimension 1: Architectural Standards & Deep Modules
- [ ] Does this PR adhere to deep module principles (a lot of behavior behind a small interface)?
- [ ] Are internal details hidden behind the module seam?
- [ ] Does it respect the 3-developer directory ownership boundaries without cross-domain pollution?

### Dimension 2: Specification & Invariant Compliance
- [ ] Does the implementation match the contract defined in `shared/openapi.json`?
- [ ] Are mathematical invariants strictly maintained (penny conservation, net balance zero-sum)?
- [ ] Are edge cases tested (zero amount, single roommate, large decimals)?

### Dimension 3: Operational Utility & Autonomous Execution
- [ ] Does the agent act autonomously on scheduled triggers without requiring manual human clicks?
- [ ] Are all autonomous actions logged to the `AgentActivityLog` for hackathon visibility?

---

## 2. Review Verdict Categories
- **`APPROVED`**: Fully compliant with deep module design, tests passing, zero conflict.
- **`REQUEST_CHANGES`**: Leaky module seam, broken schema contract, missing test case, or directory boundary violation.
