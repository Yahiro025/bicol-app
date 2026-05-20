# Post-Audit Verification Plan

This file serves as a persistent guide and plan. Since auditing 3,609 words will take several weeks of gradual review, you can pause, resume, and manage the process using this guide. 

Once you have completed the entire audit, simply tell me: **"Proceed with the post-audit verification plan in POST_AUDIT_PLAN.md"**, and I will execute the final automated cleanup and verification steps listed below.

---

## 🗂️ How to Manage Your Audit Progress

### 1. Running & Resuming the Auditor
To run or resume the auditor at any time, open your terminal in the project root and run:
```bash
bun scripts/interactive_purge.ts
```

### 2. How Progress is Saved
Your progress is written to disk **instantly** after every single word classification:
* **Kept Words** are appended to `data/audit_progress.json` (these will be skipped automatically on subsequent runs).
* **Purged Words** are queued in `data/purge_queue.json`. When the script boots up, it automatically deletes these queued words from the database first, so they are cleanly purged.

### 3. Pausing the Audit
To pause, simply press `Ctrl + C` in your terminal or close the terminal window. Your progress is 100% saved, and you will not have to re-audit any words you already reviewed.

---

## 🚀 Post-Audit Verification Steps (To Be Executed by Antigravity)

When you complete the audit and tell me to proceed, I will automatically execute these steps:

### Step 1: Database Integrity & Count Audit
* Query the database to verify the final clean state of both the legacy `Word` table and the normalized `Root` table.
* Ensure all related records (Definitions, Conjugations, Example Sentences) were successfully deleted via cascades.
* Provide you with a detailed statistical summary of the authentic Bikol words remaining in your dictionary.

### Step 2: Codebase Hygiene & Cleanup
* Safely remove the temporary auditing script:
  * Delete `scripts/interactive_purge.ts`
* Remove temporary progress tracking files to keep the repository pristine:
  * Delete `data/audit_progress.json`
  * Delete `data/purge_queue.json`
* Keep the main codebase perfectly clean of scratch utilities.

### Step 3: Production Build Validation
* Run the Next.js production build compiler:
  ```bash
  bun run build
  ```
* Verify that all static page generation, dynamic routing, and components compile with **zero errors or warnings** now that the incorrect words have been purged.

### Step 4: Final Walkthrough Document
* Generate a comprehensive `walkthrough.md` in the brain artifacts to record the complete history, metrics, and success criteria of this long-term linguistic cleanup project.
