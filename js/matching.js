// LOST AND FOUND - Matching Algorithm for Lost & Found items
// Uses transparent weighted scoring:
// Category: 30 pts, Item Name: 30 pts, Location: 20 pts, Description: 10 pts, Date proximity: 10 pts

export function calculateMatchScore(itemA, itemB) {
  // If reports are of the same type (both lost or both found), no match
  if (itemA.report_type === itemB.report_type) return 0;
  // If either report is already resolved or returned, do not match
  if (itemA.status === "Resolved" || itemB.status === "Resolved") return 0;

  let score = 0;

  // 1. Category match (30 pts)
  if (itemA.category && itemB.category && itemA.category.toLowerCase() === itemB.category.toLowerCase()) {
    score += 30;
  }

  // 2. Item name similarity (up to 30 pts)
  const nameA = (itemA.item_name || "").toLowerCase().trim();
  const nameB = (itemB.item_name || "").toLowerCase().trim();
  
  if (nameA === nameB) {
    score += 30;
  } else {
    const wordsA = nameA.split(/\s+/).filter(w => w.length > 2);
    const wordsB = nameB.split(/\s+/).filter(w => w.length > 2);
    let commonWords = 0;
    wordsA.forEach(w => {
      if (wordsB.some(wb => wb.includes(w) || w.includes(wb))) {
        commonWords++;
      }
    });
    if (wordsA.length > 0 && commonWords > 0) {
      score += Math.min(30, Math.round((commonWords / Math.max(wordsA.length, wordsB.length)) * 30));
    }
  }

  // 3. Location match (20 pts)
  if (itemA.location && itemB.location && itemA.location.toLowerCase() === itemB.location.toLowerCase()) {
    score += 20;
  }

  // 4. Description keyword similarity (up to 10 pts)
  const descA = (itemA.description || "").toLowerCase();
  const descB = (itemB.description || "").toLowerCase();
  const descWordsA = descA.split(/\W+/).filter(w => w.length > 3);
  const descWordsB = descB.split(/\W+/).filter(w => w.length > 3);
  let matchedDescWords = 0;
  descWordsA.forEach(w => {
    if (descWordsB.includes(w)) matchedDescWords++;
  });
  if (matchedDescWords > 0) {
    score += Math.min(10, matchedDescWords * 3);
  }

  // 5. Date proximity (up to 10 pts, within 5 days)
  if (itemA.date_lost_or_found && itemB.date_lost_or_found) {
    const dateA = new Date(itemA.date_lost_or_found).getTime();
    const dateB = new Date(itemB.date_lost_or_found).getTime();
    const diffDays = Math.abs(dateA - dateB) / (1000 * 3600 * 24);
    if (diffDays <= 1) {
      score += 10;
    } else if (diffDays <= 3) {
      score += 7;
    } else if (diffDays <= 7) {
      score += 4;
    }
  }

  return Math.min(100, score);
}

export function findMatchesForReport(targetReport, allReports, threshold = 40) {
  const matches = [];
  allReports.forEach(item => {
    if (item.id === targetReport.id) return;
    const score = calculateMatchScore(targetReport, item);
    if (score >= threshold) {
      matches.push({
        item,
        score,
        categoryMatch: targetReport.category === item.category,
        locationMatch: targetReport.location === item.location
      });
    }
  });

  return matches.sort((a, b) => b.score - a.score);
}
