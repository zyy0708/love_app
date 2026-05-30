import { run, get, all } from '../config/db.js';

export async function generateAISummary(entries) {
  try {
    const entryCount = entries.length;
    const moods = entries.map(e => e.mood).filter(Boolean);
    const moodCount = {};
    
    moods.forEach(mood => {
      moodCount[mood] = (moodCount[mood] || 0) + 1;
    });

    const topMood = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0];
    
    let summary = `本周共写了 ${entryCount} 篇日记。`;
    if (topMood) {
      summary += `最常见的心情是"${topMood[0]}"。`;
    }
    
    return summary;
  } catch (error) {
    console.error('AI summary generation error:', error);
    return null;
  }
}

export async function cacheAISummary(coupleId, summaryType, period, content, entryIds) {
  const entryIdsJson = JSON.stringify(entryIds);
  
  const existing = get(
    'SELECT id FROM ai_summaries WHERE couple_id = ? AND summary_type = ? AND period = ?',
    [coupleId, summaryType, period]
  );
  
  if (existing) {
    await run(
      'UPDATE ai_summaries SET content = ?, entry_ids = ?, created_at = NOW() WHERE id = ?',
      [content, entryIdsJson, existing.id]
    );
  } else {
    await run(
      'INSERT INTO ai_summaries (couple_id, summary_type, period, content, entry_ids) VALUES (?, ?, ?, ?, ?)',
      [coupleId, summaryType, period, content, entryIdsJson]
    );
  }

  return await get(
    'SELECT * FROM ai_summaries WHERE couple_id = ? AND summary_type = ? AND period = ?',
    [coupleId, summaryType, period]
  );
}

export async function getAISummary(coupleId, summaryType, period) {
  return await get(
    'SELECT * FROM ai_summaries WHERE couple_id = ? AND summary_type = ? AND period = ?',
    [coupleId, summaryType, period]
  );
}
