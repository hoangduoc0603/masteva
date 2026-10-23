/**
 * Chạy ví dụ Java của bài đọc và so với output ghi trong bài (content-standard §3.3, §5).
 *
 *   tsx scripts/run-code.ts              mọi bài đọc
 *   tsx scripts/run-code.ts sb1 j5.3     chỉ các chặng, các bài này (mã chặng như sb1 hoặc j11, hoặc mã bài)
 *
 * Mỗi ví dụ chạy bằng `java <file>` trong một thư mục tạm riêng, gộp stdout và stderr theo đúng thứ tự in.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { splitFrontmatter } from '../src/lib/content/extract';
import { compareOutput, extractJavaExamples, type JavaExample } from '../src/lib/content/examples';
import { loadLessonFiles, loadSteps } from '../src/lib/content/repo';

interface Frontmatter {
  id?: string;
  kind?: string;
  verified?: { tools?: Record<string, string | number> };
}

const filters = process.argv.slice(2).map((f) => f.toLowerCase());
const steps = loadSteps();
// Chặng nhận cả tên thư mục (j11) lẫn mã hiển thị (SB1): sáu chặng Spring Boot nằm trong thư mục mang mã j.
const wanted = (id: string, stepId: string) =>
  filters.length === 0 ||
  filters.some((f) => f === id || f === stepId || f === steps.get(stepId)?.code.toLowerCase());

const javaVersion = (() => {
  const result = spawnSync('java', ['-version'], { encoding: 'utf8' });
  return /version "([^"]+)"/.exec(`${result.stderr}${result.stdout}`)?.[1];
})();
if (!javaVersion) {
  console.error('✗ Không tìm thấy lệnh java.');
  process.exit(1);
}

function run(example: JavaExample): { output: string; status: number | null } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'masteva-run-'));
  try {
    fs.writeFileSync(path.join(dir, example.fileName), example.code);
    // sh gộp stderr vào stdout để giữ thứ tự in giữa dòng in thường và stack trace.
    const result = spawnSync('sh', ['-c', 'java "$0" 2>&1', example.fileName], {
      cwd: dir,
      encoding: 'utf8',
      timeout: 60_000,
    });
    return { output: result.stdout ?? '', status: result.status };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

let failures = 0;
let total = 0;
let lessons = 0;
for (const file of loadLessonFiles()) {
  if (file.lang !== 'vi') continue;
  const { data, body } = splitFrontmatter(file.raw);
  const fm = data as Frontmatter;
  if (fm.kind !== 'reading' || !fm.id || !wanted(fm.id, file.stepId)) continue;

  lessons++;
  const offset = file.raw.slice(0, file.raw.length - body.length).split('\n').length - 1;
  const examples = extractJavaExamples(body, offset);
  const relative = path.relative(process.cwd(), file.file);
  const declared = fm.verified?.tools?.java;
  console.log(`\n${fm.id} (${relative}): ${examples.length} ví dụ`);
  if (declared !== undefined && String(declared) !== javaVersion) {
    console.log(`  ! bài ghi java ${declared}, máy đang chạy java ${javaVersion}`);
  }

  for (const example of examples) {
    total++;
    const where = `${relative}:${example.line}`;
    const { output, status } = run(example);
    if (example.expected === undefined) {
      if (status === 0) console.log(`  ✓ ${where} chạy được (không có output để so)`);
      else {
        failures++;
        console.log(`  ✗ ${where} thoát với mã ${status}, bài không ghi output:\n${indent(output)}`);
      }
      continue;
    }
    if (example.varies) {
      console.log(`  ~ ${where} output đổi giữa các lần chạy, chỉ chạy:\n${indent(output)}`);
      continue;
    }
    const comparison = compareOutput(output, example.expected);
    if (comparison.match) {
      console.log(`  ✓ ${where}`);
    } else {
      failures++;
      console.log(`  ✗ ${where} lệch ở dòng ${comparison.line} của output`);
      console.log(`      bài ghi: ${comparison.expected ?? '(không có dòng này)'}`);
      console.log(`      chạy ra: ${comparison.actual ?? '(không có dòng này)'}`);
    }
  }
}

function indent(text: string): string {
  return text
    .trimEnd()
    .split('\n')
    .map((line) => `      ${line}`)
    .join('\n');
}

if (lessons === 0) console.log(`Không có bài đọc nào khớp ${filters.join(', ') || '(mọi bài)'}.`);
console.log(`\njava ${javaVersion}: ${lessons} bài, ${total} ví dụ, ${failures} lỗi.`);
if (failures > 0) process.exit(1);
