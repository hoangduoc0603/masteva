/**
 * Kiểm tra nội dung (architecture §10) và cập nhật file khoá mã mục.
 *
 *   tsx scripts/content.ts check           chỉ kiểm tra
 *   tsx scripts/content.ts check --write   kiểm tra rồi thêm mã mục mới vào content/ids.lock.json
 */
import { checkContent, loadLock, updateLock } from '../src/lib/content/repo';

const write = process.argv.includes('--write');
const { errors, currentIds } = checkContent();

if (errors.length > 0) {
  console.error(`✗ Nội dung có ${errors.length} lỗi:`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

const locked = new Set(loadLock().ids);
const unlocked = [...currentIds].filter((id) => !locked.has(id));
if (write) {
  const added = updateLock(currentIds);
  console.log(`✓ Nội dung hợp lệ. ${currentIds.size} mã mục; thêm ${added} mã mới vào ids.lock.json.`);
} else {
  console.log(`✓ Nội dung hợp lệ. ${currentIds.size} mã mục.`);
  if (unlocked.length > 0) {
    console.log(`  ${unlocked.length} mã chưa có trong ids.lock.json; chạy "pnpm content:lock" để thêm.`);
  }
}
