# Security Specification: Shree Ganesh Flex ERP

## Data Invariants
1. **Ownership Integrity**: Every document in `bills`, `services`, `expenses`, and `personalTransactions` MUST have a `userId` field that strictly matches the authenticated user's UID.
2. **Subscription Isolation**: A user can only access their own subscription document at `subscriptions/{userId}`.
3. **Immutability**: `createdAt` and `userId` fields cannot be changed after creation.
4. **Validation**: All numeric fields (amount, rate, quantity) must be positive. Document IDs must be alphanumeric.

## The Dirty Dozen Payloads (Target: Access Denied)
1. **Identity Spoofing**: Creating a bill with `userId: "attacker_id"` while authenticated as `user_id`.
2. **Accessing Forbidden PII**: Unauthenticated user trying to `get` a subscription document.
3. **Cross-Tenant Read**: User A trying to `list` bills where `userId == UserB`.
4. **Cross-Tenant Write**: User A trying to `update` a bill belonging to User B.
5. **Update Gap**: Updating a bill and trying to change the `userId` to someone else.
6. **Shadow Field Injection**: Adding `isAdmin: true` to a service document.
7. **Resource Poisoning**: Sending a `customerName` string of 1MB.
8. **Orphaned Write**: Submitting a bill with a non-existent `userId`.
9. **State Shortcutting**: Manually setting a bill's `totalAmount` to 0 despite having items.
10. **ID Poisoning**: Using a 2KB string as a document ID.
11. **PII Leak**: Listing all `subscriptions` as a regular user.
12. **Query Scraping**: Listing `bills` without filtering by `userId` in the query.

## Test Runner (Logic Verification)
The `firestore.rules` will be verified against these scenarios using ESLint and manual logic check.
