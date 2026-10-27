// Automated Unit and Workflow Tests for LOST AND FOUND Core Logic
import { calculateMatchScore, findMatchesForReport } from '../js/matching.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`\x1b[32m✔ PASS:\x1b[0m ${message}`);
    passed++;
  } else {
    console.error(`\x1b[31m✖ FAIL:\x1b[0m ${message}`);
    failed++;
  }
}

console.log("=== RUNNING LOST AND FOUND TEST SUITE ===\n");

// TEST 1: Same report type should not match (both lost)
const lostA = {
  id: "1",
  report_type: "lost",
  item_name: "Black Leather Wallet",
  category: "Wallets",
  location: "Library",
  date_lost_or_found: "2026-10-18",
  status: "Active"
};

const lostB = {
  id: "2",
  report_type: "lost",
  item_name: "Black Leather Wallet",
  category: "Wallets",
  location: "Library",
  date_lost_or_found: "2026-10-18",
  status: "Active"
};

assert(calculateMatchScore(lostA, lostB) === 0, "Same report type (lost-lost) returns 0 match score");

// TEST 2: Resolved item should not be matched
const foundResolved = {
  id: "3",
  report_type: "found",
  item_name: "Black Leather Wallet",
  category: "Wallets",
  location: "Library",
  date_lost_or_found: "2026-10-18",
  status: "Resolved"
};

assert(calculateMatchScore(lostA, foundResolved) === 0, "Resolved reports return 0 match score");

// TEST 3: High match detection across Category, Name, Location, Date
const foundMatch = {
  id: "4",
  report_type: "found",
  item_name: "Black Leather Wallet",
  category: "Wallets",
  location: "Library",
  date_lost_or_found: "2026-10-18",
  status: "Active"
};

const highMatchScore = calculateMatchScore(lostA, foundMatch);
assert(highMatchScore >= 80, `High similarity item scored ${highMatchScore}% (>= 80%)`);

// TEST 4: Date proximity and word overlap
const foundPartial = {
  id: "5",
  report_type: "found",
  item_name: "Slim Leather Wallet found",
  category: "Wallets",
  location: "Library",
  date_lost_or_found: "2026-10-19",
  status: "Active"
};

const partialScore = calculateMatchScore(lostA, foundPartial);
assert(partialScore >= 60, `Partial similarity item scored ${partialScore}% (>= 60%)`);

// TEST 5: Match finding function filtering
const allList = [lostB, foundResolved, foundMatch, foundPartial];
const matches = findMatchesForReport(lostA, allList, 40);
assert(matches.length === 2, `findMatchesForReport returned 2 active matches (found: ${matches.length})`);
assert(matches[0].item.id === "4", "Top match is the exact item");

console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
