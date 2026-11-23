import { asc, eq, isNotNull } from "drizzle-orm";
import type { RichTextDocument } from "../../lib/rich-text";
import type { AppDatabase } from "../database/index.server";
import { buildReorderQuery, nextSortOrder } from "../database/ordering.server";
import { teamMember } from "../database/schema.server";

type TeamMemberDetails = { name: string; pronouns: string | null };

const DISPLAY_ORDER = [asc(teamMember.sortOrder), asc(teamMember.id)];

/** What the admin list shows; bios stay in the database. */
const TEAM_MEMBER_SUMMARY = {
  id: teamMember.id,
  name: teamMember.name,
  pronouns: teamMember.pronouns,
  draftContent: teamMember.draftContent,
  draftUpdatedAt: teamMember.draftUpdatedAt,
  publishedContent: teamMember.publishedContent,
  publishedAt: teamMember.publishedAt,
};

/** Returned by writes: enough to name them in a toast. */
const TEAM_MEMBER_REFERENCE = { id: teamMember.id, name: teamMember.name };

export class TeamRepository {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  /** Everyone, in order, with their draft and published bios. */
  public listTeamMembers() {
    return this.db
      .select(TEAM_MEMBER_SUMMARY)
      .from(teamMember)
      .orderBy(...DISPLAY_ORDER);
  }

  /** The people /about lists: those with a published bio, in order. */
  public listPublishedTeamMembers() {
    return this.db
      .select({
        id: teamMember.id,
        name: teamMember.name,
        pronouns: teamMember.pronouns,
        bio: teamMember.publishedContent,
      })
      .from(teamMember)
      .where(isNotNull(teamMember.publishedContent))
      .orderBy(...DISPLAY_ORDER);
  }

  public async getTeamMember(id: string) {
    const rows = await this.db
      .select()
      .from(teamMember)
      .where(eq(teamMember.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  /** Adds someone at the end of the list, with no bio yet. */
  public async createTeamMember(details: TeamMemberDetails) {
    const rows = await this.db
      .insert(teamMember)
      .values({
        ...details,
        sortOrder: nextSortOrder(teamMember, teamMember.sortOrder),
      })
      .returning(TEAM_MEMBER_REFERENCE);
    return rows[0];
  }

  public async updateTeamMember(id: string, details: TeamMemberDetails) {
    const rows = await this.db
      .update(teamMember)
      .set(details)
      .where(eq(teamMember.id, id))
      .returning(TEAM_MEMBER_REFERENCE);
    return rows[0] ?? null;
  }

  public async deleteTeamMember(id: string) {
    const rows = await this.db
      .delete(teamMember)
      .where(eq(teamMember.id, id))
      .returning(TEAM_MEMBER_REFERENCE);
    return rows[0] ?? null;
  }

  /** Sets `sort_order` to each id's index in `ids`. */
  public async reorderTeamMembers(ids: string[]) {
    if (!ids.length) return;
    await this.db.execute(
      buildReorderQuery(teamMember, teamMember.id, ids, undefined, "uuid"),
    );
  }

  /** Saves the draft bio. What /about shows is unchanged. */
  public async saveBioDraft(id: string, content: RichTextDocument) {
    const rows = await this.db
      .update(teamMember)
      .set({ draftContent: content, draftUpdatedAt: new Date() })
      .where(eq(teamMember.id, id))
      .returning();
    return rows[0] ?? null;
  }

  /** Saves `content` as the draft and publishes it, listing them on /about. */
  public async publishBio(id: string, content: RichTextDocument) {
    const now = new Date();
    const rows = await this.db
      .update(teamMember)
      .set({
        draftContent: content,
        draftUpdatedAt: now,
        publishedContent: content,
        publishedAt: now,
      })
      .where(eq(teamMember.id, id))
      .returning();
    return rows[0] ?? null;
  }

  /** Takes them off /about; the draft bio is kept. */
  public async unpublishBio(id: string) {
    const rows = await this.db
      .update(teamMember)
      .set({ publishedContent: null, publishedAt: null })
      .where(eq(teamMember.id, id))
      .returning();
    return rows[0] ?? null;
  }
}
