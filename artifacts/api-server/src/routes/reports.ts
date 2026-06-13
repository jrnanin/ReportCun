import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, reportsTable } from "@workspace/db";
import {
  ListReportsQueryParams,
  CreateReportBody,
  GetReportByFolioParams,
  GetReportParams,
  UpdateReportStatusParams,
  UpdateReportStatusBody,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const CATEGORY_RESPONSE_HOURS: Record<string, number> = {
  water: 24,
  pothole: 7 * 24,
  lighting: 48,
  security: 1,
  waste: 72,
};

function generateFolio(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `RM-${year}${month}${day}-${random}`;
}

router.get("/reports", async (req, res): Promise<void> => {
  const params = ListReportsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  let query = db
    .select()
    .from(reportsTable)
    .orderBy(desc(reportsTable.createdAt))
    .$dynamic();

  if (params.data.category) {
    query = query.where(eq(reportsTable.category, params.data.category));
  }

  if (params.data.limit) {
    query = query.limit(params.data.limit);
  }

  if (params.data.offset) {
    query = query.offset(params.data.offset);
  }

  const reports = await query;
  res.json(reports);
});

router.post("/reports", async (req, res): Promise<void> => {
  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const folio = generateFolio();
  const estimatedResponseHours =
    CATEGORY_RESPONSE_HOURS[parsed.data.category] ?? null;

  const [report] = await db
    .insert(reportsTable)
    .values({
      folio,
      category: parsed.data.category,
      description: parsed.data.description,
      status: "pending",
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      address: parsed.data.address,
      photoUrls: parsed.data.photoUrls ?? [],
      reporterName: parsed.data.reporterName ?? null,
      reporterPhone: parsed.data.reporterPhone ?? null,
      reporterEmail: parsed.data.reporterEmail ?? null,
      estimatedResponseHours,
    })
    .returning();

  req.log.info({ folio, category: parsed.data.category }, "Report created");
  res.status(201).json(report);
});

router.get("/reports/folio/:folio", async (req, res): Promise<void> => {
  const params = GetReportByFolioParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [report] = await db
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.folio, params.data.folio));

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  res.json(report);
});

router.get("/reports/:id", async (req, res): Promise<void> => {
  const params = GetReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [report] = await db
    .select()
    .from(reportsTable)
    .where(eq(reportsTable.id, params.data.id));

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  res.json(report);
});

router.patch("/reports/:id", async (req, res): Promise<void> => {
  const params = UpdateReportStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateReportStatusBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {
    status: body.data.status,
  };
  if (body.data.notes !== undefined) {
    updateData.notes = body.data.notes;
  }

  const [report] = await db
    .update(reportsTable)
    .set(updateData)
    .where(eq(reportsTable.id, params.data.id))
    .returning();

  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  req.log.info({ id: params.data.id, status: body.data.status }, "Report status updated");
  res.json(report);
});

router.get("/stats", async (_req, res): Promise<void> => {
  const allReports = await db.select().from(reportsTable);

  const total = allReports.length;
  const pending = allReports.filter((r) => r.status === "pending").length;
  const inProgress = allReports.filter((r) => r.status === "in_progress").length;
  const resolved = allReports.filter((r) => r.status === "resolved").length;

  const categories = ["water", "pothole", "lighting", "security", "waste"];
  const byCategory = categories.map((cat) => {
    const catReports = allReports.filter((r) => r.category === cat);
    return {
      category: cat,
      count: catReports.length,
      pending: catReports.filter((r) => r.status === "pending").length,
      inProgress: catReports.filter((r) => r.status === "in_progress").length,
      resolved: catReports.filter((r) => r.status === "resolved").length,
    };
  });

  res.json({ total, pending, inProgress, resolved, byCategory });
});

router.get("/stats/recent", async (req, res): Promise<void> => {
  const limitRaw = req.query.limit;
  const limit =
    limitRaw && !isNaN(Number(limitRaw)) ? Number(limitRaw) : 10;

  const reports = await db
    .select()
    .from(reportsTable)
    .orderBy(desc(reportsTable.createdAt))
    .limit(limit);

  res.json(reports);
});

export default router;
