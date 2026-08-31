# Colist

Shared shopping lists. Single context; terms sharpened by grilling sessions ([domain model v2](.scratch/colist-v2-rebuild/issues/10-domain-model-v2.md)).

## Language

**User**:
A person with an account. Name, email, and picture live on the account itself.
_Avoid_: profile

**List**:
A shopping list, shared by its Members.

**Item**:
One thing to buy on a List. May be checked (bought) and may belong to one Category of the same List.

**Category**:
A named grouping of Items within a single List. An Item's Category always belongs to the Item's List.

**Membership**:
The relation between a User and a List, carrying a role (owner or member).
_Avoid_: member (for the relation itself)

**Member**:
A User holding a Membership on a List. Members read and write the List's content and may rename it.

**Owner**:
The single Member whose Membership role is `owner`. Only the Owner deletes the List or manages Memberships. When the Owner leaves, the longest-standing Member is promoted; the List dies when its last Member leaves.

**Activity**:
An append-only record of a mutation on a List (who did what to what), denormalized so it outlives the thing it describes. Timestamped when the server records it, not when the user acted (offline actions date from sync). Rendered into a sentence by the client, per locale.
_Avoid_: history entry, event

**Feedback**:
A message a User sends the maintainer, with optional 1–5 rating and file attachments.

**Error report**:
A record of something that broke. Either User-written (description, optional attachments, consent flag for follow-up contact) or auto-captured by the client from an uncaught error, in which case there is no description — only the captured error.
