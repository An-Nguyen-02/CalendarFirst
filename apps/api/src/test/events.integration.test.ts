/**
 * Integration tests for events API (Day 5).
 * Run: npm run test (from apps/api). Requires: db migrated, seeded, and supertest installed.
 */
import assert from "node:assert";
import test from "node:test";
import request from "supertest";
import { app } from "../app.js";

const DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";
const DEMO_EVENT_PUBLISHED_ID = "00000000-0000-0000-0000-000000000002";
const DEMO_EVENT_DRAFT_ID = "00000000-0000-0000-0000-000000000003";

test("health returns 200", async () => {
  const res = await request(app).get("/health");
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body?.status, "ok");
});

test("login returns accessToken and user", async () => {
  const res = await request(app)
    .post("/auth/login")
    .send({ email: "demo@calsync.test", password: "demo1234" });
  assert.strictEqual(res.status, 200);
  assert.ok(res.body?.accessToken);
  assert.strictEqual(res.body?.user?.email, "demo@calsync.test");
});

test("GET /events (public) returns only published events", async () => {
  const res = await request(app).get("/events");
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body?.events));
  const ids = (res.body.events as { id: string }[]).map((e) => e.id);
  assert.ok(ids.includes(DEMO_EVENT_PUBLISHED_ID), "published event should be in list");
  assert.ok(!ids.includes(DEMO_EVENT_DRAFT_ID), "draft event should not be in public list");
});

test("GET /events/:eventId (public) returns published event", async () => {
  const res = await request(app).get(`/events/${DEMO_EVENT_PUBLISHED_ID}`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body?.id, DEMO_EVENT_PUBLISHED_ID);
  assert.strictEqual(res.body?.status, "PUBLISHED");
});

test("GET /events/:eventId (public) returns 404 for draft event", async () => {
  const res = await request(app).get(`/events/${DEMO_EVENT_DRAFT_ID}`);
  assert.strictEqual(res.status, 404);
});

test("GET /orgs/:orgId/events without auth returns 401", async () => {
  const res = await request(app).get(`/orgs/${DEMO_ORG_ID}/events`);
  assert.strictEqual(res.status, 401);
});

test("organizer: list org events, create, update, delete", async () => {
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email: "demo@calsync.test", password: "demo1234" });
  assert.strictEqual(loginRes.status, 200);
  const token = loginRes.body.accessToken as string;

  const listRes = await request(app)
    .get(`/orgs/${DEMO_ORG_ID}/events`)
    .set("Authorization", `Bearer ${token}`);
  assert.strictEqual(listRes.status, 200);
  assert.ok(Array.isArray(listRes.body?.events));
  const hasDraft = (listRes.body.events as { status: string }[]).some((e) => e.status === "DRAFT");
  const hasPublished = (listRes.body.events as { status: string }[]).some((e) => e.status === "PUBLISHED");
  assert.ok(hasDraft && hasPublished, "organizer should see both draft and published");

  const createRes = await request(app)
    .post(`/orgs/${DEMO_ORG_ID}/events`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "New Test Event",
      startAt: new Date(Date.now() + 86400000).toISOString(),
      endAt: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    });
  assert.strictEqual(createRes.status, 201);
  assert.strictEqual(createRes.body?.title, "New Test Event");
  assert.strictEqual(createRes.body?.orgId, DEMO_ORG_ID);
  assert.strictEqual(createRes.body?.status, "DRAFT");
  const newId = createRes.body.id as string;

  const updateRes = await request(app)
    .patch(`/orgs/${DEMO_ORG_ID}/events/${newId}`)
    .set("Authorization", `Bearer ${token}`)
    .send({ status: "PUBLISHED" });
  assert.strictEqual(updateRes.status, 200);
  assert.strictEqual(updateRes.body?.status, "PUBLISHED");

  const publicGetRes = await request(app).get(`/events/${newId}`);
  assert.strictEqual(publicGetRes.status, 200, "published event should be visible publicly");

  const deleteRes = await request(app)
    .delete(`/orgs/${DEMO_ORG_ID}/events/${newId}`)
    .set("Authorization", `Bearer ${token}`);
  assert.strictEqual(deleteRes.status, 204);

  const afterDelete = await request(app).get(`/events/${newId}`);
  assert.strictEqual(afterDelete.status, 404);
});

test("create event with endAt before startAt returns 400", async () => {
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email: "demo@calsync.test", password: "demo1234" });
  const token = loginRes.body.accessToken as string;
  const res = await request(app)
    .post(`/orgs/${DEMO_ORG_ID}/events`)
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Bad dates",
      startAt: new Date(Date.now() + 86400000).toISOString(),
      endAt: new Date(Date.now()).toISOString(),
    });
  assert.strictEqual(res.status, 400);
  assert.ok(res.body?.error);
});
