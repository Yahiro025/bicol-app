**Bicol-App Comprehensive Social Integration Master Plan**  
This document serves as the complete, multi-phase architectural and product blueprint for transforming the Bicol-App dictionary into a highly engaged, culturally grounded social platform ("Urban Dictionary meets Reddit" for Bicolanos).  
**Target Audience for this Document:** Development agents (Deepseek v4pro for backend/logic, Kimi k2.6 for frontend).  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSPBCj7fFRYQwYwEZiywEZJWQZeZ2ao9AAD+4lyruzq+ngAA8Nr1AMTJBeJDClAyAAAAAElFTkSuQmCC)  
**Phase 1: Word-Specific Threads (The MVP)**  
The immediate goal is to convert dictionary traffic into community engagement by embedding discussions directly under word definitions.  
**Product Scope**  
- **Mini-Threads:** A comment section embedded directly underneath the formal definition of every word in the dictionary.  
- **Threading Model:** Single-level nesting. Users can reply to a top-level comment (like YouTube or Facebook), but replies cannot be nested further.  
- **Dialect Tagging:**  
  - Users set a default dialect in their profile (e.g., *Naga, Legazpi, Rinconada*).  
  - This tag appears next to their name on all comments.  
  - Users can override the tag on an individual comment if they are sharing a variation from a different province.  
**Authentication & Moderation**  
- **Auth Providers:** NextAuth.js (Auth.js) supporting  **Google, Facebook, and Email/Password**. Login is strictly required to post or vote.  
- **Hybrid Moderation:**  
  - *Community-driven:* Comments reaching a threshold of negative votes (e.g., -5 net score) are automatically collapsed/hidden behind a warning toggle.  
  - *Admin-driven:* A "Report" button on all comments feeds into an Admin Dashboard for manual review and user banning.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OQQ2AQBAAsSHhiQI0IWp9ngBsYIEfIWkVdJuZs5oAAPiLe6+O6vp6AgDAa+sBhYwEOqBD7p8AAAAASUVORK5CYII=)  
**Phase 2: The "Ask a Local" Feed**  
Launch a centralized, global feed to validate user-to-user interaction outside of specific dictionary entries.  
**Product Scope**  
- **Translation Requests:** A Q&A style feed where users post "How do I say X in [Dialect]?"  
- **Slang Discovery:** A "Help Define" space where users post native words they heard, and the community debates the meaning.  
- **Dictionary Promotion Flow:** An admin tool to officially promote the most upvoted crowdsourced explanation from the feed directly into the main dictionary database as an official entry.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OUQmAABBAsSeYxZyXSzCJASxgACv4J8KWYMvMbNURAAB/ca7VXe1fTwAAeO16AKe+BdmJqrPdAAAAAElFTkSuQmCC)  
**Phase 3: The Full Community Hub**  
A full-fledged social platform heavily customized for Bicolano culture.  
**Culturally Grounded Spaces (Sub-threads)**  
- **Tigsik:** A dedicated board for traditional Bicolano short poems and witty banter.  
- **Tarabangan:** A community help and support board (the Bicolano *Bayanihan*).  
- **Sili / Kakanin:** A media-rich thread for food debates and regional cuisine.  
**Advanced Features**  
- **Audio and Voice Threads:** Crucial for capturing regional cadence and tone. Allow users to post short audio clips as comments or posts.  
- **Hover-to-Translate / Cross-dialect Dictionary:** When users encounter slang from a different province in the feed, hovering over the word pulls the definition from the Phase 1 dictionary.  
- **Low-Data Mode:** A toggle in settings that strips out images, videos, and heavy animations (similar to Facebook Free Data) to support users in rural areas with spotty internet.  
**Gamification & Retention**  
- **Cultural User Badges:** Reputational ranks based on karma/upvotes. E.g., starting at *Dayo* (Visitor/Outsider) and leveling up to  *Oragon* (Respected Local).  
- **Regional AMAs:** Dedicated UI for "Ask Me Anything" sessions with local figures and diaspora.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OUQmAABBAsSeIWMICprwEpjSIFfwTYUuwZWaO6goAgL+412qrzq8nAAC8tj8tdQNNdXaCdAAAAABJRU5ErkJggg==)  
**Technical Architecture & Guidelines**  
**1. Database Schema (Prisma)**  
Implement the following relational structures to support the rollout:  
model User {  
   id             String    @id @default(cuid())  
   name           String?  
   email          String?   @unique  
   image          String?  
   role           Role      @default(USER) // USER, ADMIN, MODERATOR  
   defaultDialect String?   // e.g., "Naga"  
   reputation     Int       @default(0)    // For Gamification/Badges  
     
   posts          Post[]  
   comments       Comment[]  
   votes          Vote[]  
   reports        Report[]  
 }  
   
 // Phase 2 & 3: Global Feed  
 model Post {  
   id          String   @id @default(cuid())  
   title       String?  
   content     String  
   type        PostType // TRANSLATION_REQUEST, DISCUSSION, TIGSIK, etc.  
   audioUrl    String?  // For Phase 3 voice notes  
   createdAt   DateTime @default(now())  
     
   authorId    String  
   author      User     @relation(fields: [authorId], references: [id])  
     
   wordId      String?  // Optional relation: Links a community post to a dictionary word  
   // word     Word?    @relation(...)  
   
   comments    Comment[]  
   votes       Vote[]  
 }  
   
 // Phase 1: Word-Specific Threads & Phase 2/3 Post replies  
 model Comment {  
   id          String   @id @default(cuid())  
   content     String  
   dialect     String?  // Overrides User default if set  
   createdAt   DateTime @default(now())  
     
   authorId    String  
   author      User     @relation(fields: [authorId], references: [id])  
   
   // A comment must belong to EITHER a Word (Phase 1) OR a Post (Phase 2/3)  
   wordId      String?    
   postId      String?  
   post        Post?    @relation(fields: [postId], references: [id])  
   
   // Single-level nesting  
   parentId    String?  
   parent      Comment?  @relation("CommentReplies", fields: [parentId], references: [id])  
   replies     Comment[] @relation("CommentReplies")  
   
   votes       Vote[]  
   reports     Report[]  
 }  
   
 model Vote {  
   id        String   @id @default(cuid())  
   type      VoteType // UP, DOWN  
   userId    String  
   user      User     @relation(fields: [userId], references: [id])  
     
   // Polymorphic-ish relations for voting  
   postId    String?  
   post      Post?    @relation(fields: [postId], references: [id])  
   commentId String?  
   comment   Comment? @relation(fields: [commentId], references: [id])  
   
   @@unique([userId, commentId])  
   @@unique([userId, postId])  
 }  
   
 model Report {  
   id        String   @id @default(cuid())  
   reason    String  
   resolved  Boolean  @default(false)  
   userId    String  
   user      User     @relation(fields: [userId], references: [id])  
   commentId String?  
   comment   Comment? @relation(fields: [commentId], references: [id])  
 }  
   
 enum Role {  
   USER  
   ADMIN  
   MODERATOR  
 }  
   
 enum PostType {  
   TRANSLATION_REQUEST  
   SLANG_DISCOVERY  
   DISCUSSION  
   TIGSIK  
   FOOD  
 }  
   
 enum VoteType {  
   UP  
   DOWN  
 }  
   
**2. Frontend & UI Directives (For Kimi k2.6)**  
- **Design System:** Utilize  **shadcn/ui** and Tailwind CSS. Ensure the aesthetic feels highly premium, leaning into vibrant cultural colors (e.g., specific Bicolano/Sili reds, rich tropical greens) without feeling like a generic corporate template.  
- **Optimistic UI:** Social interactions *must* feel instantaneous. Use Next.js Server Actions paired with React's useOptimistic hook. When a user upvotes a comment or posts a reply, the UI must update immediately on the client side while the server syncs in the background.  
- **Component Architecture:** Build reusable components for CommentTree, VoteCounter, and DialectBadge so they can be easily shared between the dictionary (Phase 1) and the global feed (Phase 2/3).  
**3. Backend & Logic Directives (For Deepseek v4pro)**  
- **Performance:** Implement cursor-based pagination for loading comments and feed posts to ensure the app scales efficiently.  
- **Security:** Ensure strict server-side validation on Server Actions to prevent unauthorized voting, posting, or deletion.  
- **Reputation Calculation:** Implement a background job or Prisma trigger to calculate user reputation scores based on the sum of their upvotes, which will drive the "Cultural User Badges" system.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNBCUpfD6ZYGZDAgAU2QtIq6DIzW7UHAMBfHGt1V+fXEwAAXrseHCoGAe/SKtAAAAAASUVORK5CYII=)  
**Cold Start & Community Seeding Strategy**  
*(To be executed by the Product Team prior to Phase 2/3 launch)*  
1. **Seed the Content:** Admins will pre-populate 50-100 high-quality, relatable regional posts and debates.  
2. **Recruit the Diaspora:** Target Bicolanos in Manila and abroad as early adopters—they crave hometown nostalgia.  
3. **Onboard Local Creators:** Partner with university meme pages (e.g., Ateneo de Naga) to migrate their audiences.  
4. **Launch Campaigns:** Run a viral contest (e.g., "Spooky Hometown Stories") with GCash rewards to incentivize initial sign-ups and high-effort posts.  
