// Farmer Jed, the chaser. He never leaves the left edge: his gap behind the
// turkey is the real danger meter. Hits close the gap; clean running, corn and
// dashes push him back. Gap <= catch gap means caught.

function createFarmer() {
  return { gap: RUN.farmerStartGap, runPhase: 0, angry: 0 };
}

function farmerX(turkeyX, gap) {
  return turkeyX - gap;
}
