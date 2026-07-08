/* routes/markirovka.js — expose mark verification to the panel. */
const express = require("express");
const { protect, requireActiveSub } = require("../auth");
const { verifyMark } = require("../integrations/markirovka");
const router = express.Router();
router.use(protect); router.use(requireActiveSub);

router.post("/verify", async (req, res) => {
  const r = await verifyMark(req.body?.code);
  res.json(r);
});
module.exports = router;
