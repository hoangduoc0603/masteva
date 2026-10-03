/**
 * Kiểm tra nội dung (architecture §10) và cập nhật file khoá mã.
 *
 *   tsx scripts/content.ts check           chỉ kiểm tra
 *   tsx scripts/content.ts check --write   kiểm tra rồi thêm mã mục, mã chủ đề, mã mốc mới vào content/ids.lock.json
 */
import { checkContent, loadLock, updateLock } from '../src/lib/content/repo';

const write = process.argv.includes('--write');
const report = checkContent();

if (report.errors.length > 0) {
  console.error(`✗ Nội dung có ${report.errors.length} lỗi:`);
  for (const error of report.errors) console.error(`  - ${error}`);
  process.exit(1);
}

const summary = `${report.currentIds.size} mã mục, ${report.currentTopics.size} mã chủ đề, ${report.currentMilestones.size} mã mốc`;
if (write) {
  const added = updateLock(report);
  console.log(`✓ Nội dung hợp lệ. ${summary}; thêm ${added.ids} mục, ${added.topics} chủ đề, ${added.milestones} mốc vào ids.lock.json.`);
} else {
  const lock = loadLock();
  const unlocked =
    [...report.currentIds].filter((id) => !lock.ids.includes(id)).length +
    [...report.currentTopics].filter((id) => !lock.topics.includes(id)).length +
    [...report.currentMilestones].filter((id) => !lock.milestones.includes(id)).length;
  console.log(`✓ Nội dung hợp lệ. ${summary}.`);
  if (unlocked > 0) console.log(`  ${unlocked} mã chưa có trong ids.lock.json; chạy "pnpm content:lock" để thêm.`);
}
