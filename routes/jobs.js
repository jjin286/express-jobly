"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobGetAllSchema = require("../schemas/jobGetAll.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 * TODO: specificy input and out
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { job }
 * where job is like
 * { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    jobNewSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.create(req.body);
  return res.status(201).json({ job });
});

/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
 *
 * Can filter on provided search filters in query params:
 * - title [string]
 * - minSalary [integer]
 * - hasEquity [boolean]
 *
 * Authorization required: none
 */


router.get("/", async function (req, res, next) {
  const query = req.query;

  if (query.minSalary) {
    query.minSalary = Number(query.minSalary);
  }
  if (query.hasEquity === "true") {
    query.hasEquity = true;
  }
  // TODO: explain ambiguos code
  if (query.hasEquity === "false") {
    delete query.hasEquity;
  }

  const validator = jsonschema.validate(
    query,
    jobGetAllSchema,
    { required: true }
  );

  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const jobs = await Job.findAll(query);

  return res.json({ jobs: jobs });
});

/** GET /[id]  =>  { job }
 *
 * Returns { job } where job is
 * like { id, title, salary, equity, companyHandle }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  const job = await Job.get(req.params.id);
  return res.json({ job });
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { job } where job is like
 * { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    jobUpdateSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.update(req.params.id, req.body);
  return res.json({ job });
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: admin
 */

router.delete(
  "/:id",
  ensureLoggedIn,
  ensureAdmin,
  async function (req, res, next) {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
});


module.exports = router;